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

  const leftFree = !!surroundings
  .thingsInDirection
  .get(directionToLeft)
  ?.every(thing => !thing.is("wall"));

  const straightFree = !!surroundings
  .thingsInDirection
  .get(currentDirection)
  ?.every(thing => !thing.is("wall"));

  if (leftFree) {
    return directionToLeft;
  }

  if (straightFree) {
    return currentDirection;
  }

  return undefined;
}
