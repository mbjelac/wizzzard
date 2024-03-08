import Phaser from 'phaser';
import config from './config';
import LevelGui from "./scenes/LevelGui";
import ErrandsGui from "./scenes/ErrandsGui";
import { sprites } from "./scenes/sprites";


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
    spriteSelectionPanel.innerHTML += `<div><input type="radio" id="editor-sprite-${spriteName}" name="editor-sprites" value="${spriteName}"><img src="assets/tiles/${spriteName}.png"/></div>\n`;
  });
