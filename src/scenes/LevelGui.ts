import Phaser from 'phaser';
import { Coords, Level, LevelLocation, Thing } from "../engine/Level";
import { SpritesToAnimate } from "./SpritesToAnimate";
import { Direction } from "../engine/Direction";
import { TILE_SIZE } from "../config";
import { GAME } from "../engine/game";
import Pointer = Phaser.Input.Pointer;
import Sprite = Phaser.Physics.Arcade.Sprite;

const tileCenterOffset = TILE_SIZE / 2;

const depths = {
  things: 2,
  floors: 0,
  decorations: 1,
  player: 9,
  infoBackground: 8,
  info: 11
};

export default class LevelGui extends Phaser.Scene {

  // @ts-ignore
  private player: Phaser.Physics.Arcade.Sprite;

  // @ts-ignore
  private toolLabel: Phaser.GameObjects.Text;

  // @ts-ignore
  private sidePanel: Phaser.GameObjects.Rectangle;

  // @ts-ignore
  private sideText: Phaser.GameObjects.Text;

  // @ts-ignore that it is undefined - has to be set before usage (fail fast)
  private level: Level;

  private readonly spritesToAnimate = new SpritesToAnimate();

  private createdNonThings: Sprite[] = [];
  private readonly createdSpritesByThingId: Map<number, Sprite> = new Map();

  constructor() {
    super('level');
  }


  preload() {
    this.load.image('void', 'assets/tiles/void.png');
    this.load.image('wall', 'assets/tiles/wall.png');
    this.load.image('floor', 'assets/tiles/floor.png');
    this.load.image('player', 'assets/tiles/wizard1.png');
    this.load.image('key', 'assets/tiles/key1.png');
    this.load.spritesheet('fire', 'assets/tiles/fire.png', { frameWidth: TILE_SIZE, frameHeight: TILE_SIZE });

    this.events.on("create", async () => this.populateLevel());
    this.events.on("wake", async () => this.populateLevel());
  }

  create() {
    console.log("Level create");

    this.anims.create({
      key: 'burn',
      frameRate: 7,
      frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 3 }),
      repeat: -1,
    });

    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {

      const direction = keyToDirection(event.key);

      if (!!direction) {
        this.move(direction);
      }

      if (event.key === 'c') {
        this.level.collisionEnabled = !this.level.collisionEnabled;
        console.log(`collision ${this.level.collisionEnabled ? "en" : "dis"}abled`);
      }

      if (event.key === 'e') {
        this.level.editor.changeEditorTool();
      }

      if (event.code === "Escape") {
        this.scene.switch("errands");
      }
    });


    this.game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    }

    this.toolLabel = this.add.text(0, 0, "Hello!", { color: "#fff", strokeThickness: 0 }).setDepth(depths.info).setFontSize(18);

    const sidePanelWidth = 5 * TILE_SIZE;

    this.sideText = this.add
      .text(0, 0, "Hello again! This is a very long message written to test text wrapping in Phazer.\n", {
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

    this.player = this.physics.add.sprite(playerPixelCoords.x, playerPixelCoords.y, 'player').setDepth(depths.player);

    this.createdNonThings.push(this.player);

    this.cameras.main.startFollow(this.player).setFollowOffset(-3 * TILE_SIZE + tileCenterOffset, 0);
  }


  private addLocation(x: number, y: number) {
    const location = this.level.levelMatrix[y][x];

    const locationPixelCoords = toPixelCoords({
      x: x,
      y: y
    });

    const voidTile = this.physics.add.sprite(locationPixelCoords.x, locationPixelCoords.y, 'void').setDepth(depths.floors).setInteractive();
    voidTile.on('pointerup', async (pointer: Pointer) => {
      if (pointer.leftButtonReleased()) {
        await this.applyEditorTool(location, locationPixelCoords);
      }
    });

    this.createdNonThings.push(voidTile);

    location.things.forEach(thing => {
      this.addThingSprite(locationPixelCoords, location, thing);
    });
  }

  update(time: number, delta: number) {

    const playerLocation = this.level.getPlayerLocation();

    const sidePanelPixelCoords = toPixelCoords({
      x: playerLocation.x + 9,
      y: playerLocation.y
    });

    this.sidePanel.setX(sidePanelPixelCoords.x);
    this.sidePanel.setY(sidePanelPixelCoords.y);

    const toolLabelCoords: Coords = {
      x: playerLocation.x - 6,
      y: playerLocation.y - 6,
    };
    const toolLabelPixels = toPixelCoords(toolLabelCoords)
    this.toolLabel.x = toolLabelPixels.x - tileCenterOffset;
    this.toolLabel.y = toolLabelPixels.y - tileCenterOffset;
    this.toolLabel.text = "EDITOR: " + this.level.editor.getCurrentEditorTool();

    const sideTextCoords: Coords = {
      x: playerLocation.x + 7,
      y: playerLocation.y + 4,
    };
    const sideTextPixels = toPixelCoords(sideTextCoords)
    this.sideText.x = sideTextPixels.x - tileCenterOffset;
    this.sideText.y = sideTextPixels.y - tileCenterOffset;

    this.spritesToAnimate.animateAll();
  }

  private move(direction: Direction) {

    const hasMoved = this.level.tryToMove(direction);

    if (!hasMoved) {
      return;
    }

    this.removeSpritesPutInInventory();

    const playerPixelCoords = toPixelCoords(this.level.getPlayerLocation());

    this.player.setX(playerPixelCoords.x);
    this.player.setY(playerPixelCoords.y);
  }

  private removeSpritesPutInInventory() {
    this.level.getInventory().forEach(thing => {
      const sprite = this.createdSpritesByThingId.get(thing.id);
      if (sprite === undefined) {
        return;
      }
      sprite.destroy(true);
      this.createdSpritesByThingId.delete(thing.id);
    });
  }

  private async applyEditorTool(location: LevelLocation, locationPixelCoords: Coords) {
    const addResult = this.level.editor.applyEditorTool(location);

    if (!addResult.addedThing) {
      return;
    }

    this.addThingSprite(locationPixelCoords, location, addResult.addedThing);

    await GAME.setErrand(this.level.errand);
  }

  private addThingSprite(pixelCoords: Coords, location: LevelLocation, thing: Thing) {

    const thingSprite = this.physics.add.sprite(pixelCoords.x, pixelCoords.y, thing.props.sprite).setDepth(depths.things).setInteractive();

    this.spritesToAnimate.addSprite(thing, thingSprite);

    thingSprite.on('pointerup', async (pointer: Pointer) => {
      if (pointer.rightButtonReleased()) {
        this.level.editor.removeThing(location, thing);
        thingSprite.destroy(true);
        await GAME.setErrand(this.level.errand);
      }
      if (pointer.leftButtonReleased()) {
        await this.applyEditorTool(location, pixelCoords);
      }
    });

    this.createdSpritesByThingId.set(thing.id, thingSprite);
  }

  private clearLevel() {
    this.spritesToAnimate.clearAll();

    this.createdNonThings.forEach(createdObject => createdObject.destroy(true));
    this.createdNonThings = [];

    this.createdSpritesByThingId.forEach(sprite => {
      sprite.destroy(true)
    });
    this.createdSpritesByThingId.clear();
  }
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
