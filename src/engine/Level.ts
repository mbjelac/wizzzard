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
  readonly isWall: boolean,
  readonly isDeath: boolean,
  readonly sprite: SpriteName,
  readonly isPickup: boolean
}

export class Thing {

  private static nextId = 0;

  public readonly id = Thing.nextId++;

  public static defaultProps: ThingProps = {
    isDeath: false,
    isWall: false,
    sprite: "floor",
    isPickup: false,
  };

  constructor(public readonly props: ThingProps) {
  }

  equals(thing: Thing): boolean {
    return JSON.stringify(this.props) === JSON.stringify(thing.props);
  }
}

export interface MoveResult {
  moved: boolean,
  died: boolean,
  pickedUp: boolean
}

const doNothing: MoveResult = {
  moved: false,
  died: false,
  pickedUp: false
}

export class Level {

  public readonly editor = new LevelEditor();

  private playerLocation: Coords;

  public collisionEnabled = true;


  constructor(
    public readonly errand: Errand,
  ) {
    this.playerLocation = { ...errand.startCoords };
  }

  public tryToMove(direction: Direction): MoveResult {

    const nextCoords = direction.move(this.playerLocation);

    const nextLocation = this.getLocation(nextCoords);

    if (nextLocation === undefined) {
      return doNothing;
    }

    const canMove = !nextLocation.things.some(thing => thing.props.isWall) || !this.collisionEnabled;

    if (canMove) {
      this.playerLocation = nextCoords;
    }

    const died = nextLocation.things.some(thing => thing.props.isDeath) && this.collisionEnabled;

    if (died) {
      this.playerLocation = this.errand.startCoords;
    }

    const pickedUp = nextLocation.things.some(thing => thing.props.isPickup) && this.collisionEnabled;

    return {
      moved: canMove,
      died: died,
      pickedUp: pickedUp
    };
  }

  private getLocation(coords: Coords): LevelLocation | undefined {
    const row = this.errand.levelMatrix[coords.y];

    if (!row) {
      return undefined;
    }

    return row[coords.x];
  }

  getPlayerLocation(): Coords {
    return this.playerLocation;
  }

  matrixNotEmpty() {
    return this.errand.levelMatrix.length > 0 && this.errand.levelMatrix.every(row => row.length > 0);
  }
}
