export class Level {

  public static random(width: number, height: number): Level {

    const locations = Array(width).fill(0).map(_ =>
      Array(height).fill(0).map(_ => {
          if (Math.random() > 0.2) {
            return emptySpot();
          } else {
            return aWall();
          }
        }
      )
    );

    return new Level(locations);
  }

  constructor(
    public locations: Location[][]
  ) {
  }
}

export interface Location {

  things: Thing[]
}

export interface Thing {

  isWall: boolean
}

export function aWall(): Location {
  return { things: [{ isWall: true }] };
}

export function emptySpot(): Location {
  return { things: [] };
}
