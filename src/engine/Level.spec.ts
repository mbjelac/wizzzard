import { Coords, Level, LevelLocation, MoveResult, Thing } from "./Level";
import { LevelFactory } from "./LevelFactory";
import { Direction } from "./Direction";
import { createThingProps } from "./editor/LevelEditor";
import { EditorTool } from "./editor/EditorTool";

let level: Level;

const stayed: MoveResult = {
  moved: false,
  died: false,
  levelComplete: false
}

const moved: MoveResult = {
  ...stayed,
  moved: true,
}

const movedAndDied: MoveResult = {
  ...moved,
  died: true
}

const startCoords: Coords = { x: 1, y: 1 };

const factory = new LevelFactory();

function createLevel(...rows: string[]): Level {
  return new Level({
    description: {
      id: "testLevel",
      description: "",
      title: ""
    },
    levelDimensions: { width: 3, height: 3 },
    matrix: factory.fromMatrix(...rows),
    startCoords: startCoords,
    completionCriteria: {
      inventory: ["any"]
    }
  });
}

describe("moving", () => {

  beforeEach(() => {
    level = createLevel(
      "# #",
      "   ",
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
    level = createLevel(
      "! !",
      "   ",
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

describe("picking up things", () => {

  let pickupLocation: LevelLocation;
  let pickupLocationFloor: Thing;
  let pickupItem: Thing;

  beforeEach(() => {
    level = createLevel(
      "# #",
      "   ",
      "# ."
    );

    pickupLocation = level.levelMatrix[2][2];
    pickupLocationFloor = pickupLocation.things[0];
    pickupItem = pickupLocation.things[1];
  });


  it("can move over item", () => {
    level.tryToMove(Direction.RIGHT);
    const moveResult = level.tryToMove(Direction.DOWN);
    expect(moveResult).toEqual<typeof moveResult>(moved);
  });

  it("there is one item which can be picked up", () => {
    expect(pickupLocation.things).toEqual([pickupLocationFloor, pickupItem]);
  });

  it("picked up item no longer in level if moves on it", () => {
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);
    expect(pickupLocation.things).toEqual([pickupLocationFloor])
  });

  it("initial inventory is empty", () => {
    expect(level.getInventory()).toHaveLength(0);
  });

  it("picked up item in inventory if moves on it", () => {
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);
    expect(level.getInventory()).toEqual([pickupItem]);
  });

  describe("multiple items", () => {

    let additionalItem: Thing;

    beforeEach(() => {
      additionalItem = new Thing(createThingProps(EditorTool.KEY)!);
      pickupLocation.things.push(additionalItem);
    });

    it("picks up all items if moves on pickup location", () => {
      level.tryToMove(Direction.RIGHT);
      level.tryToMove(Direction.DOWN);
      expect(pickupLocation.things).toEqual([pickupLocationFloor])
    });

    it("all picked up items in inventory if moves on pickup location", () => {
      level.tryToMove(Direction.RIGHT);
      level.tryToMove(Direction.DOWN);
      expect(level.getInventory()).toEqual([pickupItem, additionalItem])
    });
  });
});

describe("giving a picked up item to a receiver", () => {

  const receiverLabel = "someLabel";

  let receivableItem: Thing;
  let receiver: Thing;

  beforeEach(() => {
    level = createLevel(
      "   ",
      "   ",
      "   "
    );

    receivableItem = new Thing(createThingProps(EditorTool.KEY_GREEN, receiverLabel)!);
    receiver = new Thing(createThingProps(EditorTool.RECEIVER, receiverLabel)!);

    level.levelMatrix[2][2].things.push(receivableItem);
    level.levelMatrix[0][0].things.push(receiver);
  });


  it("item is no longer in inventory after giving to receiver", () => {

    // move to pick up
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // move to give
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.UP);

    expect(level.getInventory()).toEqual([]);
  });

  it("item is not in level after giving to receiver", () => {

    // move to pick up
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // move to give
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.UP);

    expect(getAllThings(level).every(thing => thing.id !== receivableItem.id)).toBe(true);
  });

  it("only the receiver's item is given", () => {

    const anotherPickupItem = new Thing(createThingProps(EditorTool.KEY, "someOtherLabel")!);
    const anotherPickupLocation = level.levelMatrix[0][2];
    anotherPickupLocation.things.push(anotherPickupItem);

    // move to pick up
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // move to pick up another
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.UP);

    // move to receiver
    level.tryToMove(Direction.LEFT);

    // give
    level.tryToMove(Direction.LEFT);


    expect(level.getInventory()).toEqual([anotherPickupItem]);
  });

  it("only one item can be given", () => {

    const receivableItem2 = new Thing(createThingProps(EditorTool.KEY, receiverLabel)!);
    level.levelMatrix[0][2].things.push(receivableItem2);

    // move to pick up
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // move to pick up another
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.UP);

    // move to receiver
    level.tryToMove(Direction.LEFT);

    // give twice
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);


    expect(level.getInventory()).toEqual([receivableItem2]);
  });
});

describe("completing level", () => {

  function createLevel(requiredInventory: string[]): Level {
    return new Level({
      description: {
        id: "testLevel",
        description: "",
        title: ""
      },
      levelDimensions: { width: 3, height: 3 },
      matrix: factory.fromMatrix(
        "   ",
        "   ",
        "   "
      ),
      startCoords: { x: 1, y: 1 },
      completionCriteria: {
        inventory: requiredInventory
      }
    });
  }

  it("complete when a required item is in inventory", () => {

    level = createLevel(["someLabel"]);

    level.levelMatrix[0][0].things.push(new Thing({
      label: "someLabel",
      properties: ["pickup"],
      sprite: "key",
    }));

    expect(movementToCompletedFlags(
      Direction.UP,
      Direction.LEFT
    )).toEqual([
      false,
      true
    ]);
  });

  it("not complete when a non-required item is in inventory", () => {

    level = createLevel(["someLabel"]);

    level.levelMatrix[0][0].things.push(new Thing({
      label: "someOtherLabel",
      properties: ["pickup"],
      sprite: "key",
    }));

    expect(movementToCompletedFlags(
      Direction.UP,
      Direction.LEFT
    )).toEqual([
      false,
      false
    ]);
  });

  it("not complete when only some required items are in inventory", () => {

    level = createLevel(["label1", "label2"]);

    level.levelMatrix[0][0].things.push(new Thing({
      label: "label1",
      properties: ["pickup"],
      sprite: "key",
    }));

    expect(movementToCompletedFlags(
      Direction.UP,
      Direction.LEFT
    )).toEqual([
      false,
      false
    ]);
  });

  it("complete when all required items are in inventory", () => {

    level = createLevel(["label1", "label2"]);

    level.levelMatrix[0][0].things.push(new Thing({
      label: "label1",
      properties: ["pickup"],
      sprite: "key",
    }));

    level.levelMatrix[0][2].things.push(new Thing({
      label: "label2",
      properties: ["pickup"],
      sprite: "key",
    }));

    expect(movementToCompletedFlags(
      Direction.UP,
      Direction.LEFT,
      Direction.RIGHT,
      Direction.RIGHT,
    )).toEqual([
      false,
      false,
      false,
      true
    ]);
  });

  function movementToCompletedFlags(...directions: Direction[]): boolean[] {
    return directions.map(direction => level.tryToMove(direction).levelComplete);
  }
});

function getAllThings(level: Level): Thing[] {
  return level.levelMatrix.flatMap(row => row.flatMap(loc => loc.things));
}
