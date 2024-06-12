import depths from "./depths";
import { Coords } from "../engine/Errand";
import { Scene } from "phaser";
import Pointer = Phaser.Input.Pointer;

const MAX_NUMBER_OF_BUTTONS = 3;

export interface ButtonConfig {
  readonly text: string,
  readonly keyboardShortcutDescription?: string,
  readonly keyEventCode?: string,
  readonly eventHandler: () => void
}

interface ButtonSpriteConfig {
  readonly background: Phaser.GameObjects.Sprite;
  readonly text: Phaser.GameObjects.BitmapText;
  readonly keyboardShortcutDescription: Phaser.GameObjects.Text;
}

export class DialogBox {

  // @ts-ignore
  private background: Phaser.GameObjects.Sprite;
  // @ts-ignore
  private titleSprite: Phaser.GameObjects.BitmapText;
  // @ts-ignore
  private textSprite: Phaser.GameObjects.BitmapText;
  // @ts-ignore
  private buttonSpriteConfigs: ButtonSpriteConfig[];

  private shown = false;

  private buttonConfigs: ButtonConfig[] = [];

  // @ts-ignore
  private xButtonSprite: Phaser.GameObjects.Sprite;

  private buttonTextColor = "#FFF03C";
  private buttonTextColorPressed = "#CEA54F";

  private cancellable = false;

  // @ts-ignore
  private playClickSound: () => void;
  // @ts-ignore
  private playSwipeSound: () => void;

  private font = "goldRobotoSmall";
  private fontPressed = "darkGoldRobotoSmall";

  private titleLength = 0;

  create(scene: Phaser.Scene) {

    this.playClickSound = () => scene.sound.play("buttonClick");
    this.playSwipeSound = () => scene.sound.play("swipe");

    this.background = scene
      .add
      .sprite(0, 0, "messagePanel")
      .setDisplaySize(656, 336)
      .setDepth(depths.infoBackground)
      .setVisible(false);

    this.titleSprite = scene.add
      .bitmapText(0, 0, this.font, "")
      .setScale(4)
      .setMaxWidth(300)
      .setDepth(depths.info)
      .setVisible(false);

    this.textSprite = scene.add
      .bitmapText(0, 0, this.font, "")
      .setScale(4)
      .setMaxWidth(550)
      .setDepth(depths.info)
      .setVisible(false);

    this.xButtonSprite = scene.add
      .sprite(0, 0, "xButton")
      .setDisplaySize(36, 36)
      .setDepth(depths.infoBackground)
      .setInteractive()
      .on('pointerdown', async (pointer: Pointer) => {
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
            .setDisplaySize(152, 64)
            .setDepth(depths.infoBackground)
            .setVisible(false)
            .setInteractive()
            .on('pointerdown', async (pointer: Pointer) => {
              if (pointer.leftButtonDown()) {
                this.pressButton(index);
              }
            }),
          text: scene.add
            .bitmapText(0, 0, this.font, "")
            .setDepth(depths.info)
            .setScale(4)
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
    pixelCoords: Coords,
    title: string,
    text: string,
    cancellable: boolean,
    ...buttons: ButtonConfig[]
  ) {
    this.cancellable = cancellable;
    this.buttonConfigs = buttons;
    this.shown = true;
    this.titleSprite.setText(title);
    this.textSprite.setText(text);

    this.titleLength = title.length;

    this.background.setVisible(true);
    this.titleSprite.setVisible(true);
    this.textSprite.setVisible(true);
    this.xButtonSprite.setVisible(cancellable);
    buttons
      .map((_, index) => this.buttonSpriteConfigs[index])
      .forEach(config => {
        config.background.setVisible(true);
        config.text.setVisible(true);
        // config.keyboardShortcutDescription.setVisible(true);
      });

    this.updateGraphics(pixelCoords);

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
    this.titleSprite.setX(pixelCoords.x - this.titleLength * 8);
    this.titleSprite.setY(pixelCoords.y - 140);
    this.textSprite.setX(pixelCoords.x - 300);
    this.textSprite.setY(pixelCoords.y - 100);

    this.xButtonSprite.setX(pixelCoords.x + 270);
    this.xButtonSprite.setY(pixelCoords.y - 126);

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

        config.text.setX(buttonX - 8 * text.length + 4);
        config.text.setY(buttonY - 8);
        config.text.setText(text);

        config.keyboardShortcutDescription.setX(buttonX - 2 * text.length);
        config.keyboardShortcutDescription.setY(buttonY + 14);
        config.keyboardShortcutDescription.setText(this.buttonConfigs[index].keyboardShortcutDescription || "");
      });
  }

  isShown(): boolean {
    return this.shown
  }

  hide() {
    this.shown = false;

    this.background.setVisible(false);
    this.titleSprite.setVisible(false);
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

    if (code == "Escape" && this.cancellable) {
      this.pressXButton();
      return;
    }

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
    buttonSpriteConfig!.text.setTexture(this.fontPressed);
    buttonSpriteConfig!.keyboardShortcutDescription.setColor(this.buttonTextColorPressed);

    this.playClickSound();

    setTimeout(
      () => {
        this.hide();
        this.buttonSpriteConfigs.forEach(config => config.background.setInteractive(true));
        buttonSpriteConfig!.background.setTexture("button");
        buttonSpriteConfig!.text.setTexture(this.font);
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

  preload(scene: Scene) {
    scene.load.image("messagePanel", "assets/message-panel.png");
    scene.load.image("button", "assets/button.png");
    scene.load.image("buttonPressed", "assets/button_pressed.png");
    scene.load.image("xButton", "assets/x-button.png");
    scene.load.image("xButtonPressed", "assets/x-button_pressed.png");
    scene.load.audio("swipe", "assets/sounds/effect/swipe.mp3");
    scene.load.audio("buttonClick", "assets/sounds/effect/click.mp3");
    scene.load.bitmapFont(this.font, 'assets/fonts/roboto-micro-gold.png', 'assets/fonts/roboto-micro.xml');
    scene.load.bitmapFont(this.fontPressed, 'assets/fonts/roboto-micro-dark-gold.png', 'assets/fonts/roboto-micro.xml');
  }
}
