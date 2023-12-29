import Phaser from 'phaser';
import config from './config';
import LevelGui from "./scenes/LevelGui";
import ErrandsGui from "./scenes/ErrandsGui";


new Phaser.Game(
  Object.assign(config, {
    scene: [
      ErrandsGui,
      LevelGui,
    ]
  })
);
