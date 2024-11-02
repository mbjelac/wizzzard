import { Thing } from "./Thing";
import { ThingAt } from "./Level";
import { Coords } from "./LevelDescription";
import { Direction } from "./Direction";

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

    const directionSpec = this.monsterThing.description.label?.split("|")[1];

    const direction = Direction.getAllDirections().find(direction => direction.name.toLowerCase() == directionSpec);

    if (direction === undefined) {
      throw Error("Failed to parse direction: " + this.monsterThing.description.label);
    }

    return {
      thing: this.monsterThing,
      at: direction.move(this.monsterCoords)
    };
  }
}
