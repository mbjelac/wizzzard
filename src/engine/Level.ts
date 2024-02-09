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

export interface ThingProps {
  readonly functions: ThingFunction[],
  readonly sprite: SpriteName,
  readonly label?: string,
}

export type ThingFunction = "wall" | "death" | "pickup" | "receive";

export class Thing {

  private static nextId = 0;

  public readonly id = Thing.nextId++;

  public static defaultProps: ThingProps = {
    functions: [],
    sprite: "floor",
  };

  constructor(public readonly props: ThingProps) {
  }

  equals(thing: Thing): boolean {
    return JSON.stringify(this.props) === JSON.stringify(thing.props);
  }

  is(thingFunction: ThingFunction): boolean {
    return this.props.functions.find(tf => tf === thingFunction) !== undefined;
}
}

export interface MoveResult {
  moved: boolean,
  died: boolean
}

const doNothing: MoveResult = {
  moved: false,
  died: false
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

    const canMove = !nextLocation.things.some(thing => thing.is("wall")) || !this.collisionEnabled;

    if (canMove) {
      this.playerLocation = nextCoords;
    }

    const died = nextLocation.things.some(thing => thing.is("death")) && this.collisionEnabled;

    if (died) {
      this.playerLocation = this.errand.startCoords;
    }

    this.inventory.push(...nextLocation.things.filter(thing => thing.is("pickup")));
    nextLocation.things = nextLocation.things.filter(thing => !thing.is("pickup"));

    return {
      moved: canMove,
      died: died
    };
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
}
