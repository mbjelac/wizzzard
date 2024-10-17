import Phaser from 'phaser';
import { screen } from "../../../config";
import { GAME } from "../../game";
import depths from "../../level/ui/depths";
import { Button } from "../../../utils/widgets/Button";
import { SceneId } from "../../../utils/scene-ids";
import { LevelMetadata } from "../../level/LevelDescription";
import Rectangle = Phaser.Geom.Rectangle;

interface SpellPage {
  readonly name: Phaser.GameObjects.BitmapText;// @ts-ignore
  readonly description: Phaser.GameObjects.BitmapText;
  readonly researchButton: Button;
}

interface SpellListItem {
  description: LevelMetadata,
  name: Phaser.GameObjects.BitmapText
}

export default class SpellBookGui extends Phaser.Scene {

  private spellListItems: SpellListItem[] = [];

  private spellPage!: SpellPage

  constructor() {
    super(SceneId.SPELLS);
  }

  preload() {
    this.load.image("background", "assets/spellbook.png");
    this.load.image("closeLeft", "assets/spellbook_close_left.png");
    this.load.image("closeRight", "assets/spellbook_close_right.png");

    this.load.bitmapFont('blackRobotoMicro', 'assets/fonts/roboto-micro.png', 'assets/fonts/roboto-micro.xml');

    this.spellPage = {
      name: this.add
      .bitmapText(200 * 4, 14 * 4, "blackRobotoMicro", "")
      .setMaxWidth(300)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(true),
      description: this.add
      .bitmapText(152 * 4, 40 * 4, "blackRobotoMicro", "")
      .setMaxWidth(480)
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
    .sprite(4 * 4, screen.center.y, "closeLeft")
    .setDisplaySize(12 * 4, screen.size.height)
    .setInteractive()
    .on("pointerup", () => {
      this.scene.switch("errands")
    });

    this.physics.add
    .sprite(screen.size.width - 5 * 4, screen.center.y, "closeRight")
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
        .map((metadata, index) => this.addSpellListItem(metadata, index))
    );
  }

  private addSpellListItem(metadata: LevelMetadata, index: number): SpellListItem {
    const item: SpellListItem = {
      description: metadata,
      name: this
      .add
      .bitmapText(20 * 4, 12 * 4 + index * 36, "blackRobotoMicro", metadata.title)
      .setMaxWidth(100)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(true)
    };

    const bounds = item.name.getTextBounds(true).local;

    item.name
    .setInteractive(
      new Rectangle(bounds.x, bounds.y, bounds.width, bounds.height),
      Phaser.Geom.Rectangle.Contains
    )
    .on("pointerup", () => {
      this.displaySpellPage(metadata)
    });

    return item;
  }

  private displaySpellPage(metadata: LevelMetadata) {
    this.spellPage.name.setText(metadata.title);
    this.spellPage.name.setX(210 * 4 - this.spellPage.name.getTextBounds().global.width / 2);
    this.spellPage.description.setText(metadata.description);
    this.spellPage.researchButton.show({ x: 210 * 4, y: 180 * 4 }, "Research", () => {
      GAME.setCurrentLevel(metadata.id);
      this.scene.switch(SceneId.LEVEL);
    });
  }
}
