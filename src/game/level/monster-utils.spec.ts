import { turnLeft } from "./monster-utils";
import { Direction } from "./Direction";
import { Thing } from "./Thing";

const wall = Thing.create({
  sprite: "any",
  properties: ["wall"]
});

describe("turnLeft", () => {

  describe("turn and go left when possible", () => {

    const surroundings = {
      thingsInDirection: new Map<Direction, Thing[]>()
      .set(Direction.UP, [])
      .set(Direction.LEFT, [])
      .set(Direction.RIGHT, [])
      .set(Direction.DOWN, [])
    };

    it.each<[Direction, Direction]>([
      [Direction.UP, Direction.LEFT],
      [Direction.LEFT, Direction.DOWN],
      [Direction.DOWN, Direction.RIGHT],
      [Direction.RIGHT, Direction.UP],
    ])("when going %s, turn %s", (currentDirection, nextDirection) => {
      expect(turnLeft(currentDirection, surroundings)).toEqual(nextDirection);
    });
  });

  it("go straight when left not possible", () => {

    const surroundings = {
      thingsInDirection: new Map<Direction, Thing[]>()
      .set(Direction.UP, [])
      .set(Direction.LEFT, [wall])
      .set(Direction.RIGHT, [])
      .set(Direction.DOWN, [])
    };

    expect(turnLeft(Direction.UP, surroundings)).toEqual(Direction.UP);
  });

  it.each<Map<Direction, Thing[]>>([
    new Map<Direction, Thing[]>()
    .set(Direction.UP, [wall])
    .set(Direction.LEFT, [wall])
    .set(Direction.RIGHT, [])
    .set(Direction.DOWN, []),
    new Map<Direction, Thing[]>()
    .set(Direction.LEFT, [wall])
    .set(Direction.RIGHT, [])
    .set(Direction.DOWN, []),
    new Map<Direction, Thing[]>()
    .set(Direction.UP, [wall])
    .set(Direction.RIGHT, [])
    .set(Direction.DOWN, []),
    new Map<Direction, Thing[]>()
    .set(Direction.RIGHT, [])
    .set(Direction.DOWN, []),
  ])("return nothing when neither straight nor left possible", (example) => {

    const surroundings = { thingsInDirection: example };

    expect(turnLeft(Direction.UP, surroundings)).toBeUndefined();
  });
});
