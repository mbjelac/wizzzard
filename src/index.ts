import { SPRITE_CONFIGS, SPRITE_CONFIGS_BY_LOCATION } from "./scenes/sprites";
import { ALL_THING_PROPERTIES } from "./engine/Level";
import { convertToHtml } from "./scenes/editor-panel";
import Phaser from "phaser";
import config from "./config";
import ErrandsGui from "./scenes/ErrandsGui";
import LevelGui from "./scenes/LevelGui";


const spriteSelectionPanel: HTMLElement = document.getElementById("editor-sprites")!;

const spritesNotInEditor = [
  "wizard",
  "void"
];

spriteSelectionPanel.innerHTML += convertToHtml(
  SPRITE_CONFIGS,
  (lastKey, spriteConfig) => {

    const spriteId = `${spriteConfig.tileCoords.x}-${spriteConfig.tileCoords.y}`;

    SPRITE_CONFIGS_BY_LOCATION.set(spriteId, spriteConfig);

    return `<div style="display: flex; flex-direction: row;">
<input type="radio" id="editor-sprite-${spriteId}" name="editor-sprites" value="${spriteId}">
<div
style="
width: 32px; /* Set the width of the container */
height: 32px; /* Set the height of the container */
overflow: hidden; /* Hide the overflow to display only a portion */
border: 0 solid black; /* Optional: add a border for visibility */
margin: 0;
padding: 0;
background-image: url('assets/tileset.png'); /* Specify the image URL */
background-size: 1280px 1280px;
 /* Scale the background image to cover the container */
background-position: -${spriteConfig.tileCoords.x * 32}px -${spriteConfig.tileCoords.y * 32}px; /* Adjust the position to display the desired portion */
margin-right: 6px;
"
></div>
<span>${lastKey}</span>
</div>`;

  });

const propertiesOptionsPanel: HTMLElement = document.getElementById("editor-properties")!;

ALL_THING_PROPERTIES
  .forEach(property => {
    propertiesOptionsPanel.innerHTML += `<div>
                    <input type="checkbox" id="editor-property-${property}" name="${property}"/>
                    <label for="editor-property-${property}">${property}</label>
                </div>\n`;
  });

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
