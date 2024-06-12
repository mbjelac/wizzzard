import Phaser from 'phaser';
import { ALL_THING_PROPERTIES, Level, LevelLocation, Thing } from "../engine/Level";
import { Direction } from "../engine/Direction";
import { TILE_SIZE, tileCenterOffset } from "../config";
import { GAME } from "../engine/game";
import { Coords, Errand, ThingDescription } from "../engine/Errand";
import { AnimationConfig, PlayerDeath, SPRITE_CONFIG_VOID, SPRITE_CONFIG_WIZARD, SPRITE_CONFIGS_BY_LOCATION, SpriteConfig } from "./sprites";
import { clearLabelText, getLabelText } from "./editor-panel";
import depths from "./depths";
import { DialogBox } from "./DialogBox";
import toPixelCoords from "./toPixelCoords";
import Pointer = Phaser.Input.Pointer;
import Sprite = Phaser.Physics.Arcade.Sprite;

const animation1 = "animation1";
const animation2 = "animation2";

function getTileCoords(spriteConfig: SpriteConfig) {

  if (spriteConfig.variants.length === 0) {
    return spriteConfig.tileCoords;
  }

  const randomIndex = Math.floor(Math.random() * (spriteConfig.variants.length + 1)) - 1;

  if (randomIndex === -1) {
    return spriteConfig.tileCoords;
  }

  return spriteConfig.variants[randomIndex];
}

interface AmbientSound {
  readonly name: string;
  readonly sound: Phaser.Sound.BaseSound;
}

export default class LevelGui extends Phaser.Scene {

  // @ts-ignore
  private player: Phaser.Physics.Arcade.Sprite;

  // @ts-ignore
  private sidePanel: Phaser.GameObjects.Sprite;

  // @ts-ignore
  private sideText: Phaser.GameObjects.BitmapText;

  private sideTextString: string = "";

  // @ts-ignore undefined - has to be set before usage (fail fast)
  private level: Level;

  private levelComplete = false;

  private createdNonThings: Sprite[] = [];
  private readonly createdSpritesByThingId: Map<number, Sprite> = new Map();
  private readonly soundEffectsBySpriteName: Map<string, string> = new Map();
  private inventorySprites: Sprite[] = [];

  private readonly tilesetName = "sprites";

  private leftButtonDown: boolean = false;
  private rightButtonDown: boolean = false;

  private ambientSound: AmbientSound | undefined;
  private soundEffectPlayed = false;

  private inputEventsBlocked = false;

  private readonly dialogBox = new DialogBox();

  constructor() {
    super('level');
  }

  preload() {

    this.dialogBox.preload(this);

    this.load.spritesheet(this.tilesetName, "assets/tileset.png", { frameWidth: 16, frameHeight: 16 });
    this.load.image("panel", "assets/panel.png");

    this.load.bitmapFont('blackRobotoMicro', 'assets/fonts/roboto-micro.png', 'assets/fonts/roboto-micro.xml');


    this.load.audio("summerMeadow", "assets/sounds/ambient/summer-meadow.mp3");
    this.load.audio("forest", "assets/sounds/ambient/forest.mp3");
    this.load.audio("undergroundCritters", "assets/sounds/ambient/underground-critters.mp3");

    this.load.audio("grassStep", "assets/sounds/effect/grass-step.mp3");
    this.load.audio("forestStep", "assets/sounds/effect/forest-step.mp3");
    this.load.audio("doorUnlock", "assets/sounds/effect/door-unlock.mp3");
    this.load.audio("pushWood", "assets/sounds/effect/push-wood.mp3");
    this.load.audio("slide1", "assets/sounds/effect/slide-1.mp3");
    this.load.audio("slide2", "assets/sounds/effect/slide-2.mp3");
    this.load.audio("swipe", "assets/sounds/effect/swipe.mp3");

    this.events.on("create", async () => this.populateLevel());
    this.events.on("wake", async () => this.populateLevel());
    this.events.on("sleep", async () => this.clearLevel());
  }

  private async populateLevel() {

    this.clearLevel();

    this.level = await GAME.getCurrentLevel();

    for (const x of Array(this.level.errand.levelDimensions.width).keys()) {
      for (const y of Array(this.level.errand.levelDimensions.height).keys()) {
        this.addLocation(x, y);
      }
    }

    const startCoords: Coords = { x: this.level.errand.startCoords.x, y: this.level.errand.startCoords.y };
    const playerPixelCoords = toPixelCoords(startCoords);

    this.player = this.addSpriteFromTileset("wizard", playerPixelCoords).setDepth(depths.player);

    this.createPlayerAnimation(
      "drowning",
      {
        frameCount: 7,
        framesPerSecond: 10,
        uniformStartFrame: true
      },
      1
    );
    this.createPlayerAnimation(
      "burning",
      {
        frameCount: 7,
        framesPerSecond: 10,
        uniformStartFrame: true
      },
      8
    );

    this.createdNonThings.push(this.player);

    this.displayInventory();

    this.playAmbientSound(this.level.errand.initialAmbientSound);

    this.cameras.main.startFollow(this.player).setFollowOffset(-3 * TILE_SIZE + tileCenterOffset, 0);
  }

  private createPlayerAnimation(playerDeath: PlayerDeath, animationConfig: AnimationConfig, playerTileOffset: number) {
    this.player.anims.create(
      this.getAnimation(
        playerDeath,
        animationConfig,
        getSpriteFrameIndex(SPRITE_CONFIG_WIZARD.tileCoords) + playerTileOffset,
        false
      )
    );
  }

  private playAmbientSound(soundName?: string) {

    if (soundName === undefined || (this.ambientSound !== undefined && this.ambientSound.name === soundName)) {
      return;
    }

    if (this.ambientSound !== undefined) {
      this.ambientSound.sound.stop();
      this.ambientSound.sound.destroy();
    }

    this.ambientSound = {
      name: soundName,
      sound: this.sound.add(soundName, { loop: true })
    };
    this.ambientSound.sound.play();
  }

  private stopPlayingAmbientSound() {
    if (this.ambientSound === undefined) {
      return;
    }

    this.ambientSound.sound.stop();
    this.ambientSound.sound.destroy();
    this.ambientSound = undefined;
  }

  private clearLevel() {

    this.createdNonThings.forEach(createdObject => createdObject.destroy(true));
    this.createdNonThings = [];

    this.createdSpritesByThingId.forEach(sprite => {
      sprite.destroy(true)
    });
    this.createdSpritesByThingId.clear();

    this.sound.stopAll();
  }

  private addLocation(x: number, y: number) {
    const location = this.level.levelLocations[y][x];

    const locationPixelCoords = toPixelCoords({
      x: x,
      y: y
    });

    const voidTile = this.addSpriteFromTileset("void", locationPixelCoords)
      .setDepth(depths.void)
      .setInteractive();

    voidTile.on('pointerup', async (pointer: Pointer) => {
      if (pointer.leftButtonReleased()) {
        this.leftButtonDown = false;
        await this.applyEditorTool(location, locationPixelCoords);
      }
      if (pointer.rightButtonReleased()) {
        this.rightButtonDown = false;
      }
    });
    voidTile.on('pointerdown', async (pointer: Pointer) => {
      if (pointer.leftButtonDown()) {
        this.leftButtonDown = true;
      }
      if (pointer.rightButtonDown()) {
        this.rightButtonDown = true;
      }
    });
    voidTile.on('pointermove', async () => {
      if (this.leftButtonDown) {
        await this.applyEditorTool(location, locationPixelCoords);
      }
      setEditorInfo(JSON.stringify(location.coords));
    });

    this.createdNonThings.push(voidTile);

    location.things.forEach(thing => {
      this.addThingSprite(locationPixelCoords, location, thing);
    });
  }

  private displayInventory() {

    this.inventorySprites.forEach(sprite => sprite.destroy(true));
    this.inventorySprites = [];

    const inventory = this.level.getInventory();

    Array(6).fill(0).forEach((_, index) => {

      const inventoryItem = inventory[index];

      if (inventoryItem === undefined) {
        return;
      }

      const inventorySprite = this.addSpriteFromTileset(inventoryItem.description.sprite, { x: 0, y: 0 }).setDepth(depths.info);
      this.inventorySprites.push(inventorySprite);
    });
  }


  create() {
    console.log("Level create");

    this.dialogBox.create(this);

    this.input.keyboard.on('keydown', async (event: KeyboardEvent) => {

      if (this.inputEventsBlocked) {
        return;
      }

      if (this.dialogBox.isShown()) {
        this.dialogBox.handleKeyInput(event.code);
        return;
      }

      const direction = keyToDirection(event.key);

      if (!!direction) {
        await this.move(direction);
      }

      if (event.code === "Escape") {
        this.dialogBox.show(
          toPixelCoords(this.level.getPlayerCoords()),
          "",
          "Tired already, fellow traveller?",
          true,
          { text: "Leave", keyboardShortcutDescription: "  L", keyEventCode: "KeyL", eventHandler: () => this.exitLevel() },
          { text: "Restart", keyboardShortcutDescription: "  R", keyEventCode: "KeyR", eventHandler: () => this.populateLevel() },
        );
        return;
      }
    });


    this.game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    }

    const sidePanelWidth = 5 * TILE_SIZE;

    this.sideText = this.add
      .bitmapText(0, 0, "blackRobotoMicro", "")
      .setMaxWidth(sidePanelWidth - 60)
      .setScale(4)
      .setDepth(depths.info);

    this.sidePanel = this
      .physics
      .add
      .sprite(0, 0, "panel")
      .setDisplaySize(320, 832)
      .setDepth(depths.infoBackground);

  }

  private exitLevel() {
    this.scene.switch("errands");
  }

  update(time: number, delta: number) {

    const playerLocation = this.level.getPlayerCoords();

    this.updateSidePanel(playerLocation);
    this.updateSideText(playerLocation);
    this.updateInventory(playerLocation);

    disableKeyEventsOnEditorWidgets();

    this.level.collisionEnabled = (document.getElementById("editor-collisions")! as HTMLInputElement).checked;
  }

  private updateSidePanel(playerLocation: Coords) {
    const sidePanelPixelCoords = toPixelCoords({
      x: playerLocation.x + 9,
      y: playerLocation.y
    });

    this.sidePanel.setX(sidePanelPixelCoords.x);
    this.sidePanel.setY(sidePanelPixelCoords.y);
  }

  private updateSideText(playerLocation: Coords) {

    const sideTextCoords: Coords = {
      x: playerLocation.x + 7,
      y: playerLocation.y,
    };

    const sideTextPixels = toPixelCoords(sideTextCoords);
    this.sideText.x = sideTextPixels.x - tileCenterOffset + 28;
    this.sideText.y = sideTextPixels.y - tileCenterOffset + 24;
    this.sideText.setText(this.sideTextString);
  }

  private updateInventory(playerLocation: Coords) {

    const inventoryCoords: Coords = {
      x: playerLocation.x + 8,
      y: playerLocation.y - 1,
    };

    const inventoryPixels = toPixelCoords(inventoryCoords);

    const xOffset = 5 * 4;
    const yOffset = -17 * 4;
    const margin = 3 * 4;
    const tileOffset = TILE_SIZE + margin;

    this.inventorySprites.forEach((inventorySprite, index) => {
      inventorySprite.x = inventoryPixels.x - tileCenterOffset + xOffset + (index % 3) * tileOffset;
      inventorySprite.y = inventoryPixels.y - tileCenterOffset + yOffset + Math.floor(index / 3) * tileOffset;
    });
  }

  private async move(direction: Direction) {

    this.soundEffectPlayed = false;

    const moveResult = this.level.tryToMove(direction);

    this.removeSpritesOfRemovedThings(moveResult.removedThings);
    this.updateAnimationsOfThingsWhichChangedState(moveResult.changedState);

    this.displayInventory();

    if (moveResult.levelComplete) {
      this.dialogBox.show(
        toPixelCoords(this.level.getPlayerCoords()),
        "Congratulations!",
        "You have completed this errand.",
        false,
        {
          text: "Exit",
          keyboardShortcutDescription: "Enter",
          keyEventCode: "Enter",
          eventHandler: () => this.exitLevel()
        }
      );
      this.levelComplete = true;
    }

    this.sideTextString = moveResult.text ? this.getText(moveResult.text) : "";

    const playerPixelCoords = toPixelCoords(this.level.getPlayerCoords());

    this.player.setX(playerPixelCoords.x);
    this.player.setY(playerPixelCoords.y);

    moveResult.pushed.forEach(pushedThing => {

      const thingSprite = this.createdSpritesByThingId.get(pushedThing.id);

      if (thingSprite === undefined) {
        return;
      }

      const pushedThingPixelCoords = toPixelCoords(direction.move(this.level.getPlayerCoords()));

      thingSprite.setX(pushedThingPixelCoords.x);
      thingSprite.setY(pushedThingPixelCoords.y);
      thingSprite.setDepth(this.level.getDepth(pushedThing));

      this.playSpriteSoundEffect(pushedThing.description.sprite);
    });

    if (moveResult.moved) {
      this.playSoundEffectOnMove();
    }

    this.updateAmbientSound();

    if (moveResult.died) {
      await this.playerDied();
    }
  }

  private removeSpritesOfRemovedThings(removedThings: Thing[]) {
    removedThings.forEach(thing => {
      const sprite = this.createdSpritesByThingId.get(thing.id);
      if (sprite === undefined) {
        return;
      }

      this.playSoundEffect("swipe");

      sprite.destroy(true);
      this.createdSpritesByThingId.delete(thing.id);
    });
  }

  private async applyEditorTool(levelLocation: LevelLocation, locationPixelCoords: Coords) {

    const description = this.getThingDescription();

    if (description === undefined) {
      return;
    }

    const addResult = this.level.editor.addThing(levelLocation, description);

    if (!addResult.addedThing) {
      return;
    }

    this.addThingSprite(locationPixelCoords, levelLocation, addResult.addedThing);

    await this.saveLevelMatrix();

    clearLabelText();
  }

  private getThingDescription(): ThingDescription | undefined {

    const selectedSprite = (document.querySelector('input[name="editor-sprites"]:checked') as HTMLInputElement)?.value;

    if (selectedSprite === undefined) {
      return undefined;
    }

    return {
      label: getLabelText(),
      sprite: selectedSprite,
      properties: ALL_THING_PROPERTIES.filter(property => (document.getElementById(`editor-property-${property}`)! as HTMLInputElement).checked),
      text: (document.getElementById("editor-text")! as HTMLInputElement).value || undefined
    }
  }

  private addThingSprite(pixelCoords: Coords, levelLocation: LevelLocation, thing: Thing) {

    const thingDepth = levelLocation.things.indexOf(thing);

    const thingSprite = this.addSpriteFromTileset(thing.description.sprite, pixelCoords)
      .setDepth(thingDepth)
      .setInteractive();

    thingSprite.on('pointerup', async (pointer: Pointer) => {
      if (pointer.rightButtonReleased()) {
        this.rightButtonDown = false;
        await this.removeThing(levelLocation, thing, thingSprite);
      }
      if (pointer.leftButtonReleased()) {
        this.leftButtonDown = false;
        await this.applyEditorTool(levelLocation, pixelCoords);
      }
    });

    thingSprite.on('pointermove', async () => {
      const text = JSON.stringify(levelLocation.coords) + "\n" + levelLocation.things.map(thing => JSON.stringify(thing)).join("\n");
      setEditorInfo(text);

      if (this.leftButtonDown) {
        await this.applyEditorTool(levelLocation, pixelCoords);
      }
      if (this.rightButtonDown) {
        await this.removeThing(levelLocation, thing, thingSprite);
      }
    });
    thingSprite.on('pointerout', async () => {
      (document.getElementById("editor-info-panel")! as HTMLInputElement).textContent = "";
    });
    thingSprite.on('pointerdown', async (pointer: Pointer) => {
      if (pointer.leftButtonDown()) {
        this.leftButtonDown = true;
      }
      if (pointer.rightButtonDown()) {
        this.rightButtonDown = true;
      }
    });

    this.createdSpritesByThingId.set(thing.id, thingSprite);
  }

  private async removeThing(levelLocation: LevelLocation, thing: Thing, thingSprite: Phaser.Physics.Arcade.Sprite) {
    this.level.editor.removeThing(levelLocation, thing);
    thingSprite.destroy(true);
    await this.saveLevelMatrix();
  }


  private addSpriteFromTileset(name: string, coords: Coords): Sprite {

    const spriteConfig = name === "void"
      ? SPRITE_CONFIG_VOID
      : name === "wizard"
        ? SPRITE_CONFIG_WIZARD
        : SPRITE_CONFIGS_BY_LOCATION.get(name)!;

    if (spriteConfig === undefined) {
      throw new Error("Could not find sprite config for " + name);
    }

    const tileCoords = getTileCoords(spriteConfig);
    const frameIndex = getSpriteFrameIndex(tileCoords);

    const sprite = this.physics.add
      .sprite(coords.x, coords.y, this.tilesetName, frameIndex)
      .setDisplaySize(64, 64);

    if (spriteConfig.animation !== undefined) {

      sprite.anims.create(this.getAnimation(animation1, spriteConfig.animation, frameIndex));

      if (spriteConfig.auxAnimation !== undefined) {
        sprite.anims.create(this.getAnimation(animation2, spriteConfig.auxAnimation, frameIndex + spriteConfig.animation.frameCount));
      }

      sprite.play({
        key: animation1,
        startFrame: spriteConfig.animation.uniformStartFrame
          ? 0
          : Math.floor(Math.random() * (spriteConfig.animation.frameCount - 1))
      });
    }

    if (spriteConfig.soundEffect !== undefined) {
      this.soundEffectsBySpriteName.set(name, spriteConfig.soundEffect);
    }

    return sprite;
  }

  private getAnimation(key: string, animationConfig: AnimationConfig, startIndex: number, loopsForever: boolean = true): Phaser.Types.Animations.Animation {
    return {
      key: key,
      frameRate: animationConfig.framesPerSecond || 7,
      frames: this.anims.generateFrameNumbers(
        this.tilesetName,
        {
          start: startIndex,
          end: startIndex + animationConfig.frameCount - 1
        }
      ),
      repeat: loopsForever ? -1 : 0,
    };
  }

  private async saveLevelMatrix() {

    const errand: Errand = {
      ...this.level.errand,
      matrix: this.level.levelLocations.map(row => row
        .map(location => ({
            things: location.things
              .map(thing => thing.description)
          })
        )
      )
    }

    await GAME.setErrand(errand);

  }

  private updateAnimationsOfThingsWhichChangedState(things: Thing[]) {

    things.forEach(thing => {

      const sprite = this.createdSpritesByThingId.get(thing.id);

      if (sprite === undefined) {
        return;
      }

      sprite.stop();
      sprite.play(animation2);

      this.playSpriteSoundEffect(thing.description.sprite);
    });
  }

  private getText(text: string): string {

    const longText = this.level.errand.texts[text];

    return longText ? longText.text : text;
  }

  private playSoundEffectOnMove() {

    const spriteName = this
      .level
      .getLocation(this.level.getPlayerCoords())!
      .things
      .map(thing => thing.description.sprite)[0];

    this.playSpriteSoundEffect(spriteName);
  }

  private playSpriteSoundEffect(spriteName: string) {
    this.playSoundEffect(this.soundEffectsBySpriteName.get(spriteName));
  }

  private playSoundEffect(effectName: string | undefined) {
    if (this.soundEffectPlayed) {
      return;
    }

    if (!effectName) {
      return;
    }

    this.soundEffectPlayed = true;
    this.sound.play(effectName);
  }

  private updateAmbientSound() {

    const ambientSoundThing = this
      .level
      .getLocation(this.level.getPlayerCoords())
      ?.things.filter(thing => thing.is("ambientSound"))
      [0];

    this.playAmbientSound(ambientSoundThing?.description?.label);
  }

  private async playerDied() {

    this.inputEventsBlocked = true;

    const playerDeath: PlayerDeath = this
        .level
        .getLocation(this.level.getPlayerCoords())
        ?.things
        .map(thing => SPRITE_CONFIGS_BY_LOCATION.get(thing.description.sprite))
        .find(spriteConfig => spriteConfig?.playerDeath !== undefined)
        ?.playerDeath
      || "drowning";

    this.player.anims.play(playerDeath);

    setTimeout(
      () => {
        this.inputEventsBlocked = false;
        this.stopPlayingAmbientSound();
        this.dialogBox.show(
          toPixelCoords(this.level.getPlayerCoords()),
          "",
          playerDeath === "drowning"
            ? "You have drowned."
            : playerDeath === "burning"
              ? "You have perished in the fire."
              : "You have died.",
          false,
          { text: "Leave", keyboardShortcutDescription: "  L", keyEventCode: "KeyL", eventHandler: () => this.exitLevel() },
          { text: "Restart", keyboardShortcutDescription: "  R", keyEventCode: "KeyR", eventHandler: () => this.populateLevel() }
        );
      },
      2000
    );
  }
}

function disableKeyEventsOnEditorWidgets() {
  const editorWidgets = document.querySelectorAll('input[id*="editor"]');

  editorWidgets.forEach(widget => {
    if (widget instanceof HTMLInputElement && widget.type !== "text") {
      widget.blur();
    }
  });
}

function keyToDirection(eventKey: string): Direction | undefined {
  switch (eventKey) {
    case "ArrowUp":
      return Direction.UP;
    case "ArrowDown":
      return Direction.DOWN;
    case "ArrowRight":
      return Direction.RIGHT;
    case "ArrowLeft":
      return Direction.LEFT;
  }
}

function setEditorInfo(text: string) {
  (document.getElementById("editor-info-panel")! as HTMLInputElement).textContent = text;
}

function getSpriteFrameIndex(tileCoords: Coords): number {
  const tileSetWidth = 40;
  return tileCoords.y * tileSetWidth + tileCoords.x;
}
