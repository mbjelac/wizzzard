import Phaser from 'phaser';
import Zoom = Phaser.Scale.Zoom;

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
    width: 200,
    height: 200,
    mode: Phaser.Scale.NONE,
    zoom: Zoom.ZOOM_4X,
    autoCenter: Phaser.Scale.CENTER_BOTH
  }
};

export default config;
