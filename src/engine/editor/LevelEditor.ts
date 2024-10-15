import { LevelLocation } from "../Level";
import { ThingDescription } from "../LevelDescription";
import { Thing } from "../Thing";

export interface AddResult {
  addedThing?: Thing
}

function validateThingDescription(description: ThingDescription) {
  return validateLabel(description);
}

function validateLabel(description: ThingDescription): boolean {
  const hasToHaveLabel = description.properties.some(property => property === "receiver" || property === "pickup");
  const hasLabel = description.label !== undefined && description.label.length > 0;
  return !hasToHaveLabel || hasLabel;
}

export class LevelEditor {

  private readonly emptyAddResult: AddResult = {
    addedThing: undefined
  };

  addThing(location: LevelLocation, description: ThingDescription): AddResult {

    if (!validateThingDescription(description)) {
      return this.emptyAddResult;
    }

    if (location.things.find(thing => thing.descriptionEquals(description)) !== undefined) {
      return this.emptyAddResult;
    }

    const thingToAdd = Thing.create(description);

    location.things.push(thingToAdd);

    return {
      addedThing: thingToAdd
    };
  }

  removeThing(location: LevelLocation, thing: Thing) {
    location.things = location.things.filter(locationThing => locationThing.id !== thing.id);
  }
}
