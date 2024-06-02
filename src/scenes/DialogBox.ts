import depths from "./depths";
import { Coords } from "../engine/Errand";
import Pointer = Phaser.Input.Pointer;
import { Scene } from "phaser";

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

  // @ts-ignore
  private xButtonSprite: Phaser.GameObjects.Sprite;

  private buttonTextColor = "#FFF03C";
  private buttonTextColorPressed = "#CEA54F";

  // @ts-ignore
  private playClickSound: () => void;
  // @ts-ignore
  private playSwipeSound: () => void;

  create(scene: Phaser.Scene) {

    this.playClickSound = () => scene.sound.play("buttonClick");
    this.playSwipeSound = () => scene.sound.play("swipe");

    this.background = scene
      .add
      .sprite(0, 0, "messagePanel")
      .setDisplaySize(640, 320)
      .setDepth(depths.infoBackground)
      .setVisible(false);

    this.textSprite = scene.add
      .text(0, 0, "", {
          color: this.buttonTextColor,
          strokeThickness: 0,
          fontSize: "20px",
          fontFamily: "VinqueRg",
          wordWrap: { width: 400 },
          padding: { x: 60 }
        }
      )
      .setDepth(depths.info)
      .setVisible(false);

    this.xButtonSprite = scene.add
      .sprite(0, 0, "xButton")
      .setDisplaySize(48, 48)
      .setDepth(depths.infoBackground)
      .setInteractive()
      .on('pointerdown', async (pointer: Pointer)=> {
        if (pointer.leftButtonDown()) {
          this.pressXButton();
        }
      })
      .setVisible(false);

    this.buttonSpriteConfigs = Array(MAX_NUMBER_OF_BUTTONS).fill(0).map((_, index) => (
        {
          background: scene
            .physics
            .add
            .sprite(0, 0, "button")
            .setDisplaySize(124, 64)
            .setDepth(depths.infoBackground)
            .setVisible(false)
            .setInteractive()
            .on('pointerdown', async (pointer: Pointer) => {
              if (pointer.leftButtonDown()) {
                this.pressButton(index);
              }
            }),
          text: scene.add
            .text(0, 0, "", {
              color: "#FFD475",
              strokeThickness: 0,
              fontSize: "20px",
              fontFamily: "VinqueRg"
            })
            .setDepth(depths.info)
            .setVisible(false),
          keyboardShortcutDescription: scene.add
            .text(0, 0, "", {
              color: "#B79E69",
              strokeThickness: 0,
              fontSize: "10px"
            })
            .setDepth(depths.info)
            .setVisible(false)
        }
      )
    );
  }

  show(
    location: Coords,
    text: string,
    cancellable: boolean,
    ...buttons: ButtonConfig[]
  ) {
    this.buttonConfigs = buttons;
    this.shown = true;
    this.textSprite.setText(text);

    this.background.setVisible(true);
    this.textSprite.setVisible(true);
    this.xButtonSprite.setVisible(cancellable);
    buttons
      .map((_, index) => this.buttonSpriteConfigs[index])
      .forEach(config => {
        config.background.setVisible(true);
        config.text.setVisible(true);
        config.keyboardShortcutDescription.setVisible(true);
      });

    this.updateGraphics(location);

    this.playSwipeSound();
  }

  private readonly buttonXCoordsByButtonAmounts = new Map<number, number[]>()
    .set(1, [0])
    .set(2, [-100, 100])
    .set(3, [-180, 0, 180]);

  private updateGraphics(pixelCoords: Coords) {

    if (!this.shown) {
      return;
    }

    this.background.setX(pixelCoords.x);
    this.background.setY(pixelCoords.y);
    this.textSprite.setX(pixelCoords.x - 300);
    this.textSprite.setY(pixelCoords.y - 100);

    this.xButtonSprite.setX(pixelCoords.x + 265);
    this.xButtonSprite.setY(pixelCoords.y - 121);

    const buttonY = pixelCoords.y + 80;
    const buttonAmount = this.buttonConfigs.length;

    this
      .buttonSpriteConfigs
      .filter((_, index) => index < buttonAmount)
      .forEach((config, index) => {

        const buttonX = pixelCoords.x + this.buttonXCoordsByButtonAmounts.get(buttonAmount)![index];

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

  isShown(): boolean {
    return this.shown
  }

  hide() {
    this.shown = false;

    this.background.setVisible(false);
    this.textSprite.setVisible(false);
    this.xButtonSprite.setVisible(false);
    this.buttonSpriteConfigs
      .forEach(config => {
        config.background.setVisible(false);
        config.text.setVisible(false);
        config.keyboardShortcutDescription.setVisible(false);
      });
  }

  handleKeyInput(code: string) {
    const buttonIndex = this.getButtonIndexFromKeyCode(code);
    if (buttonIndex !== undefined) {
      this.pressButton(buttonIndex);
    }
  }

  private getButtonIndexFromKeyCode(keyCode: string): number | undefined {
    const index = this
      .buttonConfigs
      .findIndex(buttonConfig => buttonConfig.keyEventCode === keyCode);

    return index === -1 ? undefined : index;
  }

  private blockButtons = false;

  private pressButton(buttonIndex: number) {

    if (this.blockButtons) {
      return;
    }

    this.blockButtons = true;

    const eventHandler = this.buttonConfigs[buttonIndex].eventHandler;

    const buttonSpriteConfig = this.buttonSpriteConfigs[buttonIndex];

    this.buttonSpriteConfigs.forEach(config => config.background.setInteractive(false));
    buttonSpriteConfig!.background.setTexture("buttonPressed");
    buttonSpriteConfig!.text.setColor(this.buttonTextColorPressed);
    buttonSpriteConfig!.keyboardShortcutDescription.setColor(this.buttonTextColorPressed);

    this.playClickSound();

    setTimeout(
      () => {
        this.hide();
        this.buttonSpriteConfigs.forEach(config => config.background.setInteractive(true));
        buttonSpriteConfig!.background.setTexture("button");
        buttonSpriteConfig!.text.setColor(this.buttonTextColor);
        buttonSpriteConfig!.keyboardShortcutDescription.setColor(this.buttonTextColor);
        eventHandler();
        this.blockButtons = false;
      },
      200);
  }

  private pressXButton() {

    if (this.blockButtons) {
      return;
    }

    this.blockButtons = true;

    this.xButtonSprite.setTexture("xButtonPressed");

    this.playClickSound();

    setTimeout(
      () => {
        this.hide();
        this.buttonSpriteConfigs.forEach(config => config.background.setInteractive(true));
        this.xButtonSprite.setTexture("xButton");
        this.blockButtons = false;
      },
      200);
  }

  loadImages(scene: Scene) {
    scene.load.image("messagePanel", "assets/message-panel.png");
    scene.load.image("button", "assets/button.png");
    scene.load.image("buttonPressed", "assets/button_pressed.png");
    scene.load.image("xButton", "assets/x-button.png");
    scene.load.image("xButtonPressed", "assets/x-button_pressed.png");
  }
}
