import Phaser from 'phaser';
import Zoom = Phaser.Scale.Zoom;
import jestConfig from "../jest.config";
import Pointer = Phaser.Input.Pointer;

export const TILE_SIZE = 64;

export const tileCenterOffset = TILE_SIZE / 2;

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scale: {
    width: TILE_SIZE * 18,
    height: TILE_SIZE * 13,
    // mode: Phaser.Scale.FIT,
    // zoom: Zoom.NO_ZOOM,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  antialias: false
};

const screenSize = {
  width: config!.scale!.width as number,
  height: config!.scale!.height as number,
}

const screenCenter = {
  x: screenSize.width / 2,
  y: screenSize.height! / 2
}

export const screen = {
  size: screenSize,
  center: screenCenter
}

export default config;

