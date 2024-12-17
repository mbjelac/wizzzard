import { LevelDimensions, LevelMatrix, LevelMetadata } from "./level/LevelDescription";
import { Level } from "./level/Level";
import { getLevelDescription, getLevelMatrix, getLevelMetadata } from "./level/levels";
import { SpellBook } from "./spell/SpellBook";
import { Inventory } from "./Inventory";

export class Game {

  private currentLevelId?: string = "void";

  readonly items = new Inventory("items");
  readonly spells = new Inventory("spells");

  readonly spellBook = new SpellBook(this.items, this.spells);

  setCurrentLevel(levelId: string) {
    this.currentLevelId = levelId;
  }

  async getCurrentLevel(): Promise<Level> {

    if (this.currentLevelId === undefined) {
      throw Error("Current level not set!");
    }

    const description = getLevelDescription(this.currentLevelId);

    return new Level(
      description,
      getLevelMatrix(description),
      (items: string[]) => items.forEach(item =>
        (
          description.metadata.type === "errand"
            ? this.items
            : this.spells
        )
        .add(item))
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
