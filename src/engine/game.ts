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

    return new LevelFactory().fromMatrix(...errand.levelMatrix);
  }
}

export const GAME = new Game();
