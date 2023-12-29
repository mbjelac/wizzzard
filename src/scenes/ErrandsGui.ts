import Phaser from 'phaser';
import { Errand } from "../engine/Errand";
import { GAME } from "../engine/game";


const depths = {
  errandText: 0
};

const maxErrandAmount = 8;

interface ErrandSlot {
  title: Phaser.GameObjects.Text,
  description: Phaser.GameObjects.Text,
}

export default class ErrandsGui extends Phaser.Scene {

  // @ts-ignore
  private errandSlots: ErrandSlot[] = [];

  constructor() {
    super('errands');
  }

  preload() {
    this.events.on("create", () => this.sceneActive())
    this.events.on("wake", () => this.sceneActive())
  }

  private sceneActive() {
    this.addErrands(GAME.getErrands())
  }

  private addErrands(errands: Errand[]) {
    this.errandSlots.forEach((slot, index) => this.setErrand(slot, errands[index]));
  }

  private setErrand(slot: ErrandSlot, errand?: Errand) {
    if (errand) {
      slot.title.setText(errand.title);
      slot.title.setVisible(true);
      slot.description.setText(errand.description);
      slot.description.setVisible(true);
    } else {
      slot.title.setText("");
      slot.title.setVisible(false);
      slot.description.setText("");
      slot.description.setVisible(false);
    }
  }

  create() {

    this.errandSlots = Array(maxErrandAmount).fill(null).map((_, index) => this.createErrandSlot(index));

    this.input.keyboard.on('keydown', (event: KeyboardEvent) => {

      if (event.code === "Escape") {
        this.scene.switch("level")
      }
    });
  }

  private createErrandSlot(errandIndex: number): ErrandSlot {

    const xOffset = 20;
    const yOffset = 100;
    const errandHeight = 80;
    const titleHeight = 28;
    const descriptionIndent = 10;

    const title = this.add.text(
      xOffset,
      errandIndex * errandHeight + yOffset,
      "yWq",
      {
        color: "#fff",
        strokeThickness: 0,
        font: "22px Georgia",
        wordWrap: { width: 200 },
        padding: { x: 10 }
      }
    )
      .setDepth(depths.errandText)
      .setVisible(false);

    const description = this.add.text(
      xOffset + descriptionIndent,
      errandIndex * errandHeight + titleHeight + yOffset,
      "blah blah",
      {
        color: "#eee",
        strokeThickness: 0,
        font: "14px Georgia",
        wordWrap: { width: 500 },
        padding: { x: 10 }
      }
    )
      .setDepth(depths.errandText)
      .setVisible(false);

    return {
      title,
      description
    };
  }

  update(time: number, delta: number) {


  }
}
