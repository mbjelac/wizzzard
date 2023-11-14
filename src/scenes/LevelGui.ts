import Phaser from 'phaser';
import { Coords, Level, Location, Thing } from "../engine/Level";
import { SpritesToAnimate } from "./SpritesToAnimate";
import { LevelFactory } from "../engine/LevelFactory";
import { Direction } from "../engine/Direction";
import Pointer = Phaser.Input.Pointer;

const tileSize = 16;
const tileCenterOffset = tileSize / 2;

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

  private readonly level: Level;

  private readonly spritesToAnimate = new SpritesToAnimate();

  constructor() {
    super('GameScene');

    this.level = new LevelFactory().random(7, 7);
  }


  preload() {
    this.load.image('wall', 'assets/tiles/wall.png');
    this.load.image('floor', 'assets/tiles/floor.png');
    this.load.image('player', 'assets/tiles/wizard1.png');
    this.load.spritesheet('fire', 'assets/tiles/fire.png', { frameWidth: tileSize, frameHeight: tileSize });
  }

  create() {

    this.anims.create({
      key: 'burn',
      frameRate: 7,
      frames: this.anims.generateFrameNumbers('fire', { start: 0, end: 3 }),
      repeat: -1,
    });

    this.level.locations.forEach((row, y) => row.forEach((location, x) => {

      const locationPixelCoords = toPixelCoords({
        x: x,
        y: y
      });


      const floor = this.physics.add.sprite(locationPixelCoords.x, locationPixelCoords.y, 'floor').setDepth(depths.floors).setInteractive();
      floor.on('pointerup', (pointer: Pointer) => {
        if (pointer.leftButtonReleased()) {
          this.applyEditorTool(location, locationPixelCoords);
        }
      });

      location.things.forEach(thing => {
        this.addThingSprite(locationPixelCoords, location, thing);
      });
    }));

    const startCoords: Coords = { x: this.level.start.x, y: this.level.start.y };
    const playerPixelCoords = toPixelCoords(startCoords);

    this.player = this.physics.add.sprite(playerPixelCoords.x, playerPixelCoords.y, 'player').setDepth(depths.player);


    this.cameras.main.startFollow(this.player).setFollowOffset(- 3 * tileSize + tileCenterOffset, 0);

    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {

      const direction = keyToDirection(event.key);

      if (!!direction) {
        this.move(direction);
      }

      if (event.key === 'c') {
        console.log("toggle collision enabled");
        this.level.collisionEnabled = !this.level.collisionEnabled;
      }

      if (event.key === 'e') {
        this.level.editor.changeEditorTool();
      }


    });

    this.game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    }

    this.toolLabel = this.add.text(0, 0, "Hello!", { color: "#fff", strokeThickness: 0 }).setDepth(depths.info).setFontSize(10);
    this.sideText = this.add.text(0, 0, "Hello\nagain!", { color: "#000", strokeThickness: 0 }).setDepth(depths.info).setFontSize(9);

    this.sidePanel = this.add.rectangle(0, 0, 5 * tileSize, 13 * tileSize, 0xffeeee, 1);
    this.sidePanel.setDepth(depths.infoBackground)
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
    this.toolLabel.text = "HELLO " + this.level.editor.getCurrentEditorTool();

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

    const playerPixelCoords = toPixelCoords(this.level.getPlayerLocation());

    this.player.setX(playerPixelCoords.x);
    this.player.setY(playerPixelCoords.y);
  }

  private applyEditorTool(location: Location, locationPixelCoords: Coords) {
    const addedThing = this.level.editor.applyEditorTool(location);

    if (!addedThing) {
      return;
    }

    this.addThingSprite(locationPixelCoords, location, addedThing);
  }

  private addThingSprite(pixelCoords: Coords, location: Location, thing: Thing) {

    const thingSprite = this.physics.add.sprite(pixelCoords.x, pixelCoords.y, thing.sprite).setDepth(depths.things).setInteractive();

    this.spritesToAnimate.addSprite(thing, thingSprite);

    thingSprite.on('pointerup', (pointer: Pointer) => {
      if (pointer.rightButtonReleased()) {
        this.level.editor.removeThing(location, thing);
        thingSprite.destroy(true);
      }
    });

  }
}


function toPixelCoords(coords: Coords): Coords {
  return {
    x: coords.x * tileSize + tileCenterOffset,
    y: coords.y * tileSize + tileCenterOffset
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
