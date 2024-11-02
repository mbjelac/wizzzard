import { Thing } from "./Thing";
import { ThingAt } from "./Level";
import { Coords } from "./LevelDescription";

export type ThingMap = Things[][];

export interface Things {
  things: Thing[]
}

export class Monster {
  constructor(
    private readonly monsterThing: Thing,
    private readonly monsterCoords: Coords,
    private readonly map: ThingMap) {
  }

  move(): ThingAt {
    return {
      thing: this.monsterThing,
      at: this.monsterCoords
    };
  }
}
