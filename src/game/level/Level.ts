import { LevelEditor } from "../editor/LevelEditor";
import { Direction } from "./Direction";
import { Coords, LevelDescription, LevelMatrix } from "./LevelDescription";
import { SavedThing, Thing, ThingProperty } from "./Thing";
import { interactWithSlot } from "./slot";
import { LevelLocation, LevelMap } from "./LevelMap";
import { parseTransmutation } from "./Transmutation";

export interface MoveResult {
  moved: boolean,
  died: boolean
  levelComplete: boolean;
  text: string | undefined;
  removedThings: Thing[];
  pushed: Thing[];
  changedState: Thing[];
  addedThings: ThingAt[];
}

export interface TickResult {
  died: boolean
  movedThings: ThingAt[];
}

const doNothing: MoveResult = {
  moved: false,
  died: false,
  levelComplete: false,
  text: undefined,
  removedThings: [],
  pushed: [],
  changedState: [],
  addedThings: []
}

export interface ThingAt {
  readonly thing: Thing,
  readonly at: Coords
}

interface SavedGame {
  readonly playerCoords: Coords;
  readonly inventory: SavedThing[];
  readonly locations: SavedLocation[][];
  readonly ambientSound: string | undefined;
  readonly idsThatChangedState: number[];
}

export interface SavedLocation {
  readonly coords: Coords;
  readonly things: SavedThing[];
}

interface ChangedThings {
  readonly removedThings: Thing[],
  readonly addedThings: ThingAt[]
}

export class Level {

  public readonly editor = new LevelEditor();

  private map: LevelMap;
  private playerCoords: Coords;

  public collisionEnabled = true;
  public tickingEnabled = true;

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
    this.map = LevelMap.fromLevelMatrix(this.levelDescription.matrix);

    (levelDescription.initialInventory || [])
    .forEach(initialThingDescription => {
      this.inventory.push(Thing.create(initialThingDescription))
    });
  }

  public tryToMove(direction: Direction): MoveResult {

    const nextLocation = this.getMoveLocation(this.playerCoords, direction);

    const thingsToRemove: Thing[] = [];
    const addedThings: ThingAt[] = [];

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

    let interactionText = this.getTextsFrom(nextLocation);

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

      const rememberingStone = nextLocation.things.filter(thing => thing.is("remember"))[0];
      if (rememberingStone !== undefined) {
        interactionText = "remembering";
        changedStateThings.push(rememberingStone);
        this.savedGame = {
          playerCoords: this.playerCoords,
          inventory: this.inventory.map(thing => thing.save()),
          locations: this.map.save(),
          ambientSound: this.ambientSound,
          idsThatChangedState: [...this.thingsThatChangedState.map(thing => thing.id), rememberingStone.id]
        };
      }

      const changedAfterSlotInteraction = this.interactWithSlot(nextLocation);
      addedThings.push(...changedAfterSlotInteraction.addedThings);
      thingsToRemove.push(...changedAfterSlotInteraction.removedThings);

      this.transmute(nextLocation);
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
      died: canMove && this.doesLocationHaveProperty(nextLocation, "death") && hasNotReceived,
      levelComplete: levelComplete,
      text: receiveEventText || interactionText || this.getNeighbouringTexts(),
      removedThings: thingsToRemove,
      pushed: pushedThings,
      changedState: changedStateThings,
      addedThings: addedThings
    };
  }

  private getMoveLocation(startCoords: Coords, direction: Direction): LevelLocation | undefined {
    const nextCoords = direction.move(startCoords);
    return this.map.getLocation(nextCoords);
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

  private interactWithSlot(slotLocation: LevelLocation): ChangedThings {

    const slotInteraction = interactWithSlot({
      inventory: this.inventory,
      thingsAtSlotLocation: slotLocation.things
    });

    const removedThings = slotInteraction.moveToInventory.map(thing => {
      this.inventory.push(thing);
      this.removeFromLocation(slotLocation, thing);
      return thing;
    });

    const addedThings = slotInteraction.moveToSlot.map(thing => {
      this.inventory = this.inventory.filter(thingInInventory => !thingInInventory.equals(thing));
      slotLocation.things.push(thing);
      return {
        thing: thing,
        at: slotLocation.coords
      };
    });

    return { removedThings, addedThings };
  }

  getPlayerCoords(): Coords {
    return this.playerCoords;
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
    .map
    .getNeighbours(this.playerCoords)
    .flatMap(neighbourLocation => neighbourLocation.things)
    .filter(thing => thing.is("automatic") && thing.description.text !== undefined)
    .map(thing => thing.description.text);

    return neighbouringTexts.length === 0
      ? undefined
      : neighbouringTexts.join();
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
    return this.map.getLocationOfThing(thing)!.things.indexOf(thing);
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

    const targetCoords = this
    .map
    .getLocationsWhich(location =>
      location.things.find(locationThing => !locationThing.equals(teleport) && locationThing.description.label === teleport.description.label) !== undefined
    )[0]
      ?.coords;

    return targetCoords || nextLocation.coords;
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

    this.map = LevelMap.fromSavedLocations(
      this.savedGame.locations,
      (thing: Thing) => thingsById.set(thing.id, thing)
    );
    this.inventory = this.savedGame.inventory.map(savedThing => Thing.load(savedThing));
    this.ambientSound = this.savedGame.ambientSound;
    this.thingsThatChangedState = this.savedGame.idsThatChangedState.map(id => thingsById.get(id)!);
  }

  getAmbientSound(): string | undefined {
    return this.ambientSound;
  }

  getThingsThatChangedState() {
    return this.thingsThatChangedState;
  }

  tick(): TickResult {

    if (!this.tickingEnabled) {
      return {
        died: false,
        movedThings: []
      };
    }

    const movedMonsters: ThingAt[] = this
    .map
    .getLocationsWhichHave(thing => thing.is("monster"))
    .flatMap(location =>
      location.things.filter(thing => thing.is("monster"))
      .map(thing => {
          const nextCoords = thing.move(location.coords, this.map.getSurroundings(location))
          this.map.move(thing, location, nextCoords);
          return {
            thing: thing,
            at: nextCoords
          }
        }
      )
    );

    return {
      died: movedMonsters
      .map(moved => moved.at)
      .some(monsterCoords => monsterCoords.x === this.playerCoords.x && monsterCoords.y === this.playerCoords.y),
      movedThings: movedMonsters
    };
  }

  getLocation(coords: Coords): LevelLocation {
    const location = this.map.getLocation(coords);

    if (location === undefined) {
      throw new Error("Invalid location: " + JSON.stringify(coords));
    }

    return location;
  }

  getLevelMatrix(): LevelMatrix {
    return this.map.getLevelMatrix();
  }

  private transmute(transmuterLocation: LevelLocation) {

    const transmuter = transmuterLocation.things.find(thing => thing.is("transmute"));

    if (transmuter === undefined) {
      return;
    }

    const transmutation = parseTransmutation(transmuter.description.label!);

    const thingsToDestroy: [LevelLocation, Thing][] = [];

    transmutation.destroy.map(destroy => {
      const location = this.map.getLocation(destroy.at);
      const thing = location?.things.find(thing => thing.description.label === destroy.label);
      if (location !== undefined && thing !== undefined) {
        thingsToDestroy.push([location, thing]);
      }
    });

    if (transmutation.destroy.length !== thingsToDestroy.length) {
      return;
    }

    thingsToDestroy.forEach(([location, thing]) => this.removeFromLocation(location, thing));

    transmutation.create.forEach(create => {
      const location = this.map.getLocation(create.at);
      const thing = transmuterLocation?.things.find(thing => thing.description.label === create.label);
      if (location !== undefined && thing !== undefined) {
        this.removeFromLocation(transmuterLocation, thing);
        location.things.push(thing);
      }
    });
  }
}
