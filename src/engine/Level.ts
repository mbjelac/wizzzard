import { SpriteName } from "./sprite-names";
import { LevelEditor } from "./editor/LevelEditor";
import { Direction } from "./Direction";
import { Errand } from "./Errand";

export interface Coords {
  readonly x: number,
  readonly y: number
}

export interface LevelLocation {

  things: Thing[]
}

export type LevelMatrix = LevelLocation[][];

export interface ThingDescription {
  readonly properties: ThingProperty[],
  readonly sprite: SpriteName,
  readonly label?: string,
}

export type ThingProperty = "wall" | "death" | "pickup" | "receiver";

export class Thing {

  private static nextId = 0;

  public readonly id = Thing.nextId++;

  public static defaultThingDescription: ThingDescription = {
    properties: [],
    sprite: "floor",
  };

  constructor(public readonly description: ThingDescription) {
  }

  equals(thing: Thing): boolean {
    return JSON.stringify(this.description) === JSON.stringify(thing.description);
  }

  is(thingFunction: ThingProperty): boolean {
    return this.description.properties.find(tf => tf === thingFunction) !== undefined;
  }

  removeProperty(propertyToRemove: ThingProperty) {
    const properties = this.description.properties;

    const index = properties.findIndex(property => property === propertyToRemove);

    if (index === -1) {
      return;
    }

    properties.splice(index, 1);
  }
}

export interface MoveResult {
  moved: boolean,
  died: boolean
  levelComplete: boolean;
}

const doNothing: MoveResult = {
  moved: false,
  died: false,
  levelComplete: false
}

export class Level {

  public readonly editor = new LevelEditor();

  private playerLocation: Coords;

  public collisionEnabled = true;

  private inventory: Thing[] = [];

  public readonly levelMatrix: LevelMatrix;

  constructor(
    public readonly errand: Errand,
  ) {
    this.playerLocation = { ...errand.startCoords };
    this.levelMatrix = this
      .errand
      .matrix
      .map(row => row
        .map(location => ({
            things: location.things
              .map(thingProps => new Thing(thingProps))
          })
        )
      );
  }

  public tryToMove(direction: Direction): MoveResult {

    const nextCoords = direction.move(this.playerLocation);

    const nextLocation = this.getLocation(nextCoords);

    if (nextLocation === undefined) {
      return doNothing;
    }

    const canMove = !this.doesLocationHaveProperty(nextLocation, "wall");

    if (canMove) {
      this.playerLocation = nextCoords;
    }

    const died = this.doesLocationHaveProperty(nextLocation, "death");

    if (died) {
      this.playerLocation = this.errand.startCoords;
    }

    const give = this.doesLocationHaveProperty(nextLocation, "receiver");

    if (give) {
      this.removeOneItemWithReceiverLabelFromInventory(nextLocation);
      this.disableReceiver(nextLocation);
    }

    this.transferAllPickupsFromLevelToInventory(nextLocation);

    return {
      moved: canMove,
      died: died,
      levelComplete: this.isLevelComplete()
    };
  }

  private doesLocationHaveProperty(location: LevelLocation, property: ThingProperty): boolean {
    return location.things.some(thing => thing.is(property)) && this.collisionEnabled;
  }

  private transferAllPickupsFromLevelToInventory(location: LevelLocation) {
    this.inventory.push(...location.things.filter(thing => thing.is("pickup")));
    location.things = location.things.filter(thing => !thing.is("pickup"));
  }

  private removeOneItemWithReceiverLabelFromInventory(location: LevelLocation) {

    const receiverLabel = location.things.find(thing => thing.is("receiver"))!.description.label;

    if (receiverLabel === undefined) {
      throw Error("Receiver has no label! " + JSON.stringify(location));
    }

    const index = this.inventory.findIndex(inventoryItem => inventoryItem.description.label === receiverLabel);

    if (index === -1) {
      return;
    }

    this.inventory.splice(index, 1);
  }

  private disableReceiver(location: LevelLocation) {
    const receiver = location.things.find(thing => thing.is("receiver"))!;

    receiver.removeProperty("receiver");
  }

  private getLocation(coords: Coords): LevelLocation | undefined {
    const row = this.levelMatrix[coords.y];

    if (!row) {
      return undefined;
    }

    return row[coords.x];
  }

  getPlayerLocation(): Coords {
    return this.playerLocation;
  }

  matrixNotEmpty() {
    return this.levelMatrix.length > 0 && this.levelMatrix.every(row => row.length > 0);
  }

  getInventory(): Thing[] {
    return this.inventory;
  }

  private isLevelComplete(): boolean {
    const requiredLabels = this.errand.completionCriteria.inventory;

    if (requiredLabels.length === 0) {
      return true;
    }

    const collectedLabels = this
      .inventory
      .map(thing => thing.description.label);

    return requiredLabels.every(requiredLabel => collectedLabels.some(collectedLabel => collectedLabel === requiredLabel));
  }
}
