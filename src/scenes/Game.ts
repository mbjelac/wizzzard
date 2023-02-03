import Phaser from 'phaser';
import { Level } from "./Level";

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('wall', 'assets/tiles/wall.png');
    this.load.image('floor', 'assets/tiles/floor.png');
  }

  create() {

    const level = Level.random(7, 7);

    const platforms = this.physics.add.staticGroup();

    level.locations.forEach((row, y) => row.forEach((location, x) => {

      const tileWidth = 16;
      const tileCenterOffset = 8;

      const xCoord = tileWidth + tileCenterOffset + x * tileWidth;
      const yCoord = tileWidth + tileCenterOffset + y * tileWidth;

      platforms.create(xCoord, yCoord, 'floor');

      location.things.forEach(thing => {
        if (thing.isWall) {
          platforms.create(xCoord, yCoord, 'wall');
        }
      });
    }));


    // const logo = this.add.image(400, 70, 'logo');

  }
}
