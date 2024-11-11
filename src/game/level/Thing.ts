import { Coords, ThingDescription } from "./LevelDescription";
import { Direction } from "./Direction";
import { getDirection, Surroundings } from "./monster-utils";

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
  "remember",
  "slot",
  "monster"
] as const;
export type ThingPropertyTuple = typeof ALL_THING_PROPERTIES;

export type ThingProperty = ThingPropertyTuple[number];

export interface SavedThing {
  readonly id: number;
  readonly description: ThingDescription;
}

export class Thing {

  private static nextId = 0;

  public static load(savedThing: SavedThing): Thing {
    return new Thing(
      {
        ...savedThing.description,
        properties: [...savedThing.description.properties],
      },
      savedThing.id
    );
  }

  public static create(description: ThingDescription): Thing {
    return new Thing(description, Thing.nextId++);
  }

  private direction: Direction;

  private constructor(
    public readonly description: ThingDescription,
    public readonly id: number
  ) {
    const directionSpec = description.label?.split("|")[1];

    this.direction = Direction
      .getAllDirections()
      .find(direction => direction.name.toLowerCase() == directionSpec?.toLowerCase())
      || Direction.DOWN;
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
      description: {
        label: this.description.label,
        sprite: this.description.sprite,
        text: this.description.text,
        properties: [...this.description.properties]
      },
    };
  }

  move(currentLocation: Coords, surroundings: Surroundings): Coords {

    const movePossible = this.isMovePossible(surroundings);

    if (!movePossible) {
      return currentLocation;
    }

    return movePossible
      ? this.direction.move(currentLocation)
      : currentLocation;
  }

  private isMovePossible(surroundings: Surroundings): boolean {

    const spec = this.description.label?.split("|")[0];

    if (spec == undefined) {
      console.warn("Failed to parse spec: " + JSON.stringify(this.description));
      return false;
    }

    const nextDirection = getDirection(spec, this.direction, surroundings)

    if (nextDirection == undefined) {
      return false;
    }

    this.direction = nextDirection;

    return true;
  }

  getCurrentDirectionName(): string {
    return this.direction.name;
  }
}

