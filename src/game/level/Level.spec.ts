import { Level, LevelLocation, MoveResult } from "./Level";
import { createThingProps, LevelFactory } from "./LevelFactory";
import { Direction } from "./Direction";
import { EditorTool } from "../editor/EditorTool";
import { Coords, LevelDescription, ThingDescription } from "./LevelDescription";
import { ALL_THING_PROPERTIES, SavedThing, Thing, ThingProperty } from "./Thing";

let level: Level;

const stayed: MoveResult = {
  moved: false,
  died: false,
  levelComplete: false,
  text: undefined,
  removedThings: [],
  pushed: [],
  changedState: []
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
    metadata: {
      id: "testLevel",
      description: "",
      title: "",
      type: "errand"
    },
    texts: {},
    levelDimensions: { width: rows[0].length, height: rows.length },
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
      it(
        directions
        .map(direction => direction.name)
        .join(","),
        () => {
          expect(
            directions
            .map(direction => level.tryToMove(direction))
          )
          .toEqual([moved, stayed]);
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

    pickupLocation = level.getLocation({ x: 2, y: 2 })!;
    pickupLocationFloor = pickupLocation.things[0];
    pickupItem = pickupLocation.things[1];
  });


  it("can move over item", () => {
    level.tryToMove(Direction.RIGHT);
    const moveResult = level.tryToMove(Direction.DOWN);
    expect(moveResult.moved).toBe(true);
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

  it("picked up item in removed things", () => {
    level.tryToMove(Direction.RIGHT);
    const removedThings = level.tryToMove(Direction.DOWN).removedThings;
    expect(removedThings).toEqual([pickupItem]);
  });

  it("can not pick up if can not move to location", () => {

    addThingWithProps({
      x: 2,
      y: 2,
      properties: ["wall"],
      label: undefined,
      text: undefined
    });

    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);
    expect(level.getInventory()).toEqual([]);
  });

  describe("multiple items", () => {

    let additionalItem: Thing;

    beforeEach(() => {
      additionalItem = Thing.create(createThingProps(EditorTool.KEY)!);
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
    addReceiver(0, 0, receiverLabel);

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
    addReceiver(0, 0, receiverLabel);

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
    addReceiver(0, 1, receiverLabel);

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
    addReceiver(0, 1, "foo");
    addReceiver(0, 1, "bar");

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
    addReceiver(0, 1, receiverLabel);

    // move to pick up
    level.tryToMove(Direction.RIGHT);

    // move to give
    level.tryToMove(Direction.LEFT);
    const removedThings = level.tryToMove(Direction.LEFT).removedThings;

    expect(removedThings).toEqual([]);
  });

  it("do not move when giving to receiver", () => {

    addPickup(2, 1, receiverLabel);
    addReceiver(0, 1, receiverLabel);

    // move to pick up
    level.tryToMove(Direction.RIGHT);

    // move to give
    level.tryToMove(Direction.LEFT);
    const moved = level.tryToMove(Direction.LEFT).moved;

    expect(moved).toBe(false);
  });

  function addPickup(x: number, y: number, label: string): Thing {
    return addThingWithProps({ x, y, label, properties: ["pickup"], text: undefined });
  }

  function addReceiver(x: number, y: number, label: string): Thing {
    return addThingWithProps({ x, y, label, properties: ["receiver"], text: undefined });
  }
});

describe("opening receiver", () => {

  let openingReceiver: Thing;

  beforeEach(() => {
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

    openingReceiver = addThingWithProps({
      x: 2,
      y: 1,
      properties: ["receiver", "open"],
      label: "foo",
      text: undefined
    });
  });

  it("opening receiver changes state on receiving", () => {

    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    const result = level.tryToMove(Direction.RIGHT);

    expect(result.changedState).toEqual([openingReceiver]);
  });

  it("opening receiver does not change state without receiving", () => {

    const result = level.tryToMove(Direction.RIGHT);

    expect(result.changedState).toEqual([]);
  });

  it("wall opening receiver blocks move if not receiving", () => {

    openingReceiver.description.properties.push("wall");

    const moveResult = level.tryToMove(Direction.RIGHT);

    expect(moveResult.moved).toBe(false);
  });

  it("wall opening receiver does not block move if receiving", () => {

    openingReceiver.description.properties.push("wall");

    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    const moveResult = level.tryToMove(Direction.RIGHT);

    expect(moveResult.moved).toBe(true);
  });
});

describe("giving receiver", () => {

  let givingReceiver: Thing;
  let gift: Thing;

  beforeEach(() => {
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

    gift = addThingWithProps({
      x: 2,
      y: 1,
      properties: ["pickup"],
      label: "bar",
      text: undefined
    });

    givingReceiver = addThingWithProps({
      x: 2,
      y: 1,
      properties: ["receiver", "wall", "give"],
      label: "foo",
      text: undefined
    });
  });

  it("giving receiver gives on receiving", () => {

    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);

    expect(level.getInventory()).toEqual([gift]);
  });

  it("giving receiver does not give if it did not receive", () => {

    level.tryToMove(Direction.RIGHT);

    expect(level.getInventory()).toEqual([]);
  });

  it("gift no longer in level after being given", () => {

    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);

    expect(getAllThings(level).every(thing => thing.id !== gift.id)).toBe(true);
  });

  it("giving receiver gives all pickups under it on receiving", () => {

    const gift2 = addThingWithProps({
      x: 2,
      y: 1,
      properties: ["pickup"],
      label: "pop",
      text: undefined
    })

    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);

    expect(level.getInventory()).toEqual([gift, gift2]);
  });
});

describe("receiver shows text", () => {

  const receiverLabel = "someLabel";
  const preText = "You do not have what I need.";
  const onText = "Yes, that's it! Thank you for giving me what I need!";
  const postText = "Very nice that you gave me what I need.";

  beforeEach(() => {
    level = createLevel(
      "   ",
      "   ",
      "   "
    );

    addPickup(2, 1, receiverLabel);
    addReceiver(0, 1, receiverLabel);
    addReceiverText(0, 1, "preInteraction", preText);
    addReceiverText(0, 1, "onInteraction", onText);
    addReceiverText(0, 1, "postInteraction", postText);
  });


  it("shows pre-text when not receiving", () => {

    const text = level.tryToMove(Direction.LEFT).text;

    expect(text).toEqual(preText);
  });

  it("shows on-text when receiving", () => {

    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.LEFT);
    const text = level.tryToMove(Direction.LEFT).text;

    expect(text).toEqual(onText);
  });

  it("shows post-text after already received", () => {

    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);
    const text = level.tryToMove(Direction.LEFT).text;

    expect(text).toEqual(postText);
  });

  function addReceiverText(x: number, y: number, label: string, text: string): Thing {
    return addThingWithProps({ x, y, label, properties: [], text: text });
  }

});

describe("receiver put in changed-state list", () => {

  const receiverLabel = "any";

  let receiver: Thing;

  beforeEach(() => {
    level = createLevel(
      "   ",
      "   ",
      "   "
    );

    addPickup(2, 1, receiverLabel);
    receiver = addReceiver(0, 1, receiverLabel);
  });

  it("receiver in changed-state list only after receiving", () => {

    expect(movementToChangedStateLists(
      Direction.RIGHT,
      Direction.LEFT,
      Direction.LEFT,
    )).toEqual<Thing[][]>(
      [
        [],
        [],
        [receiver]
      ]
    );
  });
});

describe("death receiver", () => {
  const receiverLabel = "any";

  beforeEach(() => {
    level = createLevel(
      "   ",
      "   ",
      "   "
    );

    addPickup(2, 1, receiverLabel);
    addLabelledThing(0, 1, receiverLabel, "receiver", "death");
  });


  it("causes death when not receiving", () => {

    const died = level.tryToMove(Direction.LEFT).died;

    expect(died).toBe(true);
  });

  it("causes death when not receiving", () => {

    const died = level.tryToMove(Direction.LEFT).died;

    expect(died).toBe(true);
  });

  it("does not cause death when receiving", () => {

    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.LEFT);
    const died = level.tryToMove(Direction.LEFT).died;

    expect(died).toBe(false);
  });

  it("no longer causes death after receiving", () => {

    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);
    const died = level.tryToMove(Direction.LEFT).died;

    expect(died).toBe(false);
  });
});

describe("completing level", () => {

  describe("by pickup", () => {


    it("complete when a required item is in inventory", () => {

      completionRequiresInventory("someLabel");

      addLabelledThing(0, 0, "someLabel", "pickup");

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

      addLabelledThing(0, 0, "someOtherLabel", "pickup");

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

      addLabelledThing(0, 0, "label1", "pickup");

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

      addLabelledThing(0, 0, "label1", "pickup");
      addLabelledThing(2, 0, "label2", "pickup");

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
      addLabelledThing(0, 0, "label1", "pickup");
      addLabelledThing(2, 2, "label1", "receiver");

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
      addLabelledThing(0, 0, "label1", "pickup");
      addLabelledThing(2, 0, "label2", "pickup");
      addLabelledThing(0, 2, "label1", "receiver");
      addLabelledThing(2, 2, "label2", "receiver");

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
      addLabelledThing(0, 0, "label1", "pickup");
      addLabelledThing(2, 0, "label2", "pickup");
      addLabelledThing(0, 2, "label1", "receiver");
      addLabelledThing(2, 2, "label2", "receiver");

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
      )).toEqual([
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
      ...dummyLevel,
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

    addLabelledThing(0, 0, "label1", "pickup");
    addLabelledThing(2, 0, "label2", "pickup");
    addLabelledThing(0, 2, "label2", "receiver");

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


  function completionRequiresInventory(...requiredInventory: string[]) {
    level = new Level({
      ...dummyLevel,
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
      ...dummyLevel,
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

  const dummyLevel: LevelDescription = {
    metadata: {
      id: "dummyLevel",
      description: "",
      title: "",
      type: "errand"
    },
    texts: {},
    levelDimensions: { width: 3, height: 3 },
    matrix: factory.fromMatrix(" "),
    startCoords: { x: 0, y: 0 },
    completionCriteria: {
      inventory: [],
      receives: []
    },
  };
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

  it("show non-automatic text from wall-like location on interaction", () => {

    addText(0, 0, "Foo!", false);

    expect(movementToText(
      Direction.LEFT,
      Direction.UP,
      Direction.RIGHT,
      Direction.UP,
      Direction.LEFT,
    )).toEqual([
      undefined,
      "Foo!",
      undefined,
      undefined,
      "Foo!"
    ]);
  });

  function addText(x: number, y: number, text: string, isAutomatic: boolean) {
    addThingWithProps({ ...defaultAddThingProps, x, y, properties: isAutomatic ? ["automatic", "wall"] : ["wall"], text });
  }

  function movementToText(...directions: Direction[]): (string | undefined)[] {
    return directions.map(direction => level.tryToMove(direction).text);
  }

});


describe("pushing", () => {

  let pushable: Thing;

  beforeEach(() => {
    level = createLevel(
      "     ",
      "     ",
      "     ",
    );

    pushable = addThing(2, 1, "pushable");
  });

  it("can move to pushable", () => {
    const moved = level.tryToMove(Direction.RIGHT).moved;
    expect(moved).toBe(true);
  });

  it("pushable is pushed", () => {
    const pushed = level.tryToMove(Direction.RIGHT).pushed;
    expect(pushed).toEqual([pushable]);
  });

  it("pushable is relocated within level", () => {
    level.tryToMove(Direction.RIGHT);

    expect(getCoordsOf(pushable.id)).toEqual<Coords>({
      x: 3, y: 1
    });
  });

  describe("when wall behind", () => {

    beforeEach(() => {
      addThing(3, 1, "wall");
    });

    it("can not move to push", () => {
      const moved = level.tryToMove(Direction.RIGHT).moved;
      expect(moved).toBe(false);
    });

    it("pushable is not pushed", () => {
      const pushed = level.tryToMove(Direction.RIGHT).pushed;
      expect(pushed).toEqual([]);
    });

    it("pushable is not relocated within level", () => {
      level.tryToMove(Direction.RIGHT);
      expect(getCoordsOf(pushable.id)).toEqual<Coords>({
        x: 2, y: 1
      });
    });
  });

  describe("when pushable behind", () => {

    beforeEach(() => {
      addThing(3, 1, "pushable");
    });

    it("can not move to push", () => {
      const moved = level.tryToMove(Direction.RIGHT).moved;
      expect(moved).toBe(false);
    });

    it("pushable is not pushed", () => {
      const pushed = level.tryToMove(Direction.RIGHT).pushed;
      expect(pushed).toEqual([]);
    });

    it("pushable is not relocated within level", () => {
      level.tryToMove(Direction.RIGHT);
      expect(getCoordsOf(pushable.id)).toEqual<Coords>({
        x: 2, y: 1
      });
    });
  });
});

describe("pushable bridge", () => {

  let bridge: Thing;
  let bridgeable: Thing;

  beforeEach(() => {
    level = createLevel(
      "     ",
      "     ",
      "     ",
    );

    bridge = addThing(2, 1, "pushable", "bridge");
    bridgeable = addThing(2, 0, "bridgeable", "death");
  });

  it("pushing bridge across bridgeable possible", () => {
    expect(
      movesToMoved(
        Direction.DOWN,
        Direction.RIGHT,
        Direction.UP
      )
    )
    .toEqual([
      true,
      true,
      true
    ]);
  });

  it("pushing bridge across bridgeable modifies properties", () => {
    movesToMoved(
      Direction.DOWN,
      Direction.RIGHT,
      Direction.UP
    );

    expect({
      isBridgeStillPushable: bridge.is("pushable"),
      isBridgeStillBridge: bridge.is("bridge"),
      isBridgeableStillDeath: bridgeable.is("death"),
      isBridgeableStillBridgeable: bridgeable.is("bridgeable")
    })
    .toEqual({
      isBridgeStillPushable: false,
      isBridgeStillBridge: false,
      isBridgeableStillDeath: false,
      isBridgeableStillBridgeable: false
    });
  });

  it("pushing bridge across bridgeable changes bridge state", () => {
    expect(
      movementToChangedStateLists(
        Direction.DOWN,
        Direction.RIGHT,
        Direction.UP
      )
    )
    .toEqual([
      [],
      [],
      [bridge]
    ]);
  });

  function movesToMoved(...directions: Direction[]): boolean[] {
    return directions.map(direction => level.tryToMove(direction).moved);
  }

});

describe("teleportation", () => {

  beforeEach(() => {
    level = createLevel(
      "     ",
      "     ",
      "     ",
    );

    addLabelledThing(0, 0, "spot", "teleport");
    addLabelledThing(2, 2, "spot");
  });

  it("teleport changes location to first location with same label", () => {
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    expect(level.getPlayerCoords()).toEqual<Coords>({ x: 2, y: 2 });
  });

  it("teleport changes location to self if no target found", () => {
    level.getLocation({ x: 2, y: 2 })!.things = [];
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    expect(level.getPlayerCoords()).toEqual<Coords>({ x: 0, y: 0 });
  });

});

describe("automatic", ()=> {
  it("changes state on move to it's location", () => {

    level = createLevel(
      "     ",
      "     ",
      "     ",
    );

    const automaticThing = addThing(2, 1, "automatic");

    const changedThings = level.tryToMove(Direction.RIGHT).changedState;

    expect(changedThings).toEqual([automaticThing]);
  });

  it("is no longer automatic on move to it's location", () => {

    level = createLevel(
      "     ",
      "     ",
      "     ",
    );

    const automaticThing = addThing(2, 1, "automatic");

    level.tryToMove(Direction.RIGHT).changedState;

    expect(automaticThing.description.properties).toEqual<ThingProperty[]>([]);
  });
});

describe("remembering stone", () => {

  let rememberingStone: Thing;

  beforeEach(() => {

    level = createLevel(
      "   ",
      "   ",
      "   ",
    );

    rememberingStone = addThing(0, 0, "remember", "wall");
  });

  it("says something when touched", () => {

    const texts = textAfterMove(
      Direction.UP,
      Direction.LEFT,
    );

    expect(texts).toEqual([
      undefined,
      "remembering"
    ]);
  });

  it("changes state when touched", () => {

    const changeStateLists = movementToChangedStateLists(
      Direction.UP,
      Direction.LEFT,
    );

    expect(changeStateLists).toEqual([
      [],
      [rememberingStone]
    ]);
  });

  it("can not remember until touched", () => {

    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.RIGHT);

    expect(level.canRemember()).toBe(false);
  });

  it("can remember when touched", () => {

    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    expect(level.canRemember()).toBe(true);
  });

  it("can remember when touched again", () => {

    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    expect(level.canRemember()).toBe(true);
  });

  it("remembers player location", () => {

    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    const rememberedLocation = level.getPlayerCoords();

    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.RIGHT);

    level.remember();

    expect(level.getPlayerCoords()).toEqual(rememberedLocation);
  });

  it("remembers another player location", () => {

    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    const rememberedLocation = level.getPlayerCoords();

    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.UP);

    const secondRememberedLocation = level.getPlayerCoords();

    level.remember();

    expect(level.getPlayerCoords()).toEqual(secondRememberedLocation);
  });

  it("remembers inventory", () => {

    const item1 = addPickup(2, 2, "1st item");
    const item2 = addPickup(0, 2, "2nd item");

    pickUpItem1();
    touchRememberingStone();
    pickUpItem2();

    level.remember();

    expect(level.getInventory()).toEqual([item1]);
  });

  function getThingDescriptions() {
    return level
    .getSavedLocations()
    .map(row =>
      row.map(location =>
        location.things
        .filter(thing => thing.description.sprite !== "floor")
        .map(thing => thing.description)
      )
    );
  }

  it("remembers things", () => {

    const item1 = addPickup(2, 2, "1st item");
    const item2 = addPickup(0, 2, "2nd item");

    pickUpItem1();
    touchRememberingStone();
    pickUpItem2();

    level.remember();

    expect(getThingDescriptions())
    .toEqual<ThingDescription[][][]>([
      [[rememberingStone.description], [], []],
      [[], [], []],
      [[item2.description], [], []]
    ]);
  });

  it("remembers things again", () => {

    const item1 = addPickup(2, 2, "1st item");
    const item2 = addPickup(0, 2, "2nd item");

    pickUpItem1();
    touchRememberingStone();
    pickUpItem2();

    level.remember();

    pickUpItem2();

    level.remember();

    expect(getThingDescriptions())
    .toEqual<ThingDescription[][][]>([
      [[rememberingStone.description], [], []],
      [[], [], []],
      [[item2.description], [], []]
    ]);
  });

  function pickUpItem1() {
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.RIGHT);
  }

  function pickUpItem2() {
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.DOWN);
  }

  function touchRememberingStone() {
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);
  }

  it("remembers ambient sound", () => {

    addThingWithProps({
      x: 2,
      y: 2,
      properties: ["ambientSound"],
      label: "foo",
      text: undefined
    });

    // trigger ambient sound
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // touch remembering stone
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    level.remember();

    expect(level.getAmbientSound()).toEqual("foo");
  });

  it("triggering another ambient sound overrides current one", () => {

    addThingWithProps({
      x: 2,
      y: 2,
      properties: ["ambientSound"],
      label: "foo",
      text: undefined
    });

    addThingWithProps({
      x: 0,
      y: 2,
      properties: ["ambientSound"],
      label: "bar",
      text: undefined
    });

    // trigger ambient sound
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // trigger another ambient sound
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    expect(level.getAmbientSound()).toEqual("bar");
  });

  it("remembering ambient sound overrides current one", () => {

    addThingWithProps({
      x: 2,
      y: 2,
      properties: ["ambientSound"],
      label: "foo",
      text: undefined
    });

    addThingWithProps({
      x: 0,
      y: 2,
      properties: ["ambientSound"],
      label: "bar",
      text: undefined
    });

    // trigger ambient sound
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);

    // touch remembering stone
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    // trigger another ambient sound
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.DOWN);

    level.remember();

    expect(level.getAmbientSound()).toEqual("foo");
  });

  it("remember things which changed state", () => {

    const receiverLabel1 = "blah";
    const receiverLabel2 = "anotherBlah";

    addPickup(2, 1, receiverLabel1);
    addPickup(2, 2, receiverLabel2);
    const receiver1 = addReceiver(0, 1, receiverLabel1);
    const receiver2 = addReceiver(0, 2, receiverLabel2);

    // pick up 1
    level.tryToMove(Direction.RIGHT);

    // give to receiver 1
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    // touch remembering stone
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    // pick up 2
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.RIGHT);

    // give to receiver
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    level.remember();

    expect(level.getThingsThatChangedState()).toEqual([receiver1, rememberingStone]);
  });

  it("remember inventory after giving", () => {

    const receiverLabel = "blah";

    const pickup = addPickup(2, 1, receiverLabel);
    addReceiver(0, 1, receiverLabel);

    // pick up
    level.tryToMove(Direction.RIGHT);

    // touch remembering stone
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.LEFT);

    // give to receiver
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);

    level.remember();

    expect(level.getInventory()).toEqual([pickup]);
  });

  it("remember pushed things", () => {

    const box = addThing(1, 2, "pushable");

    // touch remembering stone
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    // push
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);

    level.remember();

    expect(getThingDescriptions()).toEqual<ThingDescription[][][]>([
      [[rememberingStone.description], [], []],
      [[], [], []],
      [[], [box.description], []],
    ]);
  });

  it("remember pushed things again", () => {

    const box = addThing(1, 2, "pushable");

    // touch remembering stone
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    // push
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);

    level.remember();

    // push again
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.DOWN);
    level.tryToMove(Direction.LEFT);

    level.remember();

    expect(getThingDescriptions()).toEqual<ThingDescription[][][]>([
      [[rememberingStone.description], [], []],
      [[], [], []],
      [[], [box.description], []],
    ]);
  });

  it("remember properties", () => {

    const thing = addThingWithProps({
      x: 2, y: 2,
      properties: ["pushable", "teleport"],
      text: undefined,
      label: "foo"
    });

    // touch remembering stone
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    thing.description.properties.push("wall");

    level.remember();

    const rememberedThing = level
    .getLocation({ x: 2, y: 2 })!
    .things
    .filter(thing => thing.description.label === "foo")[0];

    expect(rememberedThing.description.properties).toEqual<ThingProperty[]>([
      "pushable",
      "teleport"
    ]);
  });
});

function addThing(x: number, y: number, ...properties: ThingProperty[]): Thing {
  return addThingWithProps({
    x: x,
    y: y,
    properties: properties,
    label: undefined,
    text: undefined
  });
}

interface AddThingProps {
  x: number,
  y: number,
  label: string | undefined,
  properties: ThingProperty[],
  text: string | undefined
}


const defaultAddThingProps: AddThingProps = { x: 0, y: 0, label: undefined, properties: [], text: undefined };

function addReceiver(x: number, y: number, label: string): Thing {
  return addThingWithProps({ x, y, label, properties: ["receiver", "wall"], text: undefined });
}

function addPickup(x: number, y: number, label: string): Thing {
  return addThingWithProps({ x, y, label, properties: ["pickup"], text: undefined });
}

function addThingWithProps(props: AddThingProps): Thing {
  const thing = Thing.create({
    label: props.label,
    properties: props.properties,
    text: props.text,
    sprite: "",
  });
  level.getLocation({ x: props.x, y: props.y })!.things.push(thing);
  return thing;
}

function addLabelledThing(x: number, y: number, label: string, ...properties: ThingProperty[]): Thing {
  return addThingWithProps({ ...defaultAddThingProps, x, y, label, properties });
}

function getAllThings(level: Level): SavedThing[] {
  return level.getSavedLocations().flatMap(row => row.flatMap(loc => loc.things));
}

function getThingsAt(x: number, y: number, skipInitialThings: boolean = true): Thing[] {
  return level.getLocation({ x, y })!.things.slice(skipInitialThings ? 1 : 0);
}

function getCoordsOf(thingId: number): Coords | undefined {
  return level.findLocationByThingId(thingId);
}

function movementToChangedStateLists(...directions: Direction[]): Thing[][] {
  return directions.map(direction => level.tryToMove(direction).changedState);
}

function textAfterMove(...directions: Direction[]): (string | undefined)[] {
  return directions.map(direction => level.tryToMove(direction).text);
}