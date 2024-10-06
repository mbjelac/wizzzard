import Phaser from 'phaser';
import { Coords, ErrandDescription } from "../engine/Errand";
import { GAME } from "../engine/game";
import config from "../config";
import { DialogBox } from "./widgets/DialogBox";


const depths = {
  errandText: 0
};

const maxErrandAmount = 8;

interface ErrandMarker {
  description: ErrandDescription,
  sprite: Phaser.GameObjects.Sprite
}

export default class ErrandsGui extends Phaser.Scene {

  // @ts-ignore
  private errandMarkers: ErrandMarker[] = [];

  private readonly dialogBox = new DialogBox();

  constructor() {
    super('errands');
    console.log("Errands constructor")
  }

  preload() {

    console.log("Errands preload")

    this.load.image("errandMarker", "assets/map_errand_marker.png");
    this.load.image("map", "assets/map.png");

    this.load.bitmapFont("unnamed", "assets/fonts/Unnamed.png", "assets/fonts/Unnamed.xml");
    this.load.bitmapFont("redRobotoSmall", "assets/fonts/red-roboto-small.png", "assets/fonts/roboto-small.xml");


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

    this.errandMarkers.push(...errands.map(errandDescription => {
      const mapPixelCoords = this.getMapPixelCoords(errandDescription.mapMarkerLocation);
      return {
        description: errandDescription,
        sprite: this.add.sprite(
          mapPixelCoords.x,
          mapPixelCoords.y,
          'errandMarker'
        )
        .setDisplaySize(7 * 4, 8 * 4)
        .setInteractive()
        .on('pointerup', () => {

          GAME.goToErrand(errandDescription.id);
          this.scene.switch("journal");
        })
      };
    }));
  }

  create() {
    console.log("Errands create")

    this.dialogBox.create(this);

    const screenWidth = config.scale!.width! as number;
    const screenHeight = config.scale!.height! as number

    this.add
    .sprite(screenWidth / 2, screenHeight / 2, "map")
    .setDisplaySize(screenWidth, screenHeight);
  }

  update(time: number, delta: number) {

  }

  private getMapPixelCoords(location: Coords): Coords {
    const coordinateSystemCoefficient = 8;
    const stretchCoefficient = 4;
    return {
      x: (location.x + 1) * coordinateSystemCoefficient * stretchCoefficient,
      y: (location.y + 1) * coordinateSystemCoefficient * stretchCoefficient,
    };
  }
}
