import Phaser from 'phaser';
import { Level, TickResult } from "../Level";
import { Direction } from "../Direction";
import { GAME } from "../../game";
import { Coords, LevelDescription, TextContent, ThingDescription } from "../LevelDescription";
import { AnimationConfig, PlayerDeath, SPRITE_CONFIG_VOID, SPRITE_CONFIG_WIZARD, SPRITE_CONFIGS_BY_LOCATION } from "./sprites";
import { clearLabelText, getLabelText } from "./editor-panel";
import depths from "./depths";
import { ButtonConfig, DialogBox } from "../../../utils/widgets/DialogBox";
import toPixelsFromMapLocation from "./toPixelsFromMapLocation";
import { ALL_THING_PROPERTIES, Thing } from "../Thing";
import { VariantTiles } from "./VariantTiles";
import { SceneId } from "../../../utils/scene-ids";
import { BitmapFonts } from "../../../utils/BitmapFonts";
import { talkingHeadConfigs } from "./talkingHeadConfigs";
import { LevelLocation } from "../LevelMap";
import { Ticker } from "./Ticker";
import { getDeathMessage } from "./get-death-message";
import { getInventorySpriteCoords } from "./get-inventory-sprite-coords";
import Pointer = Phaser.Input.Pointer;
import Sprite = Phaser.Physics.Arcade.Sprite;
import { TILE_SIZE, tileCenterOffset } from "../../../constants";

const animation1 = "animation1";
const animation2 = "animation2";

const playerMovementDuration = 100;

interface AmbientSound {
  readonly name: string;
  readonly sound: Phaser.Sound.BaseSound;
}

export default class LevelGui extends Phaser.Scene {

  private player!: Phaser.Physics.Arcade.Sprite;

  private talkingHead!: Phaser.Physics.Arcade.Sprite;
  private sideText!: Phaser.GameObjects.BitmapText;

  // @ts-ignore undefined - has to be set before usage (fail fast)
  private level: Level;

  private voidTiles: Sprite[] = [];
  private readonly createdSpritesByThingId: Map<number, Sprite> = new Map();
  private readonly soundEffectsBySpriteName: Map<string, string> = new Map();
  private inventorySprites: Sprite[] = [];

  private readonly tilesetName = "sprites";
  private readonly talkingHeads = "talkingHeads";

  private leftButtonDown: boolean = false;
  private rightButtonDown: boolean = false;

  private ambientSound: AmbientSound | undefined;
  private soundEffectPlayed = false;

  private inputEventsBlocked = false;

  private readonly dialogBox = new DialogBox();

  private variantTiles!: VariantTiles;

  private readonly ticker = new Ticker(
    () => this.level.tick(),
    (result: TickResult) => this.handleTickResult(result)
  )

  constructor() {
    super("level");
  }

  preload() {

    this.dialogBox.preload(this);

    BitmapFonts.getInstance().loadFonts(this);

    this.load.spritesheet(this.tilesetName, "assets/tileset.png", { frameWidth: 16, frameHeight: 16 });
    this.load.spritesheet(this.talkingHeads, "assets/talking_heads.png", { frameWidth: 10, frameHeight: 10 });

    this.load.image("panel", "assets/panel.png");

    this.load.bitmapFont('blackRobotoMicro', 'assets/fonts/roboto-micro.png', 'assets/fonts/roboto-micro.xml');


    this.load.audio("summerMeadow", "assets/sounds/ambient/summer-meadow.mp3");
    this.load.audio("laboratory", "assets/sounds/ambient/laboratory.mp3");
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
    this.events.on("update", async (time: number) => this.ticker.tick(time))
  }

  private async populateLevel() {

    this.clearLevel();

    this.variantTiles = new VariantTiles();

    this.level = await GAME.getCurrentLevel();

    for (const x of Array(this.level.levelDescription.levelDimensions.width).keys()) {
      for (const y of Array(this.level.levelDescription.levelDimensions.height).keys()) {
        this.addLocation({ x, y });
      }
    }

    const startCoords: Coords = { x: this.level.levelDescription.startCoords.x, y: this.level.levelDescription.startCoords.y };

    this.createPlayerSprite(startCoords);

    this.displayInventory();

    this.playAmbientSound(this.level.levelDescription.initialAmbientSound);
  }

  private createPlayerSprite(startCoords: Coords) {
    this.player = this.addSpriteFromTileset("wizard", startCoords).setDepth(depths.player);

    this.updatePlayerLocation(toPixelsFromMapLocation(startCoords));

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

    this.voidTiles.forEach(voidTile => voidTile.destroy(true));
    this.voidTiles = [];

    if (this.player !== undefined) {
      this.player.destroy(true);
    }

    this.createdSpritesByThingId.forEach(sprite => {
      sprite.destroy(true)
    });
    this.createdSpritesByThingId.clear();

    this.sound.stopAll();
    this.isDead = false;
  }

  private addLocation(coords: Coords) {
    const location = this.level.getLocation(coords);

    if (location === undefined) {
      return;
    }

    const voidTile = this.addSpriteFromTileset("void", coords)
    .setDepth(depths.void)
    .setInteractive();

    this.voidTiles.push(voidTile);

    voidTile.on('pointerup', async (pointer: Pointer) => {
      if (pointer.leftButtonReleased()) {
        this.leftButtonDown = false;
        await this.applyEditorTool(location, coords);
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
        await this.applyEditorTool(location, coords);
      }
      setEditorInfo(JSON.stringify(location.coords));
    });

    location.things.forEach(thing => {
      this.addThingSprite(coords, location, thing);
    });
  }


  private displayInventory() {

    this.inventorySprites.forEach(sprite => sprite.destroy(true));
    this.inventorySprites = [];

    const inventory = this.level.getInventory();

    const offset: Coords = { x: 10, y: 20 };

    Array(6).fill(0).forEach((_, index) => {

      const inventoryItem = inventory[index];

      if (inventoryItem === undefined) {
        return;
      }

      const inventorySpriteCoords: Coords = getInventorySpriteCoords(index, offset);

      const inventorySprite = this
      .addSpriteFromTileset(inventoryItem.description.sprite, { x: 0, y: 0 })
      .setDepth(depths.info)
      .setScrollFactor(0)
      .setPosition(inventorySpriteCoords.x, inventorySpriteCoords.y);
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
          toPixelsFromMapLocation(this.level.getPlayerCoords()),
          "",
          "Tired already, fellow traveller?",
          true,
          this.getTerminationButtons(),
        );
        return;
      }
    });


    this.game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    }

    const sidePanelWidth = 5 * TILE_SIZE;

    const panelOffset: Coords = { x: 992, y: 416 };

    this.sideText = this.add
    .bitmapText(panelOffset.x - 4 * 32, panelOffset.y + 4 * 3, "blackRobotoMicro", "")
    .setMaxWidth(sidePanelWidth - 60)
    .setScale(4)
    .setDepth(depths.info)
    .setScrollFactor(0);

    this
    .physics
    .add
    .sprite(panelOffset.x, panelOffset.y, "panel")
    .setDisplaySize(320, 832)
    .setDepth(depths.infoBackground)
    .setScrollFactor(0);

    this.talkingHead = this.physics.add
    .sprite(panelOffset.x - 4 * 28, panelOffset.y + 4 * 3, this.talkingHeads, 0)
    .setDepth(depths.info)
    .setDisplaySize(10 * 4, 10 * 4)
    .setScrollFactor(0)
    .setVisible(false);

    talkingHeadConfigs.forEach(talkingHeadConfig => {
      this.talkingHead.anims.create(this.getAnimation(
        talkingHeadConfig.head,
        talkingHeadConfig.config,
        getSpriteFrameIndex(talkingHeadConfig.tileCoords),
        true,
        this.talkingHeads
      ));
    });
  }

  private getTerminationButtons(): ButtonConfig[] {
    return [
      { text: "Leave", keyboardShortcutDescription: "  L", keyEventCode: "KeyL", eventHandler: () => this.exitLevel() },
      { text: "Restart", keyboardShortcutDescription: "  R", keyEventCode: "KeyR", eventHandler: () => this.populateLevel() },
      ...(
        this.level.canRemember()
          ? [{ text: "Remember", keyboardShortcutDescription: "  B", keyEventCode: "KeyB", eventHandler: () => this.rememberLevel() }]
          : []
      )
    ];
  }

  private exitLevel() {
    this.scene.switch(
      this.level.levelDescription.metadata.type === "errand"
        ? SceneId.ERRANDS
        : SceneId.SPELLS
    );
  }


  update(time: number, delta: number) {

    disableKeyEventsOnEditorWidgets();

    this.level.collisionEnabled = (document.getElementById("editor-collisions")! as HTMLInputElement).checked;
    this.level.tickingEnabled = !this.isDead && (document.getElementById("editor-ticking")! as HTMLInputElement).checked;
  }

  private setSideText(content: TextContent | undefined) {

    if (content === undefined) {
      this.sideText.setVisible(false);
      this.talkingHead.setVisible(false);
      return;
    }

    this.sideText.setText(content.text);
    this.sideText.setVisible(true);

    if (content.head === undefined) {
      this.talkingHead.stop();
      this.talkingHead.setVisible(false);
      return;
    }

    this.talkingHead.anims.play(content.head);

    this.talkingHead.setVisible(true);
  }

  private async move(direction: Direction) {

    this.soundEffectPlayed = false;

    const moveResult = this.level.tryToMove(direction);

    this.removeSpritesOfRemovedThings(moveResult.removedThings);
    this.addSpritesOfAddedThings(moveResult.addedThings);
    this.updateAnimationsOfThingsWhichChangedState(moveResult.changedState);

    if (moveResult.levelComplete) {
      this.dialogBox.show(
        toPixelsFromMapLocation(this.level.getPlayerCoords()),
        "Congratulations!",
        "You have completed this errand.",
        false,
        [
          {
            text: "Exit",
            keyboardShortcutDescription: "Enter",
            keyEventCode: "Enter",
            eventHandler: () => this.exitLevel()
          }
        ]
      );
    }

    this.setSideText(this.getText(moveResult.text));

    const playerPixelCoords = toPixelsFromMapLocation(this.level.getPlayerCoords());

    moveSmoothly(
      { x: this.player.x, y: this.player.y },
      playerPixelCoords,
      (position: Coords) => this.updatePlayerLocation(position),
      playerMovementDuration
    );

    // this.player.setX(playerPixelCoords.x);
    // this.player.setY(playerPixelCoords.y);

    moveResult.pushed.forEach(pushedThing => {

      const thingSprite = this.createdSpritesByThingId.get(pushedThing.id);

      if (thingSprite === undefined) {
        return;
      }

      const pushedThingPixelCoords = toPixelsFromMapLocation(direction.move(this.level.getPlayerCoords()));

      moveSmoothly(
        { x: thingSprite.x, y: thingSprite.y },
        pushedThingPixelCoords,
        (position) => {
          thingSprite.setPosition(
            position.x,
            position.y
          );
        },
        playerMovementDuration
      );

      thingSprite.setDepth(this.level.getDepth(pushedThing));

      this.playSpriteSoundEffect(pushedThing.description.sprite);
    });

    if (moveResult.moved) {
      this.playSoundEffectOfMovingOnFloor();
    }

    this.updateAmbientSound();

    if (moveResult.died) {
      await this.playerDied();
    } else {
      this.displayInventory();
    }
  }

  private updatePlayerLocation(locationPixels: Coords) {
    this.player.setPosition(locationPixels.x, locationPixels.y);
  }

  private removeSpritesOfRemovedThings(removedThings: Thing[]) {
    removedThings.forEach(thing => {
      const sprite = this.createdSpritesByThingId.get(thing.id);
      if (sprite === undefined) {
        return;
      }

      sprite.destroy(true);
      this.createdSpritesByThingId.delete(thing.id);
    });

    if (removedThings.length > 0) {
      this.playSoundEffect("swipe");
    }
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

  private addThingSprite(locationCoords: Coords, levelLocation: LevelLocation, thing: Thing) {

    const thingDepth = levelLocation.things.indexOf(thing);

    const thingSprite = this.addSpriteFromTileset(thing.description.sprite, locationCoords)
    .setDepth(thingDepth)
    .setInteractive();

    thingSprite.on('pointerup', async (pointer: Pointer) => {
      if (pointer.rightButtonReleased()) {
        this.rightButtonDown = false;
        await this.removeThing(levelLocation, thing, thingSprite);
      }
      if (pointer.leftButtonReleased()) {
        this.leftButtonDown = false;
        await this.applyEditorTool(levelLocation, locationCoords);
      }
    });

    thingSprite.on('pointermove', async () => {
      const text = JSON.stringify(levelLocation.coords) + "\n" + levelLocation.things.map(thing => JSON.stringify(thing)).join("\n");
      setEditorInfo(text);

      if (this.leftButtonDown) {
        await this.applyEditorTool(levelLocation, locationCoords);
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
    this.variantTiles.remove(thing.description.sprite, levelLocation.coords);
    await this.saveLevelMatrix();
  }

  private addSpriteFromTileset(name: string, locationCoords: Coords): Sprite {

    const spriteConfig = name === "void"
      ? SPRITE_CONFIG_VOID
      : name === "wizard"
        ? SPRITE_CONFIG_WIZARD
        : SPRITE_CONFIGS_BY_LOCATION.get(name)!;

    if (spriteConfig === undefined) {
      throw new Error("Could not find sprite config for " + name);
    }

    const tileCoords = this.variantTiles.getTileCoords(spriteConfig, name, locationCoords)
    const frameIndex = getSpriteFrameIndex(tileCoords);

    const pixelCoords = toPixelsFromMapLocation(locationCoords);

    const sprite = this.physics.add
    .sprite(pixelCoords.x, pixelCoords.y, this.tilesetName, frameIndex)
    .setDisplaySize(64, 64);

    if (spriteConfig.animation !== undefined) {

      if (spriteConfig.directions === undefined) {

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

      } else {

        sprite.anims.create(this.getAnimation(Direction.UP.name, spriteConfig.animation, getSpriteFrameIndex(spriteConfig.directions.up)));
        sprite.anims.create(this.getAnimation(Direction.LEFT.name, spriteConfig.animation, getSpriteFrameIndex(spriteConfig.directions.left)));
        sprite.anims.create(this.getAnimation(Direction.RIGHT.name, spriteConfig.animation, getSpriteFrameIndex(spriteConfig.directions.right)));
        sprite.anims.create(this.getAnimation(Direction.DOWN.name, spriteConfig.animation, getSpriteFrameIndex(spriteConfig.directions.down)));

        sprite.play(Direction.DOWN.name);
      }
    }

    if (spriteConfig.soundEffect !== undefined) {
      this.soundEffectsBySpriteName.set(name, spriteConfig.soundEffect);
    }

    return sprite;
  }

  private getAnimation(key: string, animationConfig: AnimationConfig, startIndex: number, loopsForever: boolean = true, tilesetName: string = this.tilesetName): Phaser.Types.Animations.Animation {
    return {
      key: key,
      frameRate: animationConfig.framesPerSecond || 7,
      frames: this.anims.generateFrameNumbers(
        tilesetName,
        {
          start: startIndex,
          end: startIndex + animationConfig.frameCount - 1
        }
      ),
      repeat: loopsForever ? -1 : 0,
    };
  }

  private async saveLevelMatrix() {

    const levelDescription: LevelDescription = {
      ...this.level.levelDescription,
      matrix: this.level.getLevelMatrix()
    }

    await GAME.setLevel(levelDescription);
  }

  private activeRememberingStoneSprite: Sprite | undefined;

  private updateAnimationsOfThingsWhichChangedState(things: Thing[], quietly: boolean = false) {

    things.forEach(thing => {

      const sprite = this.createdSpritesByThingId.get(thing.id);

      if (sprite === undefined) {
        return;
      }

      sprite.stop();
      sprite.play(animation2);

      if (!quietly) {
        this.playSpriteSoundEffect(thing.description.sprite);
      }

      if (thing.is("remember")) {

        if (
          this.activeRememberingStoneSprite !== undefined &&
          this.activeRememberingStoneSprite.anims != undefined &&
          this.activeRememberingStoneSprite !== sprite
        ) {
          this.activeRememberingStoneSprite.stop();
          this.activeRememberingStoneSprite.play(animation1);

        }

        this.activeRememberingStoneSprite = sprite;
      }
    });
  }

  private getText(text: string | undefined): TextContent | undefined {

    if (text === undefined) {
      return undefined;
    }

    if (text === "remembering") {
      return { head: undefined, text: "I will remember you." };
    }

    const textContent = this.level.levelDescription.texts[text] || { text: text };

    return {
      ...textContent,
      head: textContent.head,
      text: (textContent.head !== undefined ? "   " : "") + textContent.text,
    };
  }

  private playSoundEffectOfMovingOnFloor() {

    const floorSpriteName = this
    .level
    .getLocation(this.level.getPlayerCoords())!
      .things[0]
      ?.description
      ?.sprite;

    this.playSpriteSoundEffect(floorSpriteName);
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

  private isDead = false;

  private async playerDied() {

    if (this.isDead) {
      return;
    }

    this.isDead = true;

    this.inputEventsBlocked = true;

    const playerDeath: PlayerDeath = this
      .level
      .getLocation(this.level.getPlayerCoords())
      ?.things
      .map(thing => SPRITE_CONFIGS_BY_LOCATION.get(thing.description.sprite))
      .find(spriteConfig => spriteConfig?.playerDeath !== undefined)
        ?.playerDeath
      || "unknown";

    this.player.anims.play(playerDeath);

    setTimeout(
      () => {
        this.inputEventsBlocked = false;
        this.stopPlayingAmbientSound();
        this.dialogBox.show(
          toPixelsFromMapLocation(this.level.getPlayerCoords()),
          "",
          getDeathMessage(playerDeath),
          false,
          this.getTerminationButtons()
        );
      },
      600
    );
  }

  private rememberLevel() {

    this.clearLevel();

    this.level.remember();

    this.createPlayerSprite(this.level.getPlayerCoords());

    this.displayInventory();

    for (const x of Array(this.level.levelDescription.levelDimensions.width).keys()) {
      for (const y of Array(this.level.levelDescription.levelDimensions.height).keys()) {
        this.addLocation({ x, y });
      }
    }

    this.updateAnimationsOfThingsWhichChangedState(this.level.getThingsThatChangedState(), true);

    this.playAmbientSound(this.level.getAmbientSound());
  }

  private addSpritesOfAddedThings(addedThings: LevelLocation | undefined) {
    if (addedThings === undefined) {
      return;
    }

    const levelLocation = this.level.getLocation(addedThings.coords)!

    addedThings.things.forEach(addedThing => {
      this.addThingSprite(addedThings.coords, levelLocation, addedThing);
    });
  }

  private async handleTickResult(result: TickResult) {

    result.movedThings.forEach(movedThing => {

      const sprite = this.createdSpritesByThingId.get(movedThing.thing.id);

      if (sprite === undefined) {
        return;
      }

      sprite.play(movedThing.thing.getCurrentDirectionName());

      moveSmoothly(
        { x: sprite.x, y: sprite.y },
        toPixelsFromMapLocation(movedThing.at),
        (position: Coords) => sprite.setPosition(position.x, position.y),
        this.ticker.tickInterval
      );
    });

    if (result.died) {
      await this.playerDied();
    }

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

export function getSpriteFrameIndex(tileCoords: Coords): number {
  const tileSetWidth = 40;
  return tileCoords.y * tileSetWidth + tileCoords.x;
}

function moveSmoothly(oldPosition: Coords, newPosition: Coords, positionHandler: (position: Coords) => void, moveDuration: number) {

  const smoothness = 4;

  let movesLeft = smoothness;

  const delta: Coords = {
    x: (newPosition.x - oldPosition.x) / smoothness,
    y: (newPosition.y - oldPosition.y) / smoothness
  }

  let position: Coords = {
    x: oldPosition.x,
    y: oldPosition.y
  };

  const intervalId = setInterval(
    () => {

      position = {
        x: position.x + delta.x,
        y: position.y + delta.y
      };

      if (--movesLeft === 0) {
        clearInterval(intervalId);
        positionHandler(newPosition);
      } else {
        positionHandler(position);
      }
    },
    moveDuration / smoothness - 5
  );
}

