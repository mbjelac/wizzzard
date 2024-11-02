import { ThingAt } from "./Level";
import { LevelMap } from "./LevelMap";

export class Monsters {
  tick(map: LevelMap): MonstersTickResult {

    return {
      movedMonsters: []
    };
  }
}

export interface MonstersTickResult {
  movedMonsters: ThingAt[]
}
