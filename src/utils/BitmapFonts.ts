import { Scene } from "phaser";

export class BitmapFonts {

  private static instance: BitmapFonts;

  static getInstance(): BitmapFonts {
    if (this.instance == undefined) {
      this.instance = new BitmapFonts();
    }
    return this.instance;
  }

  private constructor(private fontsLoaded = false) {
  }

  loadFonts(scene: Scene) {
    if (this.fontsLoaded) {
      return;
    }

    this.fontsLoaded = true;

    scene.load.bitmapFont("unnamed", "assets/fonts/Unnamed.png", "assets/fonts/Unnamed.xml");
    scene.load.bitmapFont("redRobotoSmall", "assets/fonts/red-roboto-small.png", "assets/fonts/roboto-small.xml");
    scene.load.bitmapFont("blackRobotoMicro", "assets/fonts/roboto-micro.png", "assets/fonts/roboto-micro.xml");

  }
}
