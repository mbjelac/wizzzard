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

export class Thing {

  private static nextId = 0;

  public readonly id = Thing.nextId++;

  constructor(
    public readonly isWall: boolean,
    public readonly isDeath: boolean,
    public readonly sprite: SpriteName
  ) {

  }
}

export interface MoveResult {
  moved: boolean,
  died: boolean
}

export class Level {

  public readonly editor = new LevelEditor();

  private playerLocation: Coords;

  public collisionEnabled = true;


  constructor(
    public readonly levelMatrix: LevelMatrix,
    public readonly errand: Errand,
  ) {
    this.playerLocation = { ...errand.startCoords };
  }

  public tryToMove(direction: Direction): MoveResult {

    const nextCoords = direction.move(this.playerLocation);

    const nextLocation = this.getLocation(nextCoords);

    const canMove = !!nextLocation && (!nextLocation.things.some(thing => thing.isWall) || !this.collisionEnabled);

    if (canMove) {
      this.playerLocation = nextCoords;
    }

    const died = !!nextLocation && nextLocation.things.some(thing => thing.isDeath);

    if (died) {
      this.playerLocation = this.errand.startCoords;
    }

    console.log("Tried to move ... canMove=" + canMove + " died=" + died);

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
    return this.levelMatrix.length >0  && this.levelMatrix.every(row => row.length > 0);
  }
}
