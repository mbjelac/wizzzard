import { Scene } from "phaser";
import depths from "./depths";
import { Coords } from "../engine/Errand";
import toPixelCoords from "./toPixelCoords";
import config from "../config";

const MAX_NUMBER_OF_BUTTONS = 3;

export interface ButtonConfig {
  readonly text: string,
  readonly keyboardShortcutDescription: string,
  readonly keyEventCode: string,
  readonly eventHandler: () => void
}

interface ButtonSpriteConfig {
  readonly background: Phaser.GameObjects.Sprite;
  readonly text: Phaser.GameObjects.Text;
  readonly keyboardShortcutDescription: Phaser.GameObjects.Text;
}

export class DialogBox {

  // @ts-ignore
  private background: Phaser.GameObjects.Sprite;
  // @ts-ignore
  private textSprite: Phaser.GameObjects.Text;
  // @ts-ignore
  private buttonSpriteConfigs: ButtonSpriteConfig[];

  private shown = false;

  private buttonConfigs: ButtonConfig[] = [];

  initialize(scene: Phaser.Scene) {
    this.background = scene
      .add
      .sprite(0, 0, "messagePanel")
      .setDisplaySize(640, 320)
      .setDepth(depths.infoBackground);

    this.textSprite = scene.add
      .text(0, 0, "", {
          color: "#FFF03C",
          strokeThickness: 0,
          fontSize: "20px",
          fontFamily: "VinqueRg",
          wordWrap: { width: 400 },
          padding: { x: 60 }
        }
      )
      .setDepth(depths.info);

    this.buttonSpriteConfigs = Array(MAX_NUMBER_OF_BUTTONS).fill(0).map(_ => (
        {
          background: scene
            .physics
            .add
            .sprite(0, 0, "button")
            .setDisplaySize(124, 64)
            .setDepth(depths.infoBackground),
          text: scene.add
            .text(0, 0, "", {
                color: "#FFD475",
                strokeThickness: 0,
                fontSize: "20px",
              fontFamily: "VinqueRg"
            })
            .setDepth(depths.info),
          keyboardShortcutDescription: scene.add
            .text(0, 0, "", {
                color: "#B79E69",
                strokeThickness: 0,
                fontSize: "10px"
              })
            .setDepth(depths.info)
        }
      )
    );
  }

  show(
    location: Coords,
    text: string,
       ...buttons: ButtonConfig[]
  ) {
    this.buttonConfigs = buttons;
    this.shown = true;
    this.textSprite.setText(text);

    this.background.setVisible(true);
    this.textSprite.setVisible(true);
    buttons
      .map((_, index) => this.buttonSpriteConfigs[index])
      .forEach(config => {
        config.background.setVisible(true);
        config.text.setVisible(true);
        config.keyboardShortcutDescription.setVisible(true);
      });

    this.update(location);
  }

  isShown(): boolean {
    return this.shown
  }

  hide() {
    this.shown = false;

    this.background.setVisible(false);
    this.textSprite.setVisible(false);
    this.buttonSpriteConfigs
      .forEach(config => {
        config.background.setVisible(false);
        config.text.setVisible(false);
        config.keyboardShortcutDescription.setVisible(false);
      });
  }

  private update(pixelCoords: Coords) {

    if (!this.shown) {
      return;
    }

    this.background.setX(pixelCoords.x);
    this.background.setY(pixelCoords.y);
    this.textSprite.setX(pixelCoords.x - 300);
    this.textSprite.setY(pixelCoords.y - 130);

    const buttonLeftX = pixelCoords.x - 200;
    const buttonY = pixelCoords.y + 80;
    const buttonAmount = this.buttonConfigs.length;
    const buttonGap = buttonAmount > 0 ? 560 / buttonAmount : 0;

    this
      .buttonSpriteConfigs
      .filter((_, index) => index < buttonAmount)
      .forEach((config, index) => {

        const buttonX = buttonLeftX + index * buttonGap

        config.background.setX(buttonX);
        config.background.setY(buttonY);

        const text = this.buttonConfigs[index].text;

        config.text.setX(buttonX - 5 * text.length);
        config.text.setY(buttonY - 9);
        config.text.setText(text);

        config.keyboardShortcutDescription.setX(buttonX - 2 * text.length);
        config.keyboardShortcutDescription.setY(buttonY + 14);
        config.keyboardShortcutDescription.setText(this.buttonConfigs[index].keyboardShortcutDescription);
      });
  }

  getEventHandler(keyCode: string): (() => void) | undefined {
    return this
      .buttonConfigs
      .find(buttonConfig => buttonConfig.keyEventCode === keyCode)
      ?.eventHandler;
  }
}
