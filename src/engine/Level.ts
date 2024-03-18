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
  readonly sprite: string,
  readonly label?: string,
  readonly text?: string,
}

export const ALL_THING_PROPERTIES = [
  "wall",
  "death",
  "pickup",
  "receiver",
  "automatic",
  "vanish",
  "give",
  "pushable"
] as const;
type ThingPropertyTuple = typeof ALL_THING_PROPERTIES;
export type ThingProperty = ThingPropertyTuple[number];

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
    return this.id === thing.id;
  }

  descriptionEquals(description: ThingDescription): boolean {
    return JSON.stringify(this.description) === JSON.stringify(description);
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
  text: string | undefined;
  removedThings: Thing[];
  pushed: Thing[];
}

const doNothing: MoveResult = {
  moved: false,
  died: false,
  levelComplete: false,
  text: undefined,
  removedThings: [],
  pushed: []
}

interface LevelLocationWithCoords {

  coords: Coords,
  things: Thing[]
}

type LevelLocations = LevelLocationWithCoords[][];

export class Level {

  public readonly editor = new LevelEditor();

  public readonly levelLocations: LevelLocations;
  private playerCoords: Coords;

  public collisionEnabled = true;

  private inventory: Thing[] = [];
  private doneReceivers: string[] = [];

  constructor(
    public readonly errand: Errand,
  ) {
    this.playerCoords = { ...errand.startCoords };
    this.levelLocations = this
      .errand
      .matrix
      .map((row, rowIndex) => row
        .map((location, columnIndex) => ({
            coords: { x: columnIndex, y: rowIndex },
            things: location.things
              .map(thingProps => new Thing(thingProps))
          })
        )
      );
  }

  public tryToMove(direction: Direction): MoveResult {

    const nextLocation = this.getMoveLocation(this.playerCoords, direction);

    const thingsToRemove: Thing[] = [];

    if (nextLocation === undefined) {
      return doNothing;
    }

    const receiver = this.getReceiverForAnInventoryItem(nextLocation);

    let receiveEventText: string | undefined = undefined;

    if (receiver !== undefined) {
      this.removeOneItemWithReceiverLabelFromInventory(receiver.description.label!);
      this.disableReceiver(receiver);
      if (receiver.is("vanish")) {
        this.removeFromLocation(nextLocation, receiver);
        thingsToRemove.push(receiver);
      }
      if (receiver.is("give")) {
        thingsToRemove.push(...this.transferAllPickupsFromLevelToInventory(nextLocation));
      }
      receiveEventText = this.findTextAt(nextLocation, "onInteraction");
    } else {
      const atReceiver = this.doesLocationHaveProperty(nextLocation, "receiver")
      receiveEventText = this.findTextAt(nextLocation, atReceiver ? "preInteraction" : "postInteraction");
    }

    const canMove = !this.doesLocationHaveProperty(nextLocation, "wall") && this.pushableCanBePushed(nextLocation, direction);

    if (canMove) {
      this.playerCoords = nextLocation.coords;
      thingsToRemove.push(...this.transferAllPickupsFromLevelToInventory(nextLocation));
    }

    return {
      moved: canMove,
      died: this.doesLocationHaveProperty(nextLocation, "death"),
      levelComplete: this.isLevelComplete(),
      text: receiveEventText || this.getText(),
      removedThings: thingsToRemove,
      pushed: canMove ? this.pushThings(nextLocation, direction) : []
    };
  }

  private getMoveLocation(startCoords: Coords, direction: Direction): LevelLocationWithCoords | undefined {
    const nextCoords = direction.move(startCoords);
    return this.getLocation(nextCoords);
  }

  private doesLocationHaveProperty(location: LevelLocationWithCoords, ...properties: ThingProperty[]): boolean {
    return location.things.some(thing => properties.some(property => thing.is(property))) && this.collisionEnabled;
  }

  private transferAllPickupsFromLevelToInventory(location: LevelLocationWithCoords): Thing[] {

    if (!this.collisionEnabled) {
      return [];
    }

    const thingsToPickup = location.things.filter(thing => thing.is("pickup"));
    this.inventory.push(...thingsToPickup);
    location.things = location.things.filter(thing => !thing.is("pickup"));
    return thingsToPickup;
  }

  private removeOneItemWithReceiverLabelFromInventory(label: string) {

    const index = this.inventory.findIndex(inventoryItem => inventoryItem.description.label === label);

    if (index === -1) {
      return;
    }

    this.inventory.splice(index, 1);
  }

  private disableReceiver(receiver: Thing) {
    receiver.removeProperty("receiver");
    this.doneReceivers.push(receiver.description.label!);
  }

  private getLocation(coords: Coords): LevelLocationWithCoords | undefined {
    const row = this.levelLocations[coords.y];

    if (!row) {
      return undefined;
    }

    return row[coords.x];
  }

  getPlayerCoords(): Coords {
    return this.playerCoords;
  }

  matrixNotEmpty() {
    return this.levelLocations.length > 0 && this.levelLocations.every(row => row.length > 0);
  }

  getInventory(): Thing[] {
    return this.inventory;
  }

  private isLevelComplete(): boolean {
    return this.inventoryHasRequiredItems() && this.requiredReceivesDone();
  }

  private inventoryHasRequiredItems(): boolean {
    const requiredLabels = this.errand.completionCriteria.inventory;

    if (requiredLabels.length === 0) {
      return true;
    }

    const collectedLabels = this
      .inventory
      .map(thing => thing.description.label);

    return requiredLabels.every(requiredLabel => collectedLabels.some(collectedLabel => collectedLabel === requiredLabel));
  }

  private requiredReceivesDone(): boolean {

    const requiredReceives = this.errand.completionCriteria.receives;

    if (requiredReceives.length === 0) {
      return true;
    }

    return requiredReceives.every(requiredLabel => this.doneReceivers.some(doneReceiver => doneReceiver === requiredLabel));
  }

  private getText(): string | undefined {

    if (!this.collisionEnabled) {
      return undefined;
    }

    const texts = this
      .getNeighbours()
      .flatMap(neighbourLocation => neighbourLocation.things)
      .filter(thing => thing.is("automatic") && thing.description.text !== undefined)
      .map(thing => thing.description.text)
      .filter(text => text !== undefined);

    return texts.length === 0
      ? undefined
      : texts.join();
  }

  private getNeighbours(): LevelLocationWithCoords[] {
    return [
      { y: this.playerCoords.y - 1, x: this.playerCoords.x },
      { y: this.playerCoords.y + 1, x: this.playerCoords.x },
      { y: this.playerCoords.y, x: this.playerCoords.x - 1 },
      { y: this.playerCoords.y, x: this.playerCoords.x + 1 },
    ]
      .filter(coords => coords.x >= 0 && coords.y >= 0 && coords.x < this.errand.levelDimensions.width && coords.y < this.errand.levelDimensions.height)
      .map(coords => this.levelLocations[coords.y][coords.x]);
  }

  private getReceiverForAnInventoryItem(location: LevelLocationWithCoords): Thing | undefined {
    return location
      .things
      .find(thing =>
        thing.is("receiver")
        && this.inventoryContainsLabel(thing.description.label)
      );
  }

  private inventoryContainsLabel(label: string | undefined): boolean {
    return this.inventory.map(thing => thing.description.label)
      .filter(inventoryLabel => inventoryLabel !== undefined)
      .some(inventoryLabel => inventoryLabel === label);
  }

  private removeFromLocation(location: LevelLocationWithCoords, thing: Thing) {
    location.things.splice(location.things.indexOf(thing), 1);
  }

  private findTextAt(location: LevelLocationWithCoords, label: string): string | undefined {

    if (!this.collisionEnabled) {
      return undefined;
    }

    return location
      .things
      .find(thing => thing.description.label === label)
      ?.description
      .text;
  }

  private pushThings(location: LevelLocationWithCoords, direction: Direction): Thing[] {

    const pushedLocation = this.getMoveLocation(this.playerCoords, direction);

    if (pushedLocation === undefined) {
      return [];
    }

    const pushables = location.things.filter(thing => thing.is("pushable"));

    location.things = location.things.filter(thing => !pushables.find(pushable => pushable.equals(thing)));
    pushedLocation.things.push(...pushables);

    return pushables;
  }

  getDepth(thing: Thing): number {
    return this.getLocationOfThing(thing)!.things.indexOf(thing);
  }

  private getLocationOfThing(thing: Thing): LevelLocationWithCoords | undefined {
    return this
      .levelLocations
      .flatMap(row => row
        .flatMap(location => ({
          hitCount: location.things.filter(levelThing => levelThing.equals(thing)).length,
          location: location
        })))
      .find(result => result.hitCount === 1)
      ?.location;
  }

  private pushableCanBePushed(location: LevelLocationWithCoords, direction: Direction): boolean {

    const pushLocation = this.getMoveLocation(location.coords, direction);

    return !this.doesLocationHaveProperty(location, "pushable")
      || (
        pushLocation !== undefined
        && !this.doesLocationHaveProperty(pushLocation, "wall", "pushable")
      );
  }
}
