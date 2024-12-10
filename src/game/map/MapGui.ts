import Phaser from 'phaser';
import { Coords, LevelMetadata } from "../level/LevelDescription";
import { GAME } from "../game";
import config from "../../config";
import { DialogBox } from "../../utils/widgets/DialogBox";
import { MapTile, mapTiles } from "./map-tiles";
import { errandMarkersConfigs } from "./errand-markers-configs";
import { Button } from "../../utils/widgets/Button";
import depths from "../level/ui/depths";
import { getMapPlaceDescriptionAt } from "./place-descriptions";
import { SceneId } from "../../utils/scene-ids";
import { BitmapFonts } from "../../utils/BitmapFonts";
import { getLevelMetadata } from "../level/levels";
import Sprite = Phaser.Physics.Arcade.Sprite;

const stretchCoefficient = 4;
const coordinateSystemCoefficient = 8;
const tileSizePixels = stretchCoefficient * coordinateSystemCoefficient;

interface ErrandMarker {
  description: LevelMetadata,
  sprite: Phaser.GameObjects.Sprite,
  selectionSprite: Phaser.GameObjects.Sprite,
}

export default class MapGui extends Phaser.Scene {

  private readonly tilesetName = "mapTiles";
  private readonly animationKey = "mapAnimation";

  // @ts-ignore
  private errandMarkers: ErrandMarker[] = [];

  private selectedErrandMarkerSelectionSprite: Phaser.GameObjects.Sprite | undefined;

  private readonly dialogBox = new DialogBox();

  private errandDescriptionWidget!: {
    readonly title: Phaser.GameObjects.BitmapText;
    readonly page: Phaser.GameObjects.BitmapText;
    readonly goButton: Button;
    readonly image: Phaser.GameObjects.Sprite;
  };

  private placeDescriptionText!: Phaser.GameObjects.BitmapText;

  constructor() {
    super('errands');
  }

  preload() {

    this.load.image("errandMarker", "assets/map_errand_marker.png");
    this.load.image("spellBook", "assets/spellbook-on-map.png");
    this.load.image("map", "assets/map.png");
    this.load.spritesheet(this.tilesetName, "assets/map_tileset.png", { frameWidth: coordinateSystemCoefficient, frameHeight: coordinateSystemCoefficient });

    this.load.image("woodenDog", "assets/errand_images/woodenDog-transparent.png");
    this.load.image("forestLake", "assets/errand_images/forestLake.png");
    this.load.image("misplacedVial", "assets/errand_images/misplacedVial.png");


    BitmapFonts.getInstance().loadFonts(this);


    this.events.on("create", async () => this.sceneActive());
    this.events.on("wake", async () => this.sceneActive());

    this.dialogBox.preload(this);
  }

  private async sceneActive() {

    const levelMetadata = getLevelMetadata();

    this.clearErrandMarkers();
    this.addErrandMarkers(levelMetadata);
  }

  private clearErrandMarkers() {
    this.errandMarkers.forEach(marker => {
        marker.sprite.destroy(true);
        marker.selectionSprite.destroy(true);
      }
    );
    this.errandMarkers.length = 0;
  }

  private addErrandMarkers(metadata: LevelMetadata[]) {

    this.errandMarkers.push(
      ...(metadata
      .filter(metadata => metadata.type === "errand")
      .map(metadata => this.addErrandMarker(metadata))
      .filter(marker => marker !== undefined)) as ErrandMarker[]
    );
  }

  create() {
    this.dialogBox.create(this);

    const screenWidth = config.scale!.width! as number;
    const screenHeight = config.scale!.height! as number

    this.add
    .sprite(screenWidth / 2, screenHeight / 2, "map")
    .setDisplaySize(screenWidth, screenHeight);

    this.add
    .sprite(-20, 0, "spellBook")
    .setDepth(depths.decorations)
    .setDisplaySize(60 * 4, 37 * 4)
    .setInteractive()
    .on("pointerup", () => {
      this.scene.switch(SceneId.SPELLS);
    });

    mapTiles.tiles.forEach((row, y) => {
      row.forEach((mapTile, x) => {
        this.addMapTile(mapTile, { x, y });
      });
    })

    this.errandDescriptionWidget = {
      title: this.add
      .bitmapText(860, 40, "blackRobotoMicro", "")
      .setMaxWidth(290)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(false),
      page: this.add
      .bitmapText(215 * 4, 50 * 4, "blackRobotoMicro", "")
      .setMaxWidth(260)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(false),
      goButton: new Button(),
      image: this.add
      .sprite(247 * 4, 33 * 4, "")
      .setVisible(false)
    };

    this.errandDescriptionWidget.goButton.preload(this);
    this.errandDescriptionWidget.goButton.create(this);

    this.placeDescriptionText = this.add
    .bitmapText(200, 780, "blackRobotoMicro", "")
    .setMaxWidth(600)
    .setScale(4)
    .setDepth(depths.info)
    .setVisible(true);
  }

  private addMapTile(mapTile: MapTile, location: Coords): Sprite | undefined {

    if (mapTile.frameIndex === -1) {
      return;
    }

    const pixelCoords = this.getMapPixelCoords(location)

    const description = getMapPlaceDescriptionAt(location);

    const sprite = this.physics.add
    .sprite(pixelCoords.x, pixelCoords.y, this.tilesetName, mapTile.frameIndex)
    .setDisplaySize(tileSizePixels, tileSizePixels)
    .setInteractive()
    .on('pointermove', async () => {
      this.placeDescriptionText.setText(description || "");
      const textWidth = this.placeDescriptionText.getTextBounds().global.width;
      this.placeDescriptionText.setX(416 - textWidth / 2);
    });

    if (mapTile.animation !== undefined) {
      sprite.anims.create(this.getAnimation(mapTile))
      sprite.anims.play(this.animationKey);
    }

    return sprite;
  }

  update(time: number, delta: number) {

  }

  private getMapPixelCoords(location: Coords): Coords {
    return {
      x: (location.x + 1) * tileSizePixels,
      y: (location.y + 1) * tileSizePixels,
    };
  }

  private getAnimation(mapTile: MapTile): Phaser.Types.Animations.Animation {
    return {
      key: this.animationKey,
      frameRate: mapTile.animation!!.framesPerSecond || 7,
      frames: this.anims.generateFrameNumbers(
        this.tilesetName,
        {
          start: mapTile.frameIndex,
          end: mapTile.frameIndex + mapTile.animation!!.frameCount - 1
        }
      ),
      repeat: -1,
    };
  }

  private addErrandMarker(errandDescription: LevelMetadata): ErrandMarker | undefined {

    const errandMarkerConfig = errandMarkersConfigs.get(errandDescription.id);

    if (errandMarkerConfig === undefined) {
      return undefined;
    }

    const selectionSprite = this.addMapTile(
      {
        frameIndex: 8,
        animation: {
          frameCount: 1,
          framesPerSecond: 1
        }
      },
      errandMarkerConfig.location
    )!;

    selectionSprite.anims.create({
      key: "selected",
      frameRate: 2,
      frames: this.anims.generateFrameNumbers(
        this.tilesetName,
        {
          start: 6,
          end: 7
        }
      ),
      repeat: -1,
    });

    const sprite = this.addMapTile(errandMarkerConfig.mapTile, errandMarkerConfig.location)!;

    sprite
    .setInteractive()
    .on('pointerup', () => {
      this.displayErrandDescription(errandDescription);

      if (this.selectedErrandMarkerSelectionSprite !== undefined) {
        this.selectedErrandMarkerSelectionSprite.anims.play(this.animationKey);
      }

      this.selectedErrandMarkerSelectionSprite = selectionSprite;
      this.selectedErrandMarkerSelectionSprite.anims.play("selected");

      GAME.setCurrentLevel(errandDescription.id);
    })

    return {
      description: errandDescription,
      sprite: sprite,
      selectionSprite: selectionSprite
    };
  }

  private async displayErrandDescription(metadata: LevelMetadata) {

    this.errandDescriptionWidget.title.setText(metadata.title).setVisible(true);
    this.errandDescriptionWidget.page.setText(metadata.description).setVisible(true);
    this.errandDescriptionWidget
    .image
    .setTexture(metadata.id)
    .setDisplaySize(66 * 4, 30 * 4)
    .setVisible(true);

    this.errandDescriptionWidget.goButton.show(
      { x: 990, y: 760 },
      "Go!",
      () => {
        this.scene.switch("level");
      }
    );
  }
}
