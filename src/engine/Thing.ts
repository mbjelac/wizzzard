import { ThingDescription } from "./Errand";

export type ThingProperty = ThingPropertyTuple[number];

export class Thing {

  private static nextId = 0;

  public static load(savedThing: SavedThing): Thing {
    return new Thing(savedThing.description, savedThing.id);
  }

  public static create(description: ThingDescription): Thing {
    return new Thing(description, Thing.nextId++);
  }

  private constructor(
    public readonly description: ThingDescription,
    public readonly id: number
  ) {
  }

  equals(thing: Thing): boolean {
    return this.id === thing.id;
  }

  descriptionEquals(description: ThingDescription): boolean {
    return JSON.stringify(this.description) === JSON.stringify(description);
  }

  is(thingProperty: ThingProperty): boolean {
    return this.description.properties.some(thisThingProperty => thisThingProperty === thingProperty);
  }

  removeProperty(propertyToRemove: ThingProperty) {
    const properties = this.description.properties;

    const index = properties.findIndex(property => property === propertyToRemove);

    if (index === -1) {
      return;
    }

    properties.splice(index, 1);
  }

  save(): SavedThing {
    return {
      id: this.id,
      description: this.description,
    };
  }
}

export const ALL_THING_PROPERTIES = [
  "wall",
  "death",
  "pickup",
  "receiver",
  "automatic",
  "open",
  "give",
  "pushable",
  "ambientSound",
  "bridge",
  "bridgeable",
  "teleport",
  "remember"
] as const;
export type ThingPropertyTuple = typeof ALL_THING_PROPERTIES;

export interface SavedThing {
  readonly id: number;
  readonly description: ThingDescription;
}
