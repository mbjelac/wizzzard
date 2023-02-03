import Phaser from 'phaser';
import { Coords, Direction, Level } from "./Level";


export default class Demo extends Phaser.Scene {

  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;

  // @ts-ignore
  private walls: Phaser.Physics.Arcade.StaticGroup;
  // @ts-ignore
  private floors: Phaser.Physics.Arcade.StaticGroup;
  // @ts-ignore
  private player: Phaser.Physics.Arcade.Sprite;

  private level: Level;

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

    this.floors = this.physics.add.staticGroup();
    this.walls = this.physics.add.staticGroup();

    this.level.locations.forEach((row, y) => row.forEach((location, x) => {

      const locationPixelCoords = toPixelCoords({
        x: x - this.level.start.x,
        y: y - this.level.start.y
      });

      this.floors.create(locationPixelCoords.x, locationPixelCoords.y, 'floor');

      location.things.forEach(thing => {
        if (thing.isWall) {
          this.walls.create(locationPixelCoords.x, locationPixelCoords.y, 'wall');
        }
      });
    }));

    const playerPixelCoords = toPixelCoords({ x: 0, y: 0 });

    this.player = this.physics.add.sprite(playerPixelCoords.x, playerPixelCoords.y, 'player');

    this.cameras.main.startFollow(this.player);

    this.cursors = this.input.keyboard.createCursorKeys();

    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {

      const direction = keyToDirection(event.key);

      if (!!direction) {
        this.move(direction);
      }

    });
  }

  private move(direction: Direction) {

    const hasMoved = this.level.tryToMove(direction);

    if (!hasMoved) {
      return;
    }

    this.player.setX(this.player.x + tileSize * direction.deltaX);
    this.player.setY(this.player.y + tileSize * direction.deltaY);
  }

  update() {

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
