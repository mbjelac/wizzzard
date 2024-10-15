import Phaser from 'phaser';
import { screen } from "../../config";
import { GAME } from "../../engine/game";
import depths from "../level/depths";
import { Button } from "../widgets/Button";
import { SceneId } from "../scene-ids";
import { LevelMetadata } from "../../engine/LevelDescription";

interface SpellPage {
  readonly name: Phaser.GameObjects.BitmapText;// @ts-ignore
  readonly description: Phaser.GameObjects.BitmapText;
  readonly researchButton: Button;
}

interface SpellListItem {
  description: LevelMetadata,
  name: Phaser.GameObjects.BitmapText
}

export default class SpellsGui extends Phaser.Scene {

  private spellListItems: SpellListItem[] = [];

  private spellPage!: SpellPage

  constructor() {
    super(SceneId.SPELLS);
  }

  preload() {
    this.load.image("background", "assets/journal.png");
    this.load.image("closeLeft", "assets/journal_close_left.png");
    this.load.image("closeRight", "assets/journal_close_right.png");

    this.load.bitmapFont('blackRobotoMicro', 'assets/fonts/roboto-micro.png', 'assets/fonts/roboto-micro.xml');

    this.spellPage = {
      name: this.add
      .bitmapText(40, 50, "blackRobotoMicro", "")
      .setMaxWidth(300)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(true),
      description: this.add
      .bitmapText(40, 50, "blackRobotoMicro", "")
      .setMaxWidth(300)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(true),
      researchButton: new Button()
    }

    this.spellPage.researchButton.preload(this);

    this.events.on("create", async () => this.displayContent());
    this.events.on("wake", async () => await this.displayContent());
  }

  create() {
    this.physics.add
    .sprite(screen.center.x, screen.center.y, "background")
    .setDisplaySize(screen.size.width, screen.size.height);

    this.physics.add
    .sprite(4*4, screen.center.y, "closeLeft")
    .setDisplaySize(12 * 4, screen.size.height)
    .setInteractive()
    .on("pointerup", () => {
      this.scene.switch("errands")
    });

    this.physics.add
    .sprite(screen.size.width - 5*4, screen.center.y, "closeRight")
    .setDisplaySize(14 * 4, screen.size.height)
    .setInteractive()
    .on("pointerup", () => {
      this.scene.switch("errands")
    });

    this.spellPage.researchButton.create(this);

    this.input.keyboard.on('keydown', async (event: KeyboardEvent) => {

      if (event.code === "Escape") {
        this.scene.switch("errands")
        return;
      }
    });
  }

  private async displayContent() {
    this.clearContent();

    this.addSpellNames(await GAME.getLevelMetadata());
  }

  private clearContent() {
    this.spellPage.name.setText("");
    this.spellPage.description.setText("");
    this.spellPage.researchButton.hide();

    this.spellListItems.forEach(item => item.name.destroy(true));
    this.spellListItems.length = 0;
  }

  private addSpellNames(metadata: LevelMetadata[]) {

    this.spellListItems.push(
      ...
        metadata
        .filter(metadata => metadata.type === "ritual")
        .map(metadata => this.addSpellListItem(metadata))
    );
  }

  private addSpellListItem(metadata: LevelMetadata): SpellListItem {
    return {
      description: metadata,
      name: this
      .add
      .bitmapText(40, 50, "blackRobotoMicro", metadata.title)
      .setMaxWidth(100)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(true)
      .setInteractive()
      .on("pointerup", () => {
        this.displaySpellPage(metadata)
      })
    };
  }

  private displaySpellPage(metadata: LevelMetadata) {

    this.spellPage.name.setText(metadata.title);
    this.spellPage.description.setText(metadata.description);

  }
}
