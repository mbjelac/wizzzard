import { LevelLocation, ThingAt } from "./Level";

export class Monsters {
  tick(levelLocations: LevelLocation[][]): MonstersTickResult {

    return {
      movedMonsters: []
    };
  }
}

export interface MonstersTickResult {
  movedMonsters: ThingAt[]
}
