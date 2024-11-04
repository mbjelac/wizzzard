import { Thing } from "./Thing";
import { ThingAt } from "./Level";
import { Coords } from "./LevelDescription";
import { Direction } from "./Direction";

export interface Surroundings {
  readonly thingsInDirection: Map<Direction, Thing[]>
}

export function getDirection(spec: string, currentDirection: Direction, surroundings: Surroundings): Direction | undefined {
  switch (spec) {
    case "turnLeft": return turnLeft(currentDirection, surroundings);
    default: throw Error("Monster not defined: " + spec);
  }
}

export function turnLeft(currentDirection: Direction, surroundings: Surroundings): Direction | undefined {

  const directionToLeft = currentDirection.left()

  const leftBlocked = surroundings
  .thingsInDirection
  .get(directionToLeft)
  ?.some(thing => thing.is("wall"));

  if (leftBlocked) {
    return undefined;
  } else {
    return directionToLeft;
  }
}
