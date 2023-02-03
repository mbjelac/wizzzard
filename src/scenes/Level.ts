export class Direction {

  public static UP = new Direction(0, -1);
  public static DOWN = new Direction(0, 1);
  public static LEFT = new Direction(-1, 0);
  public static RIGHT = new Direction(1, 0);

  private constructor(public deltaX: number, public deltaY: number) {
  }

  public move(coords: Coords): Coords {
    return {
      x: coords.x + this.deltaX,
      y: coords.y + this.deltaY
    };
  }
}

export interface Coords {
  x: number,
  y: number
}

export interface Location {

  things: Thing[]
}

export interface Thing {

  isWall: boolean
}

const defaultThing: Thing = {
  isWall: false
}

export class Level {

  public static random(width: number, height: number): Level {

    let start: Coords;

    const locations = Array(width).fill(0).map((_, y) =>
      Array(height).fill(0).map((_, x) => {
          if (Math.random() > 0.2) {
            if (Math.random() > 0.6 && !start) {
              start = { x: x, y: y };
            }
            return emptySpot();
          } else {
            return aWall();
          }
        }
      )
    );

    // start = { x: 0, y: 0 }

    return new Level(locations, start!);
  }

  private playerLocation: Coords;

  constructor(
    public locations: Location[][],
    public start: Coords
  ) {
    this.playerLocation = { ...start };
  }

  public tryToMove(direction: Direction): boolean {

    const nextCoords = direction.move(this.playerLocation);

    const nextLocation = this.getLocation(nextCoords);

    const canMove = !!nextLocation && !nextLocation.things.some(thing => thing.isWall);

    if (canMove) {
      this.playerLocation = nextCoords;
    }

    return canMove;
  }

  private getLocation(coords: Coords): Location | undefined {
    const row = this.locations[coords.y];

    if (!row) {
      return undefined;
    }

    return row[coords.x];
  }
}



export function aWall(): Location {
  return { things: [{ ...defaultThing, isWall: true }] };
}

export function emptySpot(): Location {
  return { things: [] };
}
