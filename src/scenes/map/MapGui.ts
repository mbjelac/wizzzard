import Phaser from 'phaser';
import { Coords, ErrandDescription } from "../../engine/Errand";
import { GAME } from "../../engine/game";
import config from "../../config";
import { DialogBox } from "../widgets/DialogBox";
import { MapTile, mapTiles } from "./map-tiles";
import { errandMarkersConfigs } from "./errand-markers-configs";
import { Button } from "../widgets/Button";
import depths from "../level/depths";
import { getMapPlaceDescriptionAt } from "./place-descriptions";
import Sprite = Phaser.Physics.Arcade.Sprite;

const stretchCoefficient = 4;
const coordinateSystemCoefficient = 8;
const tileSizePixels = stretchCoefficient * coordinateSystemCoefficient;

interface ErrandMarker {
  description: ErrandDescription,
  sprite: Phaser.GameObjects.Sprite
}

export default class MapGui extends Phaser.Scene {

  private readonly tilesetName = "mapTiles";
  private readonly animationKey = "mapAnimation";

  // @ts-ignore
  private errandMarkers: ErrandMarker[] = [];

  private errandSelectionFrame!: Phaser.GameObjects.Sprite;

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
    console.log("Errands constructor")
  }

  preload() {

    console.log("Errands preload")

    this.load.image("errandMarker", "assets/map_errand_marker.png");
    this.load.image("map", "assets/map.png");
    this.load.spritesheet(this.tilesetName, "assets/map_tileset.png", { frameWidth: coordinateSystemCoefficient, frameHeight: coordinateSystemCoefficient });

    this.load.image("woodenDog", "assets/errand_images/woodenDog-transparent.png");


    this.load.bitmapFont("unnamed", "assets/fonts/Unnamed.png", "assets/fonts/Unnamed.xml");
    this.load.bitmapFont("redRobotoSmall", "assets/fonts/red-roboto-small.png", "assets/fonts/roboto-small.xml");
    this.load.bitmapFont('blackRobotoMicro', 'assets/fonts/roboto-micro.png', 'assets/fonts/roboto-micro.xml');


    this.events.on("create", async () => this.sceneActive());
    this.events.on("wake", async () => this.sceneActive());

    this.dialogBox.preload(this);
  }

  private async sceneActive() {

    const descriptions = await GAME.getErrandDescriptions();

    this.clearErrandMarkers();
    this.addErrandMarkers(descriptions);
  }

  private clearErrandMarkers() {
    this.errandMarkers.forEach(marker => marker.sprite.destroy(true));
    this.errandMarkers.length = 0;
  }

  private addErrandMarkers(errands: ErrandDescription[]) {

    this.errandMarkers.push(
      ...(errands
      .map(errandDescription => this.addErrandMarker(errandDescription))
      .filter(marker => marker !== undefined)) as ErrandMarker[]
    );
  }

  create() {
    console.log("Errands create")

    this.dialogBox.create(this);

    const screenWidth = config.scale!.width! as number;
    const screenHeight = config.scale!.height! as number

    this.add
    .sprite(screenWidth / 2, screenHeight / 2, "map")
    .setDisplaySize(screenWidth, screenHeight);

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
      .bitmapText(860, 370, "blackRobotoMicro", "")
      .setMaxWidth(260)
      .setScale(4)
      .setDepth(depths.info)
      .setVisible(false),
      goButton: new Button(),
      image: this.add
      .sprite(990, 216, "woodenDog")
      .setDisplaySize(66 * 4, 66 * 4)
      .setVisible(false)
    };

    this.errandDescriptionWidget.goButton.preload(this);
    this.errandDescriptionWidget.goButton.create(this);

    this.errandSelectionFrame = this.physics.add
    .sprite(0, 0, this.tilesetName, 6)
    .setDisplaySize(tileSizePixels, tileSizePixels)
    .setVisible(false);

    this.errandSelectionFrame.anims.create(this.getAnimation({
      frameIndex: 6,
      animation: {
        frameCount: 14,
        framesPerSecond: 12
      },
    }));

    this.placeDescriptionText = this.add
    .bitmapText(200, 780, "blackRobotoMicro", "blah")
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

  private addErrandMarker(errandDescription: ErrandDescription): ErrandMarker | undefined {

    const errandMarkerConfig = errandMarkersConfigs.get(errandDescription.id);

    if (errandMarkerConfig === undefined) {
      return undefined;
    }

    const sprite = this.addMapTile(errandMarkerConfig.mapTile, errandMarkerConfig.location)!;

    sprite
    .setInteractive()
    .on('pointerup', () => {
      GAME.goToErrand(errandDescription.id);

      const locationPixels = this.getMapPixelCoords(errandMarkerConfig.location);
      this.errandSelectionFrame.setX(locationPixels.x);
      this.errandSelectionFrame.setY(locationPixels.y);
      this.errandSelectionFrame.anims.play(this.animationKey);
      this.errandSelectionFrame.setVisible(true);
      this.displayErrandDescription();
    })

    return {
      description: errandDescription,
      sprite: sprite
    };
  }

  private async displayErrandDescription() {

    const errand = await GAME.getSelectedErrand();

    if (errand === undefined) {
      return;
    }

    this.errandDescriptionWidget.title.setText(errand.description.title).setVisible(true);
    this.errandDescriptionWidget.page.setText(errand.description.description).setVisible(true);
    this.errandDescriptionWidget.image.setTexture(errand.description.id).setVisible(true);

    this.errandDescriptionWidget.goButton.show(
      { x: 990, y: 760 },
      "Go!",
      () => {
        this.scene.switch("level");
      }
    );
  }
}
