import { Level, MoveResult, ThingAt, TickResult } from "./Level";
import { createThingProps, LevelFactory } from "./LevelFactory";
import { Direction } from "./Direction";
import { EditorTool } from "../editor/EditorTool";
import { Coords, LevelDescription, Spell, ThingDescription } from "./LevelDescription";
import { Thing, ThingProperty } from "./Thing";
import { LevelLocation } from "./LevelMap";
import { PreparedSpell } from "./PreparedSpells";

let level: Level;

const factory = new LevelFactory();

const dummyLevel: LevelDescription = {
  metadata: {
    id: "dummyLevel",
    description: "",
    title: "",
    type: "errand"
  },
  texts: {},
  levelDimensions: { width: 3, height: 3 },
  startCoords: { x: 0, y: 0 },
  completionCriteria: {
    inventory: [],
    receives: []
  },
};

const stayed: MoveResult = {
  moved: false,
  died: false,
  levelComplete: false,
  text: undefined,
  removedThings: [],
  pushed: [],
  changedState: [],
  addedThings: [],
  casting: false
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


const itemsAddedToGameInventory: string[] = [];

const addToGameInventoryFake: (items: string[]) => void = (items) => itemsAddedToGameInventory.push(...items);

function createLevel(...rows: string[]): Level {
  return new Level(
    {
      metadata: {
        id: "testLevel",
        description: "",
        title: "",
        type: "errand"
      },
      texts: {},
      levelDimensions: { width: rows[0].length, height: rows.length },
      startCoords: startCoords,
      completionCriteria: {
        inventory: ["any"],
        receives: []
      }
    },
    factory.fromMatrix(...rows),
    addToGameInventoryFake
  );
}

beforeEach(() => {
  itemsAddedToGameInventory.length = 0;
})

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

  it("gift given only once", () => {

    level.tryToMove(Direction.LEFT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);

    expect(level.getInventory()).toEqual([gift]);
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

  it("completion adds all inventory items to game inventory", () => {
    completionRequiresInventory("someLabel");

    addLabelledThing(0, 0, "someLabel", "pickup");

    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    expect(itemsAddedToGameInventory).toEqual<string[]>(["someLabel"]);
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

    level = new Level(
      {
        ...dummyLevel,
        levelDimensions: { width: 3, height: 3 },
        startCoords: { x: 1, y: 1 },
        completionCriteria: {
          inventory: ["label1"],
          receives: ["label2"]
        }
      },
      factory.fromMatrix(
        "   ",
        "   ",
        "   "
      ),
      addToGameInventoryFake
    );

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
    level = new Level(
      {
        ...dummyLevel,
        levelDimensions: { width: 3, height: 3 },
        startCoords: { x: 1, y: 1 },
        completionCriteria: {
          inventory: requiredInventory,
          receives: []
        }
      },
      factory.fromMatrix(
        "   ",
        "   ",
        "   "
      ),
      addToGameInventoryFake
    );
  }

  function completionRequiresReceives(...requiredReceives: string[]) {
    level = new Level(
      {
        ...dummyLevel,
        levelDimensions: { width: 3, height: 3 },
        startCoords: { x: 1, y: 1 },
        completionCriteria: {
          inventory: [],
          receives: requiredReceives
        }
      },
      factory.fromMatrix(
        "   ",
        "   ",
        "   "
      ),
      addToGameInventoryFake
    );
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

    addTextWall(0, 0, "Foo!", true);

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

    addTextWall(0, 0, "Foo!", false);

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

  describe("show non-automatic text", () => {
    it("from wall-like location on interaction", () => {

      addTextWall(0, 0, "Foo!", false);

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

    it("from floor you're standing on", () => {

      addText(0, 0, "Foo!", false);

      expect(movementToText(
        Direction.LEFT,
        Direction.UP,
        Direction.RIGHT,
        Direction.LEFT,
      )).toEqual([
        undefined,
        "Foo!",
        undefined,
        "Foo!"
      ]);
    });
  });

  function addTextWall(x: number, y: number, text: string, isAutomatic: boolean) {
    addThingWithProps({ ...defaultAddThingProps, x, y, properties: isAutomatic ? ["automatic", "wall"] : ["wall"], text });
  }

  function addText(x: number, y: number, text: string, isAutomatic: boolean) {
    addThingWithProps({ ...defaultAddThingProps, x, y, properties: isAutomatic ? ["automatic"] : [], text });
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
    expect(level.tryToMove(Direction.RIGHT).pushed).toEqual([pushable]);
  });

  it("pushable is relocated within level", () => {
    expect([
        Direction.RIGHT,
        Direction.DOWN,
        Direction.RIGHT,
        Direction.RIGHT,
        Direction.UP,
        Direction.LEFT,
      ]
      .map(direction => level.tryToMove(direction).pushed)
    ).toEqual([
      [pushable],
      [],
      [],
      [],
      [],
      [pushable],
    ]);
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
      expect(level.tryToMove(Direction.RIGHT).pushed).toEqual([]);
    });

    it("pushable is not relocated within level", () => {
      expect(level.tryToMove(Direction.RIGHT).pushed).toEqual([]);
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
      const moveResult = level.tryToMove(Direction.RIGHT);
      expect(moveResult.pushed).toEqual([]);
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

describe("automatic", () => {
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

  it("remember properties repeatedly", () => {

    addThingWithProps({
      x: 2, y: 2,
      properties: ["pushable", "teleport"],
      text: undefined,
      label: "foo"
    });

    const findFoo = () => level
    .getLocation({ x: 2, y: 2 })!
    .things
    .filter(thing => thing.description.label === "foo")[0]

    // touch remembering stone
    level.tryToMove(Direction.UP);
    level.tryToMove(Direction.LEFT);

    findFoo().description.properties.push("wall");

    findFoo().removeProperty("pushable");
    level.remember();
    findFoo().removeProperty("pushable");
    level.remember();

    expect(findFoo().description.properties).toEqual<ThingProperty[]>([
      "pushable",
      "teleport"
    ]);
  });
});

describe("initial inventory", () => {

  it("inventory is filled from initial inventory on create", () => {

    const initialThingDescriptions: ThingDescription[] = [
      {
        label: "foo",
        sprite: "fooSprite",
        properties: ["pickup", "bridge"],
      },
      {
        label: "bar",
        sprite: "barSprite",
        properties: ["pushable"],
      }
    ]

    const level = new Level(
      {
        ...dummyLevel,
        initialInventory: initialThingDescriptions
      },
      factory.fromMatrix(),
      addToGameInventoryFake
    );

    expect(level.getInventory().map(thing => thing.description))
    .toEqual(initialThingDescriptions);
  });
});

describe("slot", () => {

  beforeEach(() => {
    level = createLevel(
      "   ",
      "   ",
      "   "
    );
  });

  it("put pickup into slot", () => {

    const pickup = addThing(0, 1, "pickup");
    const slot = addThing(2, 1, "slot", "wall");

    // pick up
    level.tryToMove(Direction.LEFT);

    // insert into slot
    level.tryToMove(Direction.RIGHT);
    level.tryToMove(Direction.RIGHT);

    expect(getThingDescriptions()).toEqual([
      [[], [], []],
      [[], [], [slot.description, pickup.description]],
      [[], [], []],
    ]);
  });

  it("pickup put into slot is added", () => {

    const pickup = addThing(0, 1, "pickup");
    const slot = addThing(2, 1, "slot", "wall");

    // pick up
    level.tryToMove(Direction.LEFT);

    // move next to slot
    level.tryToMove(Direction.RIGHT);

    expect(level.tryToMove(Direction.RIGHT).addedThings).toEqual<ThingAt[]>(
      [
        {
          at: { x: 2, y: 1 },
          thing: pickup
        }
      ]
    );
  });

  it("pickup put is not added when not interacting with slot", () => {

    const pickup = addThing(0, 1, "pickup");
    const slot = addThing(2, 1, "slot", "wall");

    // pick up
    level.tryToMove(Direction.LEFT);

    expect(level.tryToMove(Direction.RIGHT).addedThings).toEqual([]);
  });

  it("pickup from slot", () => {
    const slot = addThing(2, 1, "slot", "wall");
    const pickup = addThing(2, 1, "pickup");

    // pick up
    level.tryToMove(Direction.RIGHT);

    expect(getThingDescriptions()).toEqual([
      [[], [], []],
      [[], [], [slot.description]],
      [[], [], []],
    ]);
  });

  it("item picked up from slot is in inventory", () => {
    const slot = addThing(2, 1, "slot", "wall");
    const pickup = addThing(2, 1, "pickup");

    // pick up
    level.tryToMove(Direction.RIGHT);

    expect(level.getInventory()).toEqual([pickup]);
  });

  it("item picked up from slot is removed", () => {
    const slot = addThing(2, 1, "slot", "wall");
    const pickup = addThing(2, 1, "pickup");

    expect(level.tryToMove(Direction.RIGHT).removedThings).toEqual([pickup]);
  });
});

describe("monster", () => {

  it("moves in empty space", () => {

    level = createLevel(
      "    ",
      "    ",
      "    ",
      "    ",
    );

    const monster = addMonster("turnLeft|down", 1, 1);

    expect(getTickResults(4).map(result => result.movedThings)).toEqual<ThingAt[][]>([
      [{ thing: monster, at: { x: 2, y: 1 } }],
      [{ thing: monster, at: { x: 2, y: 0 } }],
      [{ thing: monster, at: { x: 1, y: 0 } }],
      [{ thing: monster, at: { x: 1, y: 1 } }],
    ]);
  });

  it("eats player", () => {

    level = createLevel(
      "    ",
      "  ##",
      "    ",
      "    ",
    );

    const monster = addMonster("turnLeft|left", 3, 0);

    expect(getTickResults(3).map(result => result.died)).toEqual<boolean[]>([
      false,
      false,
      true
    ]);
  });

  function addMonster(label: string, x: number, y: number): Thing {
    return addThingWithProps({
      label: label,
      properties: ["monster"],
      x: x,
      y: y,
      text: undefined
    });
  }

  function getTickResults(numberOfTicks: number): TickResult[] {
    return Array(numberOfTicks)
    .fill(0)
    .map(_ => {
      return level.tick();
    });
  }
});

describe("transmuter", () => {

  let foo: Thing;
  let bar: Thing;
  let pop: Thing;
  let bla: Thing;

  beforeEach(() => {

    level = createLevel(
      "   ",
      "   ",
      "   ",
    );

    addThingWithProps({
      x: 1,
      y: 0,
      label: "foo-0-2,bar-2-2:pop-2-0,bla-0-0",
      properties: ["wall", "transmute"],
      text: undefined,
    });
    pop = addPickup(1, 0, "pop");
    bla = addPickup(1, 0, "bla");
  });

  function getActual() {
    const things = getThingDescriptions();

    return {
      fooLocation: things[2][0],
      barLocation: things[2][2],
      popTarget: things[0][2],
      blaTarget: things[0][0],
      source: things[0][1].filter(description => description.properties.every(property => property !== "transmute"))
    };
  }

  it("does nothing if some ingredients missing", () => {

    foo = addLabelledThing(0, 2, "foo", "pickup");

    level.tryToMove(Direction.UP);

    const actual = getActual();

    expect(actual).toEqual<typeof actual>({
      fooLocation: [foo.description],
      barLocation: [],
      popTarget: [],
      blaTarget: [],
      source: [pop.description, bla.description]
    });
  });

  it("transmutes if all ingredients there", () => {

    foo = addLabelledThing(0, 2, "foo", "pickup");
    bar = addLabelledThing(2, 2, "bar", "pickup");

    level.tryToMove(Direction.UP);

    const actual = getActual();

    expect(actual).toEqual<typeof actual>({
      fooLocation: [],
      barLocation: [],
      popTarget: [pop.description],
      blaTarget: [bla.description],
      source: []
    });
  });

  it("does nothing if ingredients in wrong place", () => {

    foo = addLabelledThing(2, 2, "foo", "pickup");
    bar = addLabelledThing(0, 2, "bar", "pickup");

    level.tryToMove(Direction.UP);

    const actual = getActual();

    expect(actual).toEqual<typeof actual>({
      fooLocation: [bar.description],
      barLocation: [foo.description],
      popTarget: [],
      blaTarget: [],
      source: [pop.description, bla.description]
    });
  });

  it("does nothing if ingredients have wrong label", () => {

    foo = addLabelledThing(0, 2, "fo", "pickup");
    bar = addLabelledThing(2, 2, "bar", "pickup");

    level.tryToMove(Direction.UP);

    const actual = getActual();

    expect(actual).toEqual<typeof actual>({
      fooLocation: [foo.description],
      barLocation: [bar.description],
      popTarget: [],
      blaTarget: [],
      source: [pop.description, bla.description]
    });
  });

  it("transmuting reports changes", () => {

    foo = addLabelledThing(0, 2, "foo", "pickup");
    bar = addLabelledThing(2, 2, "bar", "pickup");

    const moveResult = level.tryToMove(Direction.UP);

    const actual = {
      removed: moveResult.removedThings,
      added: moveResult.addedThings
    };

    expect(actual).toEqual<typeof actual>({
      removed: [foo, bar, pop, bla],
      added: [
        { thing: pop, at: { x: 2, y: 0 } },
        { thing: bla, at: { x: 0, y: 0 } },
      ]
    });
  });
});

describe("casting", () => {

  beforeEach(() => {

    level = createLevel(
      "   ",
      "   ",
      "   ",
    );

    addThing(0, 0, "wall", "casting");
  });

  it("notifies about casting", () => {
    expect(directionsToCasting(
      Direction.LEFT,
      Direction.UP,
    ))
    .toEqual([
      false,
      true
    ]);
  });

  function directionsToCasting(...directions: Direction[]): boolean[] {
    return directions
    .map(direction => level.tryToMove(direction))
    .map(result => result.casting);
  }
});

describe("spell selection", () => {

  function givenLevelWithSpells(...spells: Spell[]) {
    level = new Level(
      { ...dummyLevel, spells: spells },
      factory.fromMatrix(),
      addToGameInventoryFake
    );
  }

  it("no spells", () => {

    givenLevelWithSpells();

    expect(level.getPreparedSpells()).toEqual([]);
  });

  it("selecting empty spells does nothing", () => {

    givenLevelWithSpells();

    expect([
      level.changeSelectedSpell(),
      level.changeSelectedSpell(),
      level.changeSelectedSpell(),
      level.getPreparedSpells()
    ]).toEqual([
      [],
      [],
      [],
      [],
    ]);
  });

  it("selecting spell returns updated prepared spells list", () => {
    givenLevelWithSpells({ id: "someSpell", name: "Some Spell", charges: 13 });

    expect([
      level.changeSelectedSpell(),
      level.changeSelectedSpell()
    ]).toEqual<PreparedSpell[][]>([
      [{ id: "someSpell", name: "Some Spell", charges: 13, isSelected: true }],
      [{ id: "someSpell", name: "Some Spell", charges: 13, isSelected: false }],
    ]);
  });
});

describe("casting", () => {

  function givenEmptyLevelWithSpells(...spells: Spell[]) {
    level = new Level(
      {
        ...dummyLevel,
        spells: spells,
        startCoords: { x: 0, y: 0 }
      },
      factory.fromMatrix(
        "      ",
        "      ",
      ),
      addToGameInventoryFake
    );
  }

  describe("strength", () => {

    let pushableWall: Thing;

    beforeEach(() => {
      givenEmptyLevelWithSpells({ id: "strength", name: "Strength", charges: 2 });
      pushableWall = addThing(1, 0, "wall", "pushable");
    });

    it("can not push pushable wall without selecting spell", () => {

      const moveResult = level.tryToMove(Direction.RIGHT);

      const actual = {
        moved: moveResult.moved,
        pushed: moveResult.pushed
      }

      expect(actual).toEqual<typeof actual>({
        moved: false,
        pushed: []
      });
    });

    it("can push pushable wall when selecting spell", () => {

      level.changeSelectedSpell();

      const moveResult = level.tryToMove(Direction.RIGHT);

      const actual = {
        moved: moveResult.moved,
        pushed: moveResult.pushed
      }

      expect(actual).toEqual<typeof actual>({
        moved: true,
        pushed: [pushableWall]
      });
    });

    it("can not push after expending all charges", () => {

      level.changeSelectedSpell();


      expect(
        [
          move(Direction.RIGHT),
          move(Direction.RIGHT),
          move(Direction.RIGHT),
        ]
      ).toEqual([
        { moved: true, pushed: [pushableWall], charges: [1] },
        { moved: true, pushed: [pushableWall], charges: [0] },
        { moved: false, pushed: [], charges: [0] },
      ]);
    });

    it("does not cast if not pushing pushable wall", () => {

      level.changeSelectedSpell();

      expect(
        [
          move(Direction.DOWN),
          move(Direction.RIGHT),
          move(Direction.RIGHT),
        ]
      ).toEqual([
        { moved: true, pushed: [], charges: [2] },
        { moved: true, pushed: [], charges: [2] },
        { moved: true, pushed: [], charges: [2] },
      ]);
    });

    it("does not cast if pushing regular pushable", () => {

      const pushable = addThing(1, 1, "pushable");

      level.changeSelectedSpell();

      expect(
        [
          move(Direction.DOWN),
          move(Direction.RIGHT),
          move(Direction.RIGHT),
        ]
      ).toEqual([
        { moved: true, pushed: [], charges: [2] },
        { moved: true, pushed: [pushable], charges: [2] },
        { moved: true, pushed: [pushable], charges: [2] },
      ]);
    });

    it("does not cast if pushing regular wall", () => {

      addThing(1, 1, "wall");

      level.changeSelectedSpell();

      expect(
        [
          move(Direction.DOWN),
          move(Direction.RIGHT),
          move(Direction.RIGHT),
        ]
      ).toEqual([
        { moved: true, pushed: [], charges: [2] },
        { moved: false, pushed: [], charges: [2] },
        { moved: false, pushed: [], charges: [2] },
      ]);
    });
  });

  function move(direction: Direction): { moved: boolean, pushed: Thing[], charges: number[] } {
    const result = level.tryToMove(direction);
    return {
      moved: result.moved,
      pushed: result.pushed,
      charges: level.getPreparedSpells().map(spell => spell.charges)
    }
  }

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

function movementToChangedStateLists(...directions: Direction[]): Thing[][] {
  return directions.map(direction => level.tryToMove(direction).changedState);
}

function textAfterMove(...directions: Direction[]): (string | undefined)[] {
  return directions.map(direction => level.tryToMove(direction).text);
}

function getThingDescriptions() {
  return level
  .getLevelMatrix()
  .map(row =>
    row.map(location =>
      location.things
      .filter(thingDescription => thingDescription.sprite !== "floor")
    )
  );
}
