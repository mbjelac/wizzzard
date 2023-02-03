import Phaser from 'phaser';
import { aWall, emptySpot, Level } from "./Level";

export default class Demo extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('wall', 'assets/tiles/wall.png');
    this.load.image('floor', 'assets/tiles/floor.png');
  }

  create() {

    const level = new Level([
      [aWall(), emptySpot(), emptySpot(), aWall()],
      [emptySpot(), emptySpot(), aWall(), aWall()],
      [aWall(), emptySpot(), emptySpot(), aWall()],
      [emptySpot(), emptySpot(), aWall(), emptySpot()],
    ]);

    const platforms = this.physics.add.staticGroup();

    level.tiles.forEach((row, y) => row.forEach((location, x) => {

      const xCoord = 100 + x * 16;
      const yCoord = 100 + y * 16;

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
