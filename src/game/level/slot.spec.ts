import { interactWithSlot, SlotInteractionContext, SlotInteractionResult } from "./slot";
import { Thing, ThingProperty } from "./Thing";

const slot = createThing("slot");
const pickup1 = createThing("pickup");
const pickup2 = createThing("pickup");
const nonPickup1 = createThing();
const nonPickup2 = createThing();

function createThing(...properties: ThingProperty[]): Thing {
  return Thing.create({
    sprite: "any",
    properties: properties
  });
}

it("nothing is added or removed with empty inventory & empty slot", () => {
  when({
    inventory: [],
    thingsAtSlotLocation: [slot]
  });
  then({
    moveToInventory: [],
    moveToSlot: []
  });
});

it("inventory item is added to the slot", () => {
  when({
    inventory: [pickup1],
    thingsAtSlotLocation: [slot]
  });
  then({
    moveToInventory: [],
    moveToSlot: [pickup1]
  });
});

it("pickup item in slot is added to inventory", () => {
  when({
    inventory: [],
    thingsAtSlotLocation: [slot, pickup1]
  });
  then({
    moveToInventory: [pickup1],
    moveToSlot: []
  });
});

it("non-pickup item in slot is not added to inventory", () => {
  when({
    inventory: [],
    thingsAtSlotLocation: [slot, nonPickup1]
  });
  then({
    moveToInventory: [],
    moveToSlot: []
  });
});

it("pickup item amongst non-pickups in slot is added to inventory", () => {
  when({
    inventory: [],
    thingsAtSlotLocation: [slot, nonPickup1, pickup1, nonPickup2]
  });
  then({
    moveToInventory: [pickup1],
    moveToSlot: []
  });
});

it("first pickup item in slot is added to inventory", () => {
  when({
    inventory: [],
    thingsAtSlotLocation: [slot, nonPickup1, pickup1, pickup2, nonPickup2]
  });
  then({
    moveToInventory: [pickup1],
    moveToSlot: []
  });
});

it("item in slot is moved to inventory if both inventory & slot not empty", () => {
  when({
    inventory: [pickup1],
    thingsAtSlotLocation: [slot, pickup2]
  });
  then({
    moveToInventory: [pickup2],
    moveToSlot: []
  });
});

it("item in inventory is moved to slot if slot contains non-pickup items", () => {
  when({
    inventory: [pickup1],
    thingsAtSlotLocation: [slot, nonPickup1]
  });
  then({
    moveToInventory: [],
    moveToSlot: [pickup1]
  });
});

it("do nothing if not a slot", () => {
  when({
    inventory: [pickup1],
    thingsAtSlotLocation: [pickup2, nonPickup1]
  });
  then({
    moveToInventory: [],
    moveToSlot: []
  });
});

let actual: SlotInteractionResult;

function when(context: SlotInteractionContext) {
  actual = interactWithSlot(context);
}

function then(expected: SlotInteractionResult) {
  expect(actual).toEqual(expected);
}
