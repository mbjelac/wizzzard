import { Errand, ErrandDescription, ErrandMatrix, LevelDimensions } from "./Errand";
import { Level } from "./Level";
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

  async getSelectedErrand(): Promise<Errand | undefined> {
    return this.currentErrandId ? await getErrand(this.currentErrandId) : undefined;
  }
}

export const GAME = new Game();

export function populateEmptyLevelMatrix(dimensions: LevelDimensions): ErrandMatrix {
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
