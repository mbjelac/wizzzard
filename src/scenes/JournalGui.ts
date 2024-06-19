import Phaser from 'phaser';
import { screen } from "../config";
import { GAME } from "../engine/game";
import depths from "./depths";

export default class JournalGui extends Phaser.Scene {

  // @ts-ignore
  private background: Phaser.GameObjects.Sprite;

  // @ts-ignore
  private title: Phaser.GameObjects.BitmapText;// @ts-ignore

  // @ts-ignore
  private page: Phaser.GameObjects.BitmapText;

  constructor() {
    super("journal");
  }

  preload() {
    this.load.image("background", "assets/journal.png");

    this.load.bitmapFont('blackRobotoMicro', 'assets/fonts/roboto-micro.png', 'assets/fonts/roboto-micro.xml');


    this.events.on("create", async () => this.displayContent());
    this.events.on("wake", async () => this.clearContent());
  }

  create(){
    this.background = this.physics.add
      .sprite(screen.center.x, screen.center.y, "background")
      .setDisplaySize(screen.size.width, screen.size.height);

    this.title = this.add
      .bitmapText(40, 50, "blackRobotoMicro", "")
      .setMaxWidth( 300)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(true);

    this.page = this.add
      .bitmapText(40, 100, "blackRobotoMicro", "")
      .setMaxWidth( 496)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(true);
  }

  private async displayContent(){

    const errand = await GAME.getSelectedErrand();

    if (errand === undefined){
      return;
    }

    this.title.setText(errand.description.title);
    this.page.setText(errand.description.description);
  }

  private clearContent() {
    this.title.setText("");
    this.page.setText("");
  }
}
