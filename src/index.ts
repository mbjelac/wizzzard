import { loadEditorPanel } from "./scenes/editor-panel";
import Phaser from "phaser";
import config from "./config";
import ErrandsGui from "./scenes/ErrandsGui";
import LevelGui from "./scenes/LevelGui";

loadEditorPanel();

new Phaser.Game(
  Object.assign(config, {
    scene: [
      ErrandsGui,
      LevelGui,
    ]
  })
);

// prevent arrow keys from scrolling the browser window
window.addEventListener("keydown", function (e) {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
}, false);
