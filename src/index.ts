import { loadEditorPanel } from "./game/level/ui/editor-panel";
import Phaser from "phaser";
import config from "./config";
import MapGui from "./game/map/MapGui";
import LevelGui from "./game/level/ui/LevelGui";
import SpellBookGui from "./game/spell/ui/SpellBookGui";

loadEditorPanel();

new Phaser.Game(
  Object.assign(config, {
    scene: [
      MapGui,
      LevelGui,
      SpellBookGui
    ]
  })
);

// prevent arrow keys from scrolling the browser window
window.addEventListener("keydown", function (e) {
  if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
}, false);
