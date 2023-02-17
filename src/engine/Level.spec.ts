import { Direction, Level, MoveResult } from "./Level";
import { LevelFactory } from "./LevelFactory";

let level: Level;

const didMove: MoveResult = {
  moved: true,
  died: false
}

const didNotMove: MoveResult = {
  moved: false,
  died: false
}

beforeEach(() => {
  level = new LevelFactory().fromMatrix(
    "# #",
    " @ ",
    "# #"
  );
});

describe("can move ", () => {
  Direction.getAllDirections()
    .forEach(direction =>
      it(direction.name, () => {
        expect(level.tryToMove(direction)).toStrictEqual(didMove);
      }));
});

describe("can not move outside level", () => {
  Direction.getAllDirections()
    .forEach(direction =>
      it(direction.name, () => {
        level.tryToMove(direction);
        expect(level.tryToMove(direction)).toStrictEqual(didNotMove);
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
        expect(directions.map(direction => level.tryToMove(direction))).toEqual([didMove, didNotMove]);
      }));
});
