export class Level {

  constructor(
    public tiles: Location[][]
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
