import Phaser from 'phaser';
import config from './config';
import LevelGui from "./scenes/LevelGui";
import ErrandsGui from "./scenes/ErrandsGui";
import { sprites } from "./scenes/sprites";
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
  "wizard1",
  "void"
];

sprites
  .filter(spriteName => spritesNotInEditor.indexOf(spriteName) === -1)
  .forEach(spriteName => {
    spriteSelectionPanel.innerHTML += `<div><input type="radio" id="editor-sprite-${spriteName}" name="editor-sprites" value="${spriteName}"><img src="assets/tiles/${spriteName}.png"/> ${spriteName}</div>\n`;
  });


const propertiesOptionsPanel: HTMLElement = document.getElementById("editor-properties")!;

ALL_THING_PROPERTIES
  .forEach(property => {
    propertiesOptionsPanel.innerHTML += `<div>
                    <input type="checkbox" id="editor-property-${property}" name="${property}"/>
                    <label for="editor-property-${property}">${property}</label>
                </div>\n`;
  });

