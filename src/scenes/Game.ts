import Phaser from 'phaser';
import { Coords, Direction, Level, Location, Thing } from "./Level";
import Pointer = Phaser.Input.Pointer;

export default class Demo extends Phaser.Scene {

  // @ts-ignore
  private player: Phaser.Physics.Arcade.Sprite;

  private readonly level: Level;

  constructor() {
    super('GameScene');

    this.level = Level.random(7, 7);
  }


  preload() {
    this.load.image('wall', 'assets/tiles/wall.png');
    this.load.image('floor', 'assets/tiles/floor.png');
    this.load.image('player', 'assets/tiles/wizard1.png');
  }

  create() {

    this.level.locations.forEach((row, y) => row.forEach((location, x) => {

      const locationPixelCoords = toPixelCoords({
        x: x,
        y: y
      });


      const floor = this.physics.add.sprite(locationPixelCoords.x, locationPixelCoords.y, 'floor').setInteractive();
      floor.on('pointerup', (pointer: Pointer) => {
        if (pointer.leftButtonReleased()) {
          this.addWall(location, locationPixelCoords);
        }
      });

      location.things.forEach(thing => {
        if (thing.isWall) {
          this.addWallSprite(locationPixelCoords, location, thing);
        }
      });
    }));

    const playerPixelCoords = toPixelCoords({ x: this.level.start.x, y: this.level.start.y });

    this.player = this.physics.add.sprite(playerPixelCoords.x, playerPixelCoords.y, 'player');

    this.cameras.main.startFollow(this.player);

    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {

      const direction = keyToDirection(event.key);

      if (!!direction) {
        this.move(direction);
      }

      if (event.key === 'c') {
        console.log("toggle collision enabled");
        this.level.collisionEnabled = !this.level.collisionEnabled;
      }
    });

    this.game.canvas.oncontextmenu = function (e) { e.preventDefault(); }
  }

  private move(direction: Direction) {

    const hasMoved = this.level.tryToMove(direction);

    if (!hasMoved) {
      return;
    }

    this.player.setX(this.player.x + tileSize * direction.deltaX);
    this.player.setY(this.player.y + tileSize * direction.deltaY);
  }

  private addWall(location: Location, locationPixelCoords: Coords) {
    const wall = this.level.addWall(location);
    this.addWallSprite(locationPixelCoords, location, wall);
  }

  private addWallSprite(pixelCoords: Coords, location: Location, thing: Thing) {
    const wall = this.physics.add.sprite(pixelCoords.x, pixelCoords.y, 'wall').setInteractive();
    wall.on('pointerup', (pointer: Pointer) => {
      if (pointer.rightButtonReleased()) {
        this.level.removeWall(location, thing);
        wall.destroy(true);
      }
    });

  }
}

const tileSize = 16;
const tileCenterOffset = 8;

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
