import { LevelEditor } from "./editor/LevelEditor";
import { Direction } from "./Direction";
import { Coords, Errand, ThingDescription } from "./Errand";

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
  changedState: Thing[];
}

const doNothing: MoveResult = {
  moved: false,
  died: false,
  levelComplete: false,
  text: undefined,
  removedThings: [],
  pushed: [],
  changedState: []
}

export interface LevelLocation {
  coords: Coords,
  things: Thing[],
}

export class Level {

  public readonly editor = new LevelEditor();

  public readonly levelLocations: LevelLocation[][];
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

    if (!this.collisionEnabled) {
      this.playerCoords = nextLocation.coords;
      return {
        ...doNothing,
        moved: true
      };
    }

    const receiver = this.getReceiverForAnInventoryItem(nextLocation);

    let receiveEventText: string | undefined = undefined;

    const changedStateThings: Thing[] = [];

    if (receiver !== undefined) {
      this.removeOneItemWithReceiverLabelFromInventory(receiver.description.label!);
      this.disableReceiver(receiver);
      if (receiver.is("open")) {
        receiver.removeProperty("wall");
      }
      if (receiver.is("give")) {
        thingsToRemove.push(...this.transferAllPickupsFromLevelToInventory(nextLocation));
      }
      receiveEventText = this.findTextAt(nextLocation, "onInteraction");
      changedStateThings.push(receiver);
    } else {
      const atReceiver = this.doesLocationHaveProperty(nextLocation, "receiver")
      receiveEventText = this.findTextAt(nextLocation, atReceiver ? "preInteraction" : "postInteraction");
    }

    const hasNotReceivedOrReceiverOpen = receiver === undefined || changedStateThings.length === 0 || receiver.is("open");

    const canMove =
      !this.doesLocationHaveProperty(nextLocation, "wall") &&
      this.pushableCanBePushed(nextLocation, direction) &&
      hasNotReceivedOrReceiverOpen;

    let interactionText: string | undefined = undefined;

    if (canMove) {
      this.playerCoords = this.getNextCoords(nextLocation);
      thingsToRemove.push(...this.transferAllPickupsFromLevelToInventory(nextLocation));
    } else {
      interactionText = this.getTextsFrom(nextLocation);
    }

    const pushedThings = canMove ? this.pushThings(nextLocation, direction) : [];

    changedStateThings.push(...this.bridgeBridges(pushedThings, direction));

    return {
      moved: canMove,
      died: this.doesLocationHaveProperty(nextLocation, "death"),
      levelComplete: this.isLevelComplete(),
      text: receiveEventText || interactionText || this.getNeighbouringTexts(),
      removedThings: thingsToRemove,
      pushed: pushedThings,
      changedState: changedStateThings
    };
  }

  private getMoveLocation(startCoords: Coords, direction: Direction): LevelLocation | undefined {
    const nextCoords = direction.move(startCoords);
    return this.getLocation(nextCoords);
  }

  private doesLocationHaveProperty(location: LevelLocation, ...properties: ThingProperty[]): boolean {
    return location.things.some(thing => properties.some(property => thing.is(property)));
  }

  private transferAllPickupsFromLevelToInventory(location: LevelLocation): Thing[] {
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

  getLocation(coords: Coords): LevelLocation | undefined {
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

  private getNeighbouringTexts(): string | undefined {

    const neighbouringTexts = this
      .getNeighbours()
      .flatMap(neighbourLocation => neighbourLocation.things)
      .filter(thing => thing.is("automatic") && thing.description.text !== undefined)
      .map(thing => thing.description.text);

    return neighbouringTexts.length === 0
      ? undefined
      : neighbouringTexts.join();
  }

  private getNeighbours(): LevelLocation[] {
    return [
      { y: this.playerCoords.y - 1, x: this.playerCoords.x },
      { y: this.playerCoords.y + 1, x: this.playerCoords.x },
      { y: this.playerCoords.y, x: this.playerCoords.x - 1 },
      { y: this.playerCoords.y, x: this.playerCoords.x + 1 },
    ]
      .filter(coords => coords.x >= 0 && coords.y >= 0 && coords.x < this.errand.levelDimensions.width && coords.y < this.errand.levelDimensions.height)
      .map(coords => this.levelLocations[coords.y][coords.x]);
  }

  private getReceiverForAnInventoryItem(location: LevelLocation): Thing | undefined {
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

  private removeFromLocation(location: LevelLocation, thing: Thing) {
    location.things.splice(location.things.indexOf(thing), 1);
  }

  private findTextAt(location: LevelLocation, label: string): string | undefined {
    return location
      .things
      .find(thing => thing.description.label === label)
      ?.description
      .text;
  }

  private pushThings(location: LevelLocation, direction: Direction): Thing[] {

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

  private getLocationOfThing(thing: Thing): LevelLocation | undefined {
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

  private pushableCanBePushed(location: LevelLocation, direction: Direction): boolean {

    const pushLocation = this.getMoveLocation(location.coords, direction);

    return !this.doesLocationHaveProperty(location, "pushable")
      || (
        pushLocation !== undefined
        && !this.doesLocationHaveProperty(pushLocation, "wall", "pushable")
      );
  }

  private getTextsFrom(location: LevelLocation): string {
    return location
      .things
      .filter(thing => !thing.is("automatic") && thing.description.text !== undefined)
      .map(thing => thing.description.text as string)
      .join();
  }

  private bridgeBridges(pushedThings: Thing[], direction: Direction): Thing[] {

    const bridge = pushedThings.find(thing => thing.is("bridge"));

    if(bridge === undefined) {
      return [];
    }

    const pushedLocation = this.getMoveLocation(this.playerCoords, direction);

    const bridgeable = pushedLocation?.things.find(thing => thing.is("bridgeable"));

    if(bridgeable === undefined) {
      return [];
    }

    bridge.removeProperty("pushable");
    bridge.removeProperty("bridge");
    bridgeable.removeProperty("death");
    bridgeable.removeProperty("bridgeable");

    return [bridge];
  }

  private getNextCoords(nextLocation: LevelLocation): Coords {

    const teleport = nextLocation.things.find(thing => thing.is("teleport"));

    if (teleport === undefined) {
      return nextLocation.coords;
    }

    const targetLocation = this
      .levelLocations
      .flatMap(row => row
        .flatMap(location => ({
          isTeleportTarget: location.things.find(levelThing => !levelThing.equals(teleport) && levelThing.description.label === teleport.description.label),
          location: location
        })))
      .filter(candidate => candidate.isTeleportTarget)
      [0]
      ?.location;

    return targetLocation ? targetLocation.coords : nextLocation.coords;
  }
}
