import { LevelDescription, LevelMetadata, LevelMatrix, LevelDimensions } from "./level/LevelDescription";
import { Level } from "./level/Level";
import { getLevelDescription, getLevelMetadata, storeLevel } from "./level/levels";
import { SpellBook } from "./spell/SpellBook";

export class Game {

  private currentLevelId?: string;

  readonly spellBook = new SpellBook();

  async getLevelMetadata(): Promise<LevelMetadata[]> {
    return await getLevelMetadata()
  }

  setCurrentLevel(levelId: string) {
    this.currentLevelId = levelId;
  }

  async getCurrentLevel(): Promise<Level> {

    if (this.currentLevelId === undefined) {
      throw Error("Current level not set!");
    }

    const levelDescription = await getLevelDescription(this.currentLevelId);

    return new Level(levelDescription);
  }

  async setLevel(levelDescription: LevelDescription) {
    await storeLevel(levelDescription);
  }

  async getSelectedLevelDescription(): Promise<LevelDescription | undefined> {
    return this.currentLevelId ? await getLevelDescription(this.currentLevelId) : undefined;
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
