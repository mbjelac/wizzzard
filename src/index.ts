import { loadEditorPanel } from "./scenes/level/editor-panel";
import Phaser from "phaser";
import config from "./config";
import MapGui from "./scenes/map/MapGui";
import LevelGui from "./scenes/level/LevelGui";
import SpellsGui from "./scenes/spells/SpellsGui";

loadEditorPanel();

new Phaser.Game(
  Object.assign(config, {
    scene: [
      MapGui,
      LevelGui,
      SpellsGui
    ]
  })
);

// prevent arrow keys from scrolling the browser window
window.addEventListener("keydown", function (e) {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
}, false);
