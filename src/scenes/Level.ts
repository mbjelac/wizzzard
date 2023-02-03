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

  constructor(
    public locations: Location[][],
    public start: Coords
  ) {
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

export function aWall(): Location {
  return { things: [{ ...defaultThing, isWall: true }] };
}

export function emptySpot(): Location {
  return { things: [] };
}
