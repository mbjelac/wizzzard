import Phaser from 'phaser';
import { ALL_THING_PROPERTIES, Coords, Level, LevelCell, Thing, ThingDescription } from "../engine/Level";
import { Direction } from "../engine/Direction";
import { TILE_SIZE } from "../config";
import { GAME } from "../engine/game";
import { Errand } from "../engine/Errand";
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

  constructor() {
    super('level');
  }

  preload() {

    this.load.spritesheet(this.tilesetName, "assets/tileset.png", { frameWidth: 16, frameHeight: 16 });

    // sprites.forEach(spriteName => {
    //   const path = `assets/tiles/${spriteName}.png`;
    //   if (spriteName.startsWith("__")) {
    //     this.load.spritesheet(spriteName, path, { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });
    //   } else {
    //     this.load.image(spriteName, path);
    //   }
    // });

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
        await this.applyEditorTool(location, locationPixelCoords);
      }
    });
    // voidTile.on('pointerover', async () => {
    //   (document.getElementById("editor-info-panel")! as HTMLInputElement).textContent = "";
    // });

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

    // TODO: configure animations from sprite configs
    // sprites
    //   .filter(spriteName => spriteName.startsWith("__"))
    //   .forEach(animationName => {
    //     this.anims.create({
    //       key: animationName,
    //       frameRate: 7,
    //       frames: this.anims.generateFrameNumbers(animationName, { start: 0, end: 3 }),
    //       repeat: -1,
    //     });
    //   });


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

  private async applyEditorTool(cell: LevelCell, locationPixelCoords: Coords) {

    const addResult = this.level.editor.addThing(cell, this.getThingDescription());

    if (!addResult.addedThing) {
      return;
    }

    this.addThingSprite(locationPixelCoords, cell, addResult.addedThing);

    await this.saveLevelMatrix();
  }

  private getThingDescription(): ThingDescription {
    return {
      label: (document.getElementById("editor-label")! as HTMLInputElement).value,
      sprite: (document.querySelector('input[name="editor-sprites"]:checked') as HTMLInputElement)?.value,
      properties: ALL_THING_PROPERTIES.filter(property => (document.getElementById(`editor-property-${property}`)! as HTMLInputElement).checked),
      text: (document.getElementById("editor-text")! as HTMLInputElement).value || undefined
    }
  }

  private addThingSprite(pixelCoords: Coords, cell: LevelCell, thing: Thing) {

    const thingDepth = cell.things.indexOf(thing);

    const thingSprite = this.addSpriteFromTileset(thing.description.sprite, pixelCoords)
      .setDepth(thingDepth)
      .setInteractive();

    thingSprite.on('pointerup', async (pointer: Pointer) => {
      if (pointer.rightButtonReleased()) {
        this.level.editor.removeThing(cell, thing);
        thingSprite.destroy(true);
        await this.saveLevelMatrix();
      }
      if (pointer.leftButtonReleased()) {
        await this.applyEditorTool(cell, pixelCoords);
      }
    });

    thingSprite.on('pointerover', async () => {
      const text = cell.things.map(thing => JSON.stringify(thing)).join("\n");
      (document.getElementById("editor-info-panel")! as HTMLInputElement).textContent = text;
    });
    thingSprite.on('pointerout', async () => {
      (document.getElementById("editor-info-panel")! as HTMLInputElement).textContent = "";
    });

    this.createdSpritesByThingId.set(thing.id, thingSprite);
  }

  private addSpriteFromTileset(name: string, coords: Coords): Sprite {

    const spriteConfig = name === "void"
      ? SPRITE_CONFIG_VOID
      : name === "wizard"
        ? SPRITE_CONFIG_WIZARD
        : SPRITE_CONFIGS_BY_LOCATION.get(name)!;

    const tileSetWidth = 40;

    const sprite = this.physics.add
      .sprite(coords.x, coords.y, this.tilesetName, spriteConfig.tileCoords.y * tileSetWidth + spriteConfig.tileCoords.x)
      .setDisplaySize(64, 64);

    // if (thing.description.sprite.startsWith("__")) {
    //   thingSprite.anims.play({
    //     key: thing.description.sprite,
    //     startFrame: Math.floor(Math.random() * 4)
    //   });
    // }

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
