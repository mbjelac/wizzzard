import { Errand, ErrandDescription, LevelDimensions } from "./Errand";
import { Level, LevelMatrix } from "./Level";
import { getErrand, getErrandDescriptions, setErrand } from "./errands";

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

    return new Level(errand);
  }

  async setErrand(errand: Errand) {
    await setErrand(errand);
  }
}

export const GAME = new Game();

export function populateEmptyLevelMatrix(dimensions: LevelDimensions): LevelMatrix {
  if (dimensions.width === 0 || dimensions.height === 0) {
    return [];
  }

  return Array(dimensions.height)
    .fill(null)
    .map(() => Array(dimensions.width)
      .fill(null)
      .map(() => ({ things: [] }))
    );
}
