import { Coords, Level, LevelLocation, MoveResult, Thing, ThingProperty } from "./Level";
import { createThingProps, LevelFactory } from "./LevelFactory";
import { Direction } from "./Direction";
import { EditorTool } from "./editor/EditorTool";

let level: Level;

const stayed: MoveResult = {
  moved: false,
  died: false,
  levelComplete: false,
  text: undefined,
  removedThings: []
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
      inventory: ["any"],
      receives: []
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

  beforeEach(() => {
    level = createLevel(
      "   ",
      "   ",
      "   "
    );
  });


  it("item is no longer in inventory after giving to receiver", () => {

    addPickup(2, 2, receiverLabel);
    addReceiver(0,0, receiverLabel);

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

  it("only the receiver's item is given", () => {

    const item1 = addPickup(2, 2, "someOtherLabel");
    const item2 = addPickup(2, 0, receiverLabel);
    addReceiver(0,0, receiverLabel);

    // move to pick up #1
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // move to give #1
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.UP);

    // move to pick up #2
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);

    // move to give #2
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    expect(level.getInventory()).toEqual([item1]);
  });

  it("only one item can be given", () => {

    const item1 = addPickup(2, 0, receiverLabel);
    const item2 = addPickup(2, 2, receiverLabel);
    addReceiver(0,1, receiverLabel);

    // move to pick up #2
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // move to give #2
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    // move to pickup #1
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.UP);

    // move to give #1
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    expect(level.getInventory()).toEqual([item1]);
  });

  it("multiple receivers can receive on same location", () => {

    addPickup(2, 0, "foo");
    addPickup(2, 2, "bar");
    addReceiver(0,1, "foo");
    addReceiver(0,1, "bar");

    // move to pick up bar
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // move to give bar
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    // move to pickup foo
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.UP);

    // move to give foo
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    expect(level.getInventory()).toEqual([]);
  });

  it("receiver does not appear in removed things", () => {

    addPickup(2, 1, receiverLabel);
    addReceiver(0,1, receiverLabel);

    // move to pick up
    level.tryToMove(Direction.RIGHT);

    // move to give
    level.tryToMove(Direction.LEFT);
    const removedThings = level.tryToMove(Direction.LEFT).removedThings;

    expect(removedThings).toEqual([]);
  });

  function addPickup(x: number, y: number, label: string): Thing {
    return addThingWithProps({x, y, label, properties: ["pickup"], text: undefined});
  }

  function addReceiver(x: number, y: number, label: string): Thing {
    return addThingWithProps({x, y, label, properties: ["receiver"], text: undefined});
  }
});

describe("vanishing receiver", ()=> {

  let vanishingReceiver: Thing;

  beforeEach(()=> {
    level = createLevel(
      "   ",
      "   ",
      "   ",
      );

    addThingWithProps({
      x: 0,
      y: 1,
      properties: ["pickup"],
      label: "foo",
      text: undefined
    });

    vanishingReceiver = addThingWithProps({
      x: 2,
      y: 1,
      properties: ["receiver", "vanish"],
      label: "foo",
      text: undefined
    });
  });

  it("vanishing receiver vanishes on receiving", () => {

    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);

    expect(getThingsAt(2, 1)).toEqual([]);
  });

  it("vanishing receiver appears in removed things", () => {

    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    const removedThings = level.tryToMove(Direction.RIGHT).removedThings;

    expect(removedThings).toEqual([vanishingReceiver]);
  });

  it("vanishing receiver does not vanish without receiving", () => {

    level.tryToMove(Direction.RIGHT);

    expect(getThingsAt(2, 1)).toEqual([vanishingReceiver]);
  });
});

describe("completing level", () => {

  describe("by pickup", () => {


    it("complete when a required item is in inventory", () => {

      completionRequiresInventory("someLabel");

      addThing(0, 0, "someLabel", "pickup");

      expect(movementToCompletedFlags(
        Direction.UP,
        Direction.LEFT
      )).toEqual([
        false,
        true
      ]);
    });

    it("not complete when a non-required item is in inventory", () => {

      completionRequiresInventory("someLabel");

      addThing(0, 0, "someOtherLabel", "pickup");

      expect(movementToCompletedFlags(
        Direction.UP,
        Direction.LEFT
      )).toEqual([
        false,
        false
      ]);
    });

    it("not complete when only some required items are in inventory", () => {

      completionRequiresInventory("label1", "label2");

      addThing(0, 0, "label1", "pickup");

      expect(movementToCompletedFlags(
        Direction.UP,
        Direction.LEFT
      )).toEqual([
        false,
        false
      ]);
    });

    it("complete when all required items are in inventory", () => {

      completionRequiresInventory("label1", "label2");

      addThing(0, 0, "label1", "pickup");
      addThing(2, 0, "label2", "pickup");

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
  });

  describe("by receive", () => {

    it("complete when required receiver receives", () => {

      completionRequiresReceives("label1");
      addThing(0, 0, "label1", "pickup");
      addThing(2, 2, "label1", "receiver");

      expect(movementToCompletedFlags(
        Direction.UP,
        Direction.LEFT,
        Direction.RIGHT,
        Direction.DOWN,
        Direction.RIGHT,
        Direction.DOWN,
      )).toEqual([
        false,
        false,
        false,
        false,
        false,
        true,
      ]);
    });

    it("not complete when only some required receivers receive", () => {

      completionRequiresReceives("label1", "label2");
      addThing(0, 0, "label1", "pickup");
      addThing(2, 0, "label2", "pickup");
      addThing(0, 2, "label1", "receiver");
      addThing(2, 2, "label2", "receiver");

      expect(movementToCompletedFlags(
        Direction.UP,
        Direction.LEFT,
        Direction.RIGHT,
        Direction.RIGHT,
        Direction.LEFT,
        Direction.DOWN,
        Direction.DOWN,
        Direction.LEFT
      )).toEqual([
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
      ]);
    });

    it("complete when all required receivers receive", () => {

      completionRequiresReceives("label1", "label2");
      addThing(0, 0, "label1", "pickup");
      addThing(2, 0, "label2", "pickup");
      addThing(0, 2, "label1", "receiver");
      addThing(2, 2, "label2", "receiver");

      expect(movementToCompletedFlags(
        Direction.UP,
        Direction.LEFT,
        Direction.RIGHT,
        Direction.RIGHT,
        Direction.LEFT,
        Direction.DOWN,
        Direction.DOWN,
        Direction.LEFT,
        Direction.RIGHT,
        Direction.RIGHT,
      )).toEqual([
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true,
      ]);
    });
  });

  it("complete when both required pickups & receivers done", () => {

    level = new Level({
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
        inventory: ["label1"],
        receives: ["label2"]
      }
    });

    addThing(0, 0, "label1", "pickup");
    addThing(2, 0, "label2", "pickup");
    addThing(0, 2, "label2", "receiver");

    expect(movementToCompletedFlags(
      Direction.UP,
      Direction.LEFT,
      Direction.RIGHT,
      Direction.RIGHT,
      Direction.LEFT,
      Direction.DOWN,
      Direction.DOWN,
      Direction.LEFT,
    )).toEqual([
      false,
      false,
      false,
      false,
      false,
      false,
      false,
      true,
    ]);
  });

  function addThing(x: number, y: number, label: string, ...properties: ThingProperty[]) {
    addThingWithProps({ ...defaultAddThingProps, x, y, label, properties });
  }


  function completionRequiresInventory(...requiredInventory: string[]) {
    level = new Level({
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
        inventory: requiredInventory,
        receives: []
      }
    });
  }

  function completionRequiresReceives(...requiredReceives: string[]) {
    level = new Level({
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
        inventory: [],
        receives: requiredReceives
      }
    });
  }

  function movementToCompletedFlags(...directions: Direction[]): boolean[] {
    return directions.map(direction => level.tryToMove(direction).levelComplete);
  }
});

describe("reading or listening", () => {

  beforeEach(() => {
    level = createLevel(
      "   ",
      "   ",
      "   ",
    )
  });

  it("show text from neighbouring location", () => {

    addText(0, 0, "Foo!", true);

    expect(movementToText(
      Direction.LEFT,
      Direction.RIGHT,
      Direction.UP,
      Direction.RIGHT,
    )).toEqual([
      "Foo!",
      undefined,
      "Foo!",
      undefined
    ]);
  });

  it("do not show non-automatic text from neighbouring location", () => {

    addText(0, 0, "Foo!", false);

    expect(movementToText(
      Direction.LEFT,
      Direction.RIGHT,
      Direction.UP,
      Direction.RIGHT,
    )).toEqual([
      undefined,
      undefined,
      undefined,
      undefined
    ]);
  });

  function addText(x: number, y: number, text: string, isAutomatic: boolean) {
    addThingWithProps({ ...defaultAddThingProps, x, y, properties: isAutomatic ? ["automatic"] : [], text });
  }

  function movementToText(...directions: Direction[]): (string | undefined)[] {
    return directions.map(direction => level.tryToMove(direction).text);
  }

});

interface AddThingProps {
  x: number,
  y: number,
  label: string | undefined,
  properties: ThingProperty[],
  text: string | undefined
}

const defaultAddThingProps: AddThingProps = { x: 0, y: 0, label: undefined, properties: [], text: undefined };

function addThingWithProps(props: AddThingProps): Thing {
  const thing = new Thing({
    label: props.label,
    properties: props.properties,
    text: props.text,
    sprite: "",
  });
  level.levelMatrix[props.y][props.x].things.push(thing);
  return thing;
}

function getAllThings(level: Level): Thing[] {
  return level.levelMatrix.flatMap(row => row.flatMap(loc => loc.things));
}

function getThingsAt(x: number, y: number, skipInitialThings: boolean = true): Thing[] {
  return level.levelMatrix[y][x].things.slice(skipInitialThings ? 1 : 0);
}
