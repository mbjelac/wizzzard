import { SpriteName } from "./sprite-names";
import { LevelEditor } from "./editor/LevelEditor";
import { Direction } from "./Direction";

export interface Coords {
  x: number,
  y: number
}

export interface Location {

  things: Thing[]
}

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
    public readonly locations: Location[][],
    public readonly start: Coords
  ) {
    this.playerLocation = { ...start };
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
      this.playerLocation = this.start;
    }

    return {
      moved: canMove,
      died: died
    };
  }

  private getLocation(coords: Coords): Location | undefined {
    const row = this.locations[coords.y];

    if (!row) {
      return undefined;
    }

    return row[coords.x];
  }

  getPlayerLocation(): Coords {
    return this.playerLocation;
  }
}
