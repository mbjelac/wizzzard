import { ErrandDescription, LevelDimensions } from "./Errand";
import { Level, LevelMatrix } from "./Level";
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

    return new Level(
      matrix.length === 0
        ? populateEmptyLevelMatrix(errand.levelDimensions)
        : matrix,
      errand
    );
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
