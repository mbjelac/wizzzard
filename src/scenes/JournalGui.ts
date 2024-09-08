import Phaser from 'phaser';
import { screen } from "../config";
import { GAME } from "../engine/game";
import depths from "./depths";
import { Button } from "./widgets/Button";
import toPixelCoords from "./toPixelCoords";

export default class JournalGui extends Phaser.Scene {

  private background!: Phaser.GameObjects.Sprite;

  private title!: Phaser.GameObjects.BitmapText;// @ts-ignore

  private page!: Phaser.GameObjects.BitmapText;

  private readonly goButton = new Button();

  constructor() {
    super("journal");
  }

  preload() {
    this.load.image("background", "assets/journal.png");

    this.load.bitmapFont('blackRobotoMicro', 'assets/fonts/roboto-micro.png', 'assets/fonts/roboto-micro.xml');


    this.events.on("create", async () => this.displayContent());
    this.events.on("wake", async () => {
      this.clearContent();
      await this.displayContent();
    });

    this.goButton.preload(this);
  }

  create() {
    this.background = this.physics.add
    .sprite(screen.center.x, screen.center.y, "background")
    .setDisplaySize(screen.size.width, screen.size.height);

    this.title = this.add
    .bitmapText(40, 50, "blackRobotoMicro", "")
    .setMaxWidth(300)
    .setScale(4)
    .setDepth(depths.info)
    .setVisible(true);

    this.page = this.add
    .bitmapText(40, 100, "blackRobotoMicro", "")
    .setMaxWidth(496)
    .setScale(4)
    .setDepth(depths.info)
    .setVisible(true);

    this.goButton.create(this);

    this.input.keyboard.on('keydown', async (event: KeyboardEvent) => {

      if (event.code === "Escape") {
        this.scene.switch("errands")
        return;
      }
    });
  }

  private async displayContent() {

    const errand = await GAME.getSelectedErrand();

    if (errand === undefined) {
      return;
    }

    this.title.setText(errand.description.title);
    this.page.setText(errand.description.description);

    this.goButton.show(
    { x: 288, y: 670 },
    "Go!",
    () => {
      GAME.goToErrand(errand.description.id);
      this.scene.switch("level");
    }
    );
  }

  private clearContent() {
    this.title.setText("");
    this.page.setText("");
    this.goButton.hide();
  }
}
