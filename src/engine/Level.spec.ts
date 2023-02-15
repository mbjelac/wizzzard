import { Direction, Level } from "./Level";

let level: Level;

beforeEach(() => {
  level = Level.fromMatrix(
    "# #",
    " @ ",
    "# #"
  );
});

describe("can move ", () => {
  Direction.getAllDirections()
    .forEach(direction =>
      it(direction.name, () => {
        expect(level.tryToMove(direction)).toBe(true);
      }));
});

describe("can not move outside level", () => {
  Direction.getAllDirections()
    .forEach(direction =>
      it(direction.name, () => {
        level.tryToMove(direction);
        expect(level.tryToMove(direction)).toBe(false);
      }));
});

describe("can not move into walls", () => {
  [
    [Direction.UP, Direction.LEFT],
    [Direction.UP, Direction.RIGHT],
    [Direction.DOWN, Direction.RIGHT],
    [Direction.DOWN, Direction.RIGHT],
    [Direction.LEFT, Direction.UP],
    [Direction.LEFT, Direction.DOWN],
    [Direction.RIGHT, Direction.DOWN],
    [Direction.DOWN, Direction.DOWN]
  ]
    .forEach(directions =>
      it(directions.map(direction => direction.name).join(","), () => {
        expect(directions.map(direction => level.tryToMove(direction))).toEqual([true, false]);
      }));
});
