import { LevelCell, Thing, ThingDescription } from "../Level";

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

  addThing(location: LevelCell, description: ThingDescription): AddResult {

    if (!validateThingDescription(description)) {
      return this.emptyAddResult;
    }

    if (location.things.find(thing => thing.descriptionEquals(description)) !== undefined) {
      return this.emptyAddResult;
    }

    const thingToAdd = new Thing(description);

    location.things.push(thingToAdd);

    return {
      addedThing: thingToAdd
    };
  }

  removeThing(location: LevelCell, thing: Thing) {

    const index = location.things.findIndex(thing => thing.id === thing.id);

    if (index === -1) {
      throw Error(`Thing ${JSON.stringify(thing)} not found at location ${JSON.stringify(location)}.`);
    }

    location.things.splice(index, 1);
  }
}
