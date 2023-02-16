import Phaser from 'phaser';
import config from './config';
import GameScene from './scenes/LevelGui';

new Phaser.Game(
  Object.assign(config, {
    scene: [GameScene]
  })
);
