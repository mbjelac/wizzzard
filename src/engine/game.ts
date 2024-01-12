import { Errand, ErrandDescription } from "./Errand";
import { Level } from "./Level";
import { LevelFactory } from "./LevelFactory";
import { errands } from "./errands";

export class Game {

  private currentErrand?: Errand;

  getErrandDescriptions(): ErrandDescription[] {
    return errands.map(errand => errand.description);
  }

  goToErrand(errandId: string) {

    const errand = errands.find(errand => errand.description.id === errandId);

    if (errand === undefined) {
      throw Error("Errand not found: " + errandId);
    }

    this.currentErrand = errand;
  }

  getCurrentLevel(): Level {

    if (this.currentErrand === undefined) {
      throw Error("Currently not on errand!");
    }

    return new LevelFactory().fromMatrix(...this.currentErrand.levelMatrix);
  }
}

export const GAME = new Game();
