import Phaser from 'phaser';
import { screen } from "../../../config";
import { GAME } from "../../game";
import depths from "../../level/ui/depths";
import { Button } from "../../../utils/widgets/Button";
import { SceneId } from "../../../utils/scene-ids";
import { Coords, LevelMetadata } from "../../level/LevelDescription";
import { BitmapFonts } from "../../../utils/BitmapFonts";
import { spellRequirementsBySpellId } from "../spell-requirements";
import Rectangle = Phaser.Geom.Rectangle;
import { getSpriteFrameIndex } from "../../level/ui/LevelGui";


interface SpellListItem {
  readonly description: LevelMetadata;
  readonly name: Phaser.GameObjects.BitmapText;
}

interface SpellRequirementItem {
  readonly name: Phaser.GameObjects.BitmapText;
  readonly image: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
}

export default class SpellBookGui extends Phaser.Scene {

  private spellListItems: SpellListItem[] = [];

  private spellName!: Phaser.GameObjects.BitmapText;// @ts-ignore
  private spellDescription!: Phaser.GameObjects.BitmapText;
  private spellRequirementItems!: SpellRequirementItem[];
  private readonly researchButton = new Button();

  private readonly tileset = "tileset";

  constructor() {
    super(SceneId.SPELLS);
  }

  preload() {
    this.load.image("background", "assets/spellbook.png");
    this.load.image("closeLeft", "assets/spellbook_close_left.png");
    this.load.image("closeRight", "assets/spellbook_close_right.png");
    this.load.spritesheet(this.tileset, "assets/tileset.png", { frameWidth: 16, frameHeight: 16 });

    BitmapFonts.getInstance().loadFonts(this);

    this.events.on("create", async () => this.displayContent());
    this.events.on("wake", async () => await this.displayContent());

    this.researchButton.preload(this);
  }

  create() {

    this.spellName = this.add
    .bitmapText(156 * 4, 26 * 4, "blackRobotoMicro", "")
    .setMaxWidth(440)
    .setScale(4)
    .setDepth(depths.info)
    .setVisible(true);

    this.spellDescription = this.add
    .bitmapText(156 * 4, 47 * 4, "blackRobotoMicro", "")
    .setMaxWidth(440)
    .setScale(4)
    .setDepth(depths.info)
    .setVisible(true);

    this.spellRequirementItems = Array(10).fill(0).map((_, index) => ({
      name: this.add
      .bitmapText(169 * 4, 94 * 4 + index * 58, "blackRobotoMicro", "")
      .setMaxWidth(430)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(true),
      image: this.physics.add
      .sprite(162 * 4, 98 * 4 + index * 58, this.tileset, 0)
      .setDisplaySize(64, 64)
      .setDepth(depths.info)
      .setVisible(false)
    }));

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

    this.researchButton.create(this);

    this.input.keyboard.on('keydown', async (event: KeyboardEvent) => {

      if (event.code === "Escape") {
        this.scene.switch("errands")
        return;
      }
    });

    this.addTitleTexts();

  }

  private addTitleTexts() {
    this.addTitleText({ x: 55, y: 23 }, "My magicks");
    this.addTitleText({ x: 155, y: 18 }, "Name");
    this.addTitleText({ x: 155, y: 39 }, "Description");
    this.addTitleText({ x: 155, y: 82 }, "Requirements");
  }

  private addTitleText(coords: Coords, text: string) {
    this.add
    .bitmapText(coords.x * 4, coords.y * 4, "blackRobotoMicro", text)
    .setMaxWidth(300)
    .setScale(4)
    .setDepth(depths.info)
    .setVisible(true)
  }

  private async displayContent() {
    this.clearContent();

    this.addSpellNames(await GAME.getLevelMetadata());
  }

  private clearContent() {
    this.spellName.setText("");
    this.spellDescription.setText("");
    this.researchButton.hide();

    this.spellRequirementItems.forEach(item => {
      item.name.setText("");
      item.image.setVisible(false);
    })

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
      .bitmapText(30 * 4, 30 * 4 + index * 40, "blackRobotoMicro", metadata.title)
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
    this.spellName.setText(metadata.title);
    this.spellDescription.setText(metadata.description);

    const requirements = spellRequirementsBySpellId.get(metadata.id)!;

    requirements.requirements.forEach((requirement, index) => {
      const item = this.spellRequirementItems[index];
      item.name.setText(requirement.name);
      item.image.setFrame(getSpriteFrameIndex(requirement.spriteLocation));
      item.image.setVisible(true);
    });

    this.researchButton.show({ x: 210 * 4, y: 180 * 4 }, "Research", () => {
      GAME.setCurrentLevel(metadata.id);
      this.scene.switch(SceneId.LEVEL);
    });
  }
}
