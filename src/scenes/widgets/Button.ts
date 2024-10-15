import depths from "../level/depths";
import { Coords } from "../../engine/LevelDescription";
import Pointer = Phaser.Input.Pointer;
import { Scene } from "phaser";

export class Button {
  // @ts-ignore
  private background: Phaser.GameObjects.Sprite;
  // @ts-ignore
  private text: Phaser.GameObjects.BitmapText;

  // @ts-ignore
  private playClickSound: () => void;

  private font = "goldRobotoSmall";
  private fontPressed = "darkGoldRobotoSmall";

  private onPress?: () => void;

  preload(scene: Scene) {
    scene.load.image("button", "assets/button.png");
    scene.load.image("buttonPressed", "assets/button_pressed.png");
    scene.load.audio("buttonClick", "assets/sounds/effect/click.mp3");
    scene.load.bitmapFont(this.font, 'assets/fonts/roboto-micro-gold.png', 'assets/fonts/roboto-micro.xml');
    scene.load.bitmapFont(this.fontPressed, 'assets/fonts/roboto-micro-dark-gold.png', 'assets/fonts/roboto-micro.xml');
  }

  create(scene: Phaser.Scene) {

    this.playClickSound = () => scene.sound.play("buttonClick");

    this.background = scene
      .physics
      .add
      .sprite(0, 0, "button")
      .setDisplaySize(152, 64)
      .setDepth(depths.infoBackground)
      .setVisible(false)
      .setInteractive()
      .on('pointerdown', async (pointer: Pointer) => {
        if (pointer.leftButtonDown()) {
          this.pressButton();
        }
      });

    this.text = scene.add
      .bitmapText(0, 0, this.font, "")
      .setDepth(depths.info)
      .setScale(4)
      .setVisible(false);
  }

  private blockButton = false;

  private pressButton() {

    if (this.blockButton) {
      return;
    }

    this.blockButton = true;

    this.background.setInteractive(false);
    this.background.setTexture("buttonPressed");
    this.text.setTexture(this.fontPressed);

    this.playClickSound();

    setTimeout(
      () => {
        this.background.setInteractive(true);
        this.background.setTexture("button");
        this.text.setTexture(this.font);
        if (this.onPress !== undefined) {
          this.onPress();
        }
        this.blockButton = false;
      },
      200
    );
  }

  show(
    pixelCoords: Coords,
    text: string,
    onPress: () => void
  ) {
    this.background.setX(pixelCoords.x);
    this.background.setY(pixelCoords.y);

    this.text.setX(pixelCoords.x - 8 * text.length + 4);
    this.text.setY(pixelCoords.y - 8);
    this.text.setText(text);

    this.background.setVisible(true);
    this.text.setVisible(true);

    this.onPress = onPress;
  }

  hide() {
    this.background.setVisible(false);
    this.text.setVisible(false);
    this.onPress = undefined;
  }
}
