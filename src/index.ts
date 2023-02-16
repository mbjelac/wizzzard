import Phaser from 'phaser';
import config from './config';
import levelGui from './scenes/LevelGui';

new Phaser.Game(
  Object.assign(config, {
    scene: [levelGui]
  })
);
