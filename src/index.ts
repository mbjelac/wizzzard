import Phaser from 'phaser';
import config from './config';
import LevelGui from "./scenes/LevelGui";
import ErrandsGui from "./scenes/ErrandsGui";
import { SpriteConfig, sprites } from "./scenes/sprites";
import { ALL_THING_PROPERTIES } from "./engine/Level";


new Phaser.Game(
  Object.assign(config, {
    scene: [
      ErrandsGui,
      LevelGui,
    ]
  })
);


const spriteSelectionPanel: HTMLElement = document.getElementById("editor-sprites")!;

const spritesNotInEditor = [
  "wizard",
  "void"
];

sprites
  .forEach((config, spriteName, map)=>{

    if (spritesNotInEditor.indexOf(spriteName) !== -1) {
      return;
    }

    spriteSelectionPanel.innerHTML +=
      `<div style="display: flex; flex-direction: row; margin-bottom: 5px">
<input type="radio" id="editor-sprite-${spriteName}" name="editor-sprites" value="${spriteName}">
<!--<img src="assets/tiles/${spriteName}.png" />-->
<div
style="
width: 32px; /* Set the width of the container */
height: 32px; /* Set the height of the container */
overflow: hidden; /* Hide the overflow to display only a portion */
border: 0px solid black; /* Optional: add a border for visibility */
margin: 0;
padding: 0;
background-image: url('assets/tileset.png'); /* Specify the image URL */
background-size: 1280px 1280px;
 /* Scale the background image to cover the container */
background-position: -${config.tileCoords.x * 32}px -${config.tileCoords.y * 32}px; /* Adjust the position to display the desired portion */
margin-right: 6px;
"
></div>
${spriteName}
</div>\n`;
  });

const propertiesOptionsPanel: HTMLElement = document.getElementById("editor-properties")!;

ALL_THING_PROPERTIES
  .forEach(property => {
    propertiesOptionsPanel.innerHTML += `<div>
                    <input type="checkbox" id="editor-property-${property}" name="${property}"/>
                    <label for="editor-property-${property}">${property}</label>
                </div>\n`;
  });


// prevent arrow keys from scrolling the browser window
window.addEventListener("keydown", function(e) {
  if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
    e.preventDefault();
  }
}, false);
