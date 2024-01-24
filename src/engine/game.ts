import { ErrandDescription } from "./Errand";
import { Level } from "./Level";
import { LevelFactory } from "./LevelFactory";
import { getErrand, getErrandDescriptions } from "./errands";

export class Game {

  private currentErrandId?: string;

  async getErrandDescriptions(): Promise<ErrandDescription[]> {
    return await getErrandDescriptions()
  }

  goToErrand(errandId: string) {
    this.currentErrandId = errandId;
  }

  async getCurrentLevel(): Promise<Level> {

    if (this.currentErrandId === undefined) {
      throw Error("Currently not on errand!");
    }

    const errand = await getErrand(this.currentErrandId);

    const matrix = new LevelFactory().fromMatrix(...errand.levelMatrix);

    return new Level(matrix, errand.startCoords);
  }
}

export const GAME = new Game();
