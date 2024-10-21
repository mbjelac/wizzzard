import { Thing } from "./Thing";

export interface SlotInteractionContext {
  readonly inventory: Thing[];
  readonly thingsAtSlotLocation: Thing[];
}

export interface SlotInteractionResult {
  readonly moveToInventory: Thing[];
  readonly moveToSlot: Thing[];
}

const doNothing: SlotInteractionResult = {
  moveToSlot: [],
  moveToInventory: []
};

export function interactWithSlot(context: SlotInteractionContext): SlotInteractionResult {

  if(context.thingsAtSlotLocation.find(thing => thing.is("slot")) === undefined) {
    return doNothing;
  }

  const firstPickupInSlot = context
  .thingsAtSlotLocation
  .find(thing => thing.is("pickup"));

  if (firstPickupInSlot !== undefined) {
    return {
      moveToSlot: [],
      moveToInventory: [firstPickupInSlot]
    }
  }

  if (context.inventory.length > 0) {
    return {
      moveToInventory: [],
      moveToSlot: [context.inventory[0]]
    }
  }

  return doNothing;
}
