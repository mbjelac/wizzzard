import Phaser from 'phaser';
import { ErrandDescription } from "../engine/Errand";
import { GAME } from "../engine/game";


const depths = {
  errandText: 0
};

const maxErrandAmount = 8;

interface ErrandSlot {
  title: Phaser.GameObjects.Text,
  description: Phaser.GameObjects.Text,
  goButton: Phaser.GameObjects.Sprite
}

export default class ErrandsGui extends Phaser.Scene {

  // @ts-ignore
  private errandSlots: ErrandSlot[] = [];

  constructor() {
    super('errands');
    console.log("Errands constructor")
  }

  preload() {

    console.log("Errands preload")

    this.load.image('errandGo', 'assets/errand_go.png');

    this.events.on("create", async () => this.sceneActive());
    this.events.on("wake", async () => this.sceneActive());
  }

  private async sceneActive() {

    const descriptions = await GAME.getErrandDescriptions();

    this.addErrands(descriptions);
  }

  private addErrands(errands: ErrandDescription[]) {
    this.errandSlots.forEach((slot, index) => this.setErrand(slot, errands[index]));
  }

  private setErrand(slot: ErrandSlot, errand?: ErrandDescription) {

    slot.goButton.removeAllListeners();

    if (errand) {
      slot.title.setText(errand.title);
      slot.title.setVisible(true);
      slot.description.setText(errand.description);
      slot.description.setVisible(true);
      slot.goButton.setVisible(true);
      slot.goButton.on('pointerup', ()=> {
        console.log("Go to errand: " + errand.id);
        GAME.goToErrand(errand.id);
        this.scene.switch("level");
      })
    } else {
      slot.title.setText("");
      slot.title.setVisible(false);
      slot.description.setText("");
      slot.description.setVisible(false);
      slot.goButton.setVisible(false);
    }
  }

  create() {
    console.log("Errands create")

    this.errandSlots = Array(maxErrandAmount).fill(null).map((_, index) => this.createErrandSlot(index));
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

    const goButton = this.add.sprite(
      xOffset + 550,
      yOffset + errandIndex * errandHeight + 30,
      'errandGo'
    )
      .setInteractive()
      .setVisible(false);

    return {
      title,
      description,
      goButton
    };
  }

  update(time: number, delta: number) {


  }
}
