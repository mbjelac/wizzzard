import { Level, MoveResult } from "./Level";
import { LevelFactory } from "./LevelFactory";
import { Direction } from "./Direction";

let level: Level;

const moved: MoveResult = {
  moved: true,
  died: false
}

const stayed: MoveResult = {
  moved: false,
  died: false
}

const movedAndDied: MoveResult = {
  moved: true,
  died: true
}

describe("moving", () => {

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
          expect(level.tryToMove(direction)).toStrictEqual(moved);
        }));
  });

  describe("can not move outside level", () => {
    Direction.getAllDirections()
      .forEach(direction =>
        it(direction.name, () => {
          level.tryToMove(direction);
          expect(level.tryToMove(direction)).toStrictEqual(stayed);
        }));
  });

  describe("can not move into walls", () => {
    [
      [Direction.UP, Direction.LEFT],
      [Direction.UP, Direction.RIGHT],
      [Direction.DOWN, Direction.LEFT],
      [Direction.DOWN, Direction.RIGHT],
      [Direction.LEFT, Direction.UP],
      [Direction.LEFT, Direction.DOWN],
      [Direction.RIGHT, Direction.UP],
      [Direction.RIGHT, Direction.DOWN]
    ]
      .forEach(directions =>
        it(directions.map(direction => direction.name).join(","), () => {
          expect(directions.map(direction => level.tryToMove(direction))).toEqual([moved, stayed]);
        })
      );
  });
});

describe("dying", () => {

  beforeEach(() => {
    level = new LevelFactory().fromMatrix(
      "! !",
      " @ ",
      "! !"
    );
  });

  describe("can move next to fire without dying", () => {
    Direction.getAllDirections()
      .forEach(direction => it(direction.name, () => {
        expect(level.tryToMove(direction)).toStrictEqual(moved);
      }));
  });

  describe("dies when moving into fire", () => {
    [
      [Direction.UP, Direction.LEFT],
      [Direction.UP, Direction.RIGHT],
      [Direction.DOWN, Direction.LEFT],
      [Direction.DOWN, Direction.RIGHT],
      [Direction.LEFT, Direction.UP],
      [Direction.LEFT, Direction.DOWN],
      [Direction.RIGHT, Direction.UP],
      [Direction.RIGHT, Direction.DOWN]
    ]
      .forEach(directions =>
        it(directions.map(direction => direction.name).join(","), () => {
          expect(directions.map(direction => level.tryToMove(direction))).toEqual([moved, movedAndDied]);
        })
      );
  });

  describe("teleports to starting position after death", () => {

    Direction.getAllDirections()
      .forEach(direction =>
        it(direction.name, () => {

          moveIntoFire();

          expect([
            level.tryToMove(direction),
            level.tryToMove(direction)]
          ).toStrictEqual([moved, stayed]);
        }));

    function moveIntoFire() {
      level.tryToMove(Direction.UP);
      level.tryToMove(Direction.RIGHT);
    }
  });
});
