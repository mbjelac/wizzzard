import Phaser from 'phaser';
import { Coords, Level } from "./Level";

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('wall', 'assets/tiles/wall.png');
    this.load.image('floor', 'assets/tiles/floor.png');
    this.load.image('player', 'assets/tiles/wizard1.png');
  }

  create() {

    const level = Level.random(3, 3);

    const floors = this.physics.add.staticGroup();
    const walls = this.physics.add.staticGroup();

    const center: Coords = {x: 4, y: 4};

    const levelOffset: Coords = {
      x: center.x - level.start.x,
      y: center.y - level.start.y,
    };

    const centerPixels = toPixels(center);

    level.locations.forEach((row, y) => row.forEach((location, x) => {

      const locationCoords = toPixels({
        x: levelOffset.x + x,
        y: levelOffset.y + y
      });

      floors.create(locationCoords.x, locationCoords.y, 'floor');

      location.things.forEach(thing => {
        if (thing.isWall) {
          walls.create(locationCoords.x, locationCoords.y, 'wall');
        }
      });
    }));

    const player = this.physics.add.sprite(centerPixels.x, centerPixels.y, 'player');

    this.physics.add.collider(player, walls);
  }
}

const tileSize = 16;
const tileCenterOffset = 8;

function toPixels(coords: Coords): Coords {
  return {
    x: coords.x * tileSize + tileCenterOffset,
    y: coords.y * tileSize + tileCenterOffset
  }
}
