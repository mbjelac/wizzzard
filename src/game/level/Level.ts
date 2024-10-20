import { LevelEditor } from "../editor/LevelEditor";
import { Direction } from "./Direction";
import { Coords, LevelDescription, LevelMatrix } from "./LevelDescription";
import { SavedThing, Thing, ThingProperty } from "./Thing";

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

interface SavedGame {
  readonly playerCoords: Coords;
  readonly inventory: SavedThing[];
  readonly locations: SavedLocation[][];
  readonly ambientSound: string | undefined;
  readonly idsThatChangedState: number[];
}

interface SavedLocation {
  readonly coords: Coords;
  readonly things: SavedThing[];
}

export class Level {

  public readonly editor = new LevelEditor();

  private levelLocations: LevelLocation[][];
  private playerCoords: Coords;

  public collisionEnabled = true;

  private inventory: Thing[] = [];
  private doneReceivers: string[] = [];

  private ambientSound: string | undefined;

  private savedGame?: SavedGame;

  private thingsThatChangedState: Thing[] = [];

  constructor(
    public readonly levelDescription: LevelDescription,
    private readonly addToGameInventory: (items: string[]) => void
  ) {
    this.playerCoords = { ...levelDescription.startCoords };
    this.levelLocations = this
    .levelDescription
    .matrix
    .map((row, rowIndex) => row
      .map((location, columnIndex) => ({
          coords: { x: columnIndex, y: rowIndex },
          things: location.things
          .map(thingProps => Thing.create(thingProps))
        })
      )
    );

    (levelDescription.initialInventory || [])
    .forEach(initialThingDescription => {
      this.inventory.push(Thing.create(initialThingDescription))
    });
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

    let receiveEventText: string | undefined;

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
      receiver.removeProperty("death");
    } else {
      const atReceiver = this.doesLocationHaveProperty(nextLocation, "receiver")
      receiveEventText = this.findTextAt(nextLocation, atReceiver ? "preInteraction" : "postInteraction");
    }

    const hasNotReceived = receiver === undefined || changedStateThings.length === 0;
    const hasNotReceivedOrReceiverOpen = hasNotReceived || receiver.is("open");

    const canMove =
      !this.doesLocationHaveProperty(nextLocation, "wall") &&
      this.pushableCanBePushed(nextLocation, direction) &&
      hasNotReceivedOrReceiverOpen;

    let interactionText: string | undefined = undefined;

    if (canMove) {
      this.playerCoords = this.getNextCoords(nextLocation);
      thingsToRemove.push(...this.transferAllPickupsFromLevelToInventory(nextLocation));

      const ambientSound = nextLocation
      .things
      .filter(thing => thing.is("ambientSound"))
      .map(thing => thing.description.label)[0];

      if (ambientSound !== undefined) {
        this.ambientSound = ambientSound;
      }

      const automatics = nextLocation.things.filter(thing => thing.is("automatic"));

      changedStateThings.push(...automatics);

      automatics.forEach(thing => thing.removeProperty("automatic"));

    } else {
      interactionText = this.getTextsFrom(nextLocation);

      const rememberingStone = nextLocation.things.filter(thing => thing.is("remember"))[0];
      if (rememberingStone !== undefined) {
        interactionText = "remembering";
        changedStateThings.push(rememberingStone);
        this.savedGame = {
          playerCoords: this.playerCoords,
          inventory: this.inventory.map(thing => thing.save()),
          locations: this.getSavedLocations(),
          ambientSound: this.ambientSound,
          idsThatChangedState: [...this.thingsThatChangedState.map(thing => thing.id), rememberingStone.id]
        };
      }
    }

    const pushedThings = canMove ? this.pushThings(nextLocation, direction) : [];

    changedStateThings.push(...this.bridgeBridges(pushedThings, direction));


    this.thingsThatChangedState.push(...changedStateThings);

    const levelComplete = this.isLevelComplete();

    if (levelComplete) {
      this.addToGameInventory(this.inventory.map(thing => thing.description.label!));
    }

    return {
      moved: canMove,
      died: this.doesLocationHaveProperty(nextLocation, "death") && hasNotReceived,
      levelComplete: levelComplete,
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
    const requiredLabels = this.levelDescription.completionCriteria.inventory;

    if (requiredLabels.length === 0) {
      return true;
    }

    const collectedLabels = this
    .inventory
    .map(thing => thing.description.label);

    return requiredLabels.every(requiredLabel => collectedLabels.some(collectedLabel => collectedLabel === requiredLabel));
  }

  private requiredReceivesDone(): boolean {

    const requiredReceives = this.levelDescription.completionCriteria.receives;

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
    .filter(coords => coords.x >= 0 && coords.y >= 0 && coords.x < this.levelDescription.levelDimensions.width && coords.y < this.levelDescription.levelDimensions.height)
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

    if (bridge === undefined) {
      return [];
    }

    const pushedLocation = this.getMoveLocation(this.playerCoords, direction);

    const bridgeable = pushedLocation?.things.find(thing => thing.is("bridgeable"));

    if (bridgeable === undefined) {
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

  canRemember() {
    return this.savedGame !== undefined;
  }

  remember() {
    if (this.savedGame == undefined) {
      return;
    }

    this.playerCoords = this.savedGame.playerCoords;

    const thingsById = new Map<number, Thing>();

    this.levelLocations = this.savedGame.locations.map(
      row => row.map(
        savedLocation => (
          {
            coords: savedLocation.coords,
            things: savedLocation.things.map(savedThing => {
              const thing = Thing.load(savedThing);
              thingsById.set(savedThing.id, thing);
              return thing;
            })
          }
        )
      )
    );
    this.inventory = this.savedGame.inventory.map(savedThing => Thing.load(savedThing));
    this.ambientSound = this.savedGame.ambientSound;
    this.thingsThatChangedState = this.savedGame.idsThatChangedState.map(id => thingsById.get(id)!);
  }

  getSavedLocations(): SavedLocation[][] {
    return this.levelLocations.map(
      row => row.map(
        location => (
          {
            coords: location.coords,
            things: location.things.map(thing => thing.save())
          }
        )
      )
    );
  }

  findLocationByThingId(thingId: number): Coords | undefined {
    return this
    .levelLocations
    .flatMap((row, rowIndex) => row
    .flatMap((col, colIndex) => ({
      hitCount: col.things.filter(levelThing => levelThing.id == thingId).length,
      coords: { x: colIndex, y: rowIndex }
    })))
    .find(loc => loc.hitCount === 1)
      ?.coords;
  }

  getLevelMatrix(): LevelMatrix {
    return this.levelLocations
    .map(row => row
      .map(location => ({
          things: location.things
          .map(thing => thing.description)
        })
      )
    );
  }

  getAmbientSound(): string | undefined {
    return this.ambientSound;
  }

  getThingsThatChangedState() {
    return this.thingsThatChangedState;
  }
}
