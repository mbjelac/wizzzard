import Phaser from 'phaser';
import { ALL_THING_PROPERTIES, Level, LevelLocation, Thing } from "../engine/Level";
import { Direction } from "../engine/Direction";
import { TILE_SIZE } from "../config";
import { GAME } from "../engine/game";
import { Coords, Errand, ThingDescription } from "../engine/Errand";
import { SPRITE_CONFIG_VOID, SPRITE_CONFIG_WIZARD, SPRITE_CONFIGS_BY_LOCATION } from "./sprites";
import Pointer = Phaser.Input.Pointer;
import Sprite = Phaser.Physics.Arcade.Sprite;

const tileCenterOffset = TILE_SIZE / 2;

const depths = {
  void: -1,
  decorations: 10,
  player: 9,
  infoBackground: 11,
  info: 12
};

const animation1 = "animation1";
const animation2 = "animation2";

export default class LevelGui extends Phaser.Scene {

  // @ts-ignore
  private player: Phaser.Physics.Arcade.Sprite;

  // @ts-ignore
  private sidePanel: Phaser.GameObjects.Rectangle;

  // @ts-ignore
  private sideText: Phaser.GameObjects.Text;

  private sideTextString: string = "";

  // @ts-ignore undefined - has to be set before usage (fail fast)
  private level: Level;

  private createdNonThings: Sprite[] = [];
  private readonly createdSpritesByThingId: Map<number, Sprite> = new Map();
  private inventorySprites: Sprite[] = [];

  private readonly tilesetName = "sprites";

  private leftButtonDown: boolean = false;
  private rightButtonDown: boolean = false;

  constructor() {
    super('level');
  }

  preload() {

    this.load.spritesheet(this.tilesetName, "assets/tileset.png", { frameWidth: 16, frameHeight: 16 });

    this.events.on("create", async () => this.populateLevel());
    this.events.on("wake", async () => this.populateLevel());
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

    this.createdNonThings.push(this.player);

    this.displayInventory();

    this.cameras.main.startFollow(this.player).setFollowOffset(-3 * TILE_SIZE + tileCenterOffset, 0);
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

    Array(3).fill(0).forEach((_, index) => {

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

    this.input.keyboard.on('keydown', async (event: KeyboardEvent) => {

      const direction = keyToDirection(event.key);

      if (!!direction) {
        await this.move(direction);
      }

      if (event.code === "Escape") {
        this.exitLevel();
      }
    });


    this.game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    }

    const sidePanelWidth = 5 * TILE_SIZE;

    this.sideText = this.add
      .text(0, 0, "", {
          color: "#000",
          strokeThickness: 0,
          font: "22px Georgia",
          wordWrap: { width: sidePanelWidth - 20 },
          padding: { x: 10 }
        }
      )
      .setDepth(depths.info);

    this.sidePanel = this.add.rectangle(0, 0, sidePanelWidth, 13 * TILE_SIZE, 0xffeeee, 1);
    this.sidePanel.setDepth(depths.infoBackground)
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

    const collisions = (document.getElementById("editor-collisions")! as HTMLInputElement).checked;
    this.level.collisionEnabled = collisions;
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
      y: playerLocation.y + 4,
    };

    const sideTextPixels = toPixelCoords(sideTextCoords);
    this.sideText.x = sideTextPixels.x - tileCenterOffset;
    this.sideText.y = sideTextPixels.y - tileCenterOffset;
    this.sideText.setText(this.sideTextString);
  }

  private updateInventory(playerLocation: Coords) {

    const inventoryCoords: Coords = {
      x: playerLocation.x + 8,
      y: playerLocation.y - 1,
    };

    const inventoryPixels = toPixelCoords(inventoryCoords);

    this.inventorySprites.forEach((inventorySprite, index) => {
      inventorySprite.x = inventoryPixels.x - tileCenterOffset + index * (TILE_SIZE + 5);
      inventorySprite.y = inventoryPixels.y - tileCenterOffset;
    });
  }

  private async move(direction: Direction) {

    const moveResult = this.level.tryToMove(direction);

    if (moveResult.died) {
      await this.populateLevel();
      return;
    }

    this.removeSpritesOfRemovedThings(moveResult.removedThings);
    this.updateAnimationsOfThingsWhichChangedState(moveResult.changedState);

    this.displayInventory();

    if (moveResult.levelComplete) {
      this.exitLevel();
      return;
    }

    this.sideTextString = moveResult.text || "";

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
      thingSprite.setDepth(this.level.getDepth(pushedThing))
    });
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
  }

  private getThingDescription(): ThingDescription | undefined {

    const selectedSprite = (document.querySelector('input[name="editor-sprites"]:checked') as HTMLInputElement)?.value;

    if (selectedSprite === undefined) {
      return undefined;
    }

    return {
      label: (document.getElementById("editor-label")! as HTMLInputElement).value || undefined,
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
      const text = levelLocation.things.map(thing => JSON.stringify(thing)).join("\n");
      (document.getElementById("editor-info-panel")! as HTMLInputElement).textContent = text;

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

    const tileSetWidth = 40;

    const frameIndex = spriteConfig.tileCoords.y * tileSetWidth + spriteConfig.tileCoords.x;
    const sprite = this.physics.add
      .sprite(coords.x, coords.y, this.tilesetName, frameIndex)
      .setDisplaySize(64, 64);

    if (spriteConfig.animation !== undefined) {

      sprite.anims.create({
        key: animation1,
        frameRate: spriteConfig.animation.framesPerSecond || 7,
        frames: this.anims.generateFrameNumbers(
          this.tilesetName,
          {
            start: frameIndex,
            end: frameIndex + spriteConfig.animation.frameCount - 1
          }
        ),
        repeat: -1,
      });

      if (spriteConfig.auxAnimation !== undefined) {
        sprite.anims.create({
          key: animation2,
          frameRate: spriteConfig.auxAnimation.framesPerSecond || 7,
          frames: this.anims.generateFrameNumbers(
            this.tilesetName,
            {
              start: frameIndex + spriteConfig.animation.frameCount - 1,
              end: frameIndex + spriteConfig.animation.frameCount + spriteConfig.auxAnimation.frameCount - 1
            }
          ),
          repeat: -1,
        });
      }

      sprite.play({
        key: animation1,
        startFrame: Math.floor(Math.random() * (spriteConfig.animation.frameCount - 1))
      });
    }

    return sprite;
  }

  private clearLevel() {

    this.createdNonThings.forEach(createdObject => createdObject.destroy(true));
    this.createdNonThings = [];

    this.createdSpritesByThingId.forEach(sprite => {
      sprite.destroy(true)
    });
    this.createdSpritesByThingId.clear();
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
    });
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


function toPixelCoords(coords: Coords): Coords {
  return {
    x: coords.x * TILE_SIZE + tileCenterOffset,
    y: coords.y * TILE_SIZE + tileCenterOffset
  }
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
