import { map } from "./map";
import { Coords } from "../level/LevelDescription";

const tileSetWidth = 25;

export interface MapTiles {
  tiles: MapTile[][];
}

export interface MapTile {
  readonly frameIndex: number;
  readonly animation?: MapTileAnimation;
}

export interface MapTileAnimation {
  readonly frameCount: number;
  readonly framesPerSecond?: number;
}

class Direction {

  static readonly UP = new Direction(0, -1);
  static readonly DOWN = new Direction(0, 1);
  static readonly LEFT = new Direction(-1, 0);
  static readonly RIGHT = new Direction(1, 0);

  private constructor(private readonly deltaX: -1 | 0 | 1, private readonly deltaY: -1 | 0 | 1) {
  }

  getLocation(location: Coords): Coords {
    return {
      x: location.x + this.deltaX,
      y: location.y + this.deltaY
    };
  }
}

const zoneNeighbourhood: { [key: string]: Coords } = {
  "0000": { x: 3, y: 0 },
  "0001": { x: 3, y: 1 },
  "0010": { x: 5, y: 1 },
  "0011": { x: 4, y: 1 },
  "0100": { x: 3, y: 2 },
  "0101": { x: 0, y: 0 },
  "0110": { x: 2, y: 0 },
  "0111": { x: 1, y: 0 },
  "1000": { x: 5, y: 2 },
  "1001": { x: 0, y: 2 },
  "1010": { x: 2, y: 2 },
  "1011": { x: 1, y: 2 },
  "1100": { x: 4, y: 2 },
  "1101": { x: 0, y: 1 },
  "1110": { x: 2, y: 1 },
  "1111": { x: 1, y: 1 },
};

const roadNeighbourhood: { [key: string]: Coords } = {
  "0000": { x: 0, y: 0 },
  "0001": { x: 0, y: 0 },
  "0010": { x: 0, y: 0 },
  "0011": { x: 0, y: 0 },
  "0100": { x: 1, y: 0 },
  "0101": { x: 4, y: 0 },
  "0110": { x: 3, y: 0 },
  "0111": { x: 9, y: 0 },
  "1000": { x: 1, y: 0 },
  "1001": { x: 5, y: 0 },
  "1010": { x: 2, y: 0 },
  "1011": { x: 7, y: 0 },
  "1100": { x: 1, y: 0 },
  "1101": { x: 8, y: 0 },
  "1110": { x: 10, y: 0 },
  "1111": { x: 6, y: 0 },
};

const riverNeighbourhood1: { [key: string]: Coords } = {
  "0000": { x: 0, y: 0 },
  "0001": { x: 0, y: 9 },
  "0010": { x: 0, y: 11 },
  "0011": { x: 0, y: 0 },
  "0100": { x: 0, y: 10 },
  "0101": { x: 0, y: 5 },
  "0110": { x: 0, y: 4 },
  "0111": { x: 0, y: 0 },
  "1000": { x: 0, y: 8 },
  "1001": { x: 0, y: 7 },
  "1010": { x: 0, y: 6 },
  "1011": { x: 0, y: 0 },
  "1100": { x: 0, y: 2 },
  "1101": { x: 0, y: 0 },
  "1110": { x: 0, y: 0 },
  "1111": { x: 0, y: 0 },
};

const riverNeighbourhood2: { [key: string]: Coords } = {
  "0000": { x: 0, y: 0 },
  "0001": { x: 0, y: 9 },
  "0010": { x: 0, y: 11 },
  "0011": { x: 0, y: 1 },
  "0100": { x: 0, y: 10 },
  "0101": { x: 0, y: 5 },
  "0110": { x: 0, y: 4 },
  "0111": { x: 0, y: 0 },
  "1000": { x: 0, y: 8 },
  "1001": { x: 0, y: 7 },
  "1010": { x: 0, y: 6 },
  "1011": { x: 0, y: 0 },
  "1100": { x: 0, y: 3 },
  "1101": { x: 0, y: 0 },
  "1110": { x: 0, y: 0 },
  "1111": { x: 0, y: 0 },
};

export const mapTiles: MapTiles = {
  tiles: map
  .map((row, y) =>
    row
    .split("")
    .map((symbol, x) =>
      createMapTile(symbol, { x, y })
    )
  )
}


function createMapTile(symbol: string, location: Coords): MapTile {
  switch (symbol) {
    case "M":
      return {
        frameIndex: tileLocationToFrameIndex(getConnectedTileLocation(symbol, location, zoneNeighbourhood), { x: 12, y: 1 })
      }
    case "H":
      return {
        frameIndex: 1
      };
    case "h":
      return {
        frameIndex: tileLocationToFrameIndex({ x: 1, y: 16 })
      };
    case "t":
      return {
        frameIndex: tileLocationToFrameIndex({ x: 2, y: 16 })
      };
    case "v":
      return {
        frameIndex: tileLocationToFrameIndex({ x: 0, y: 16 })
      };
    case "f":
      return {
        frameIndex: tileLocationToFrameIndex(getConnectedTileLocation(symbol, location, zoneNeighbourhood), { x: 0, y: 1 })
      };
    case "R":
      return {
        frameIndex: tileLocationToFrameIndex({ x: 3, y: 16 })
      }
    case "w":
      return {
        frameIndex: tileLocationToFrameIndex(getConnectedTileLocation(symbol, location, zoneNeighbourhood), { x: 6, y: 1 })
      }
    case "p":
      return {
        frameIndex: tileLocationToFrameIndex(
          getConnectedTileLocation(
            symbol,
            location,
            roadNeighbourhood
          ),
          { x: 0, y: 17 }
        )
      }
    case "r":
      return {
        frameIndex: tileLocationToFrameIndex(
          getConnectedTileLocation(
            symbol,
            location,
            (location.x + location.y) % 2 === 0
              ? riverNeighbourhood1
              : riverNeighbourhood2,
            ["w"]
          ),
          { x: 0, y: 4 }
        ),
        animation: {
          frameCount: 2,
          framesPerSecond: 4
        }
      }
    default:
      return {
        frameIndex: -1
      };
  }
}

export function tileLocationToFrameIndex(
  location: Coords,
  offset: Coords = { x: 0, y: 0 },
): number {

  const actualLocation: Coords = {
    x: location.x + offset.x,
    y: location.y + offset.y
  };

  return actualLocation.y * tileSetWidth + actualLocation.x;
}

function getConnectedTileLocation(symbol: string, location: Coords, neighbourhoodMap: { [key: string]: Coords }, alsoNeighbours: string[] = []): Coords {
  return neighbourhoodMap[getZoneIndexKey(symbol, location, alsoNeighbours)];
}

function getZoneIndexKey(symbol: string, location: Coords, alsoNeighbours: string[] = []): string {
  return [
    hasNeighbor(symbol, location, Direction.UP, alsoNeighbours),
    hasNeighbor(symbol, location, Direction.DOWN, alsoNeighbours),
    hasNeighbor(symbol, location, Direction.LEFT, alsoNeighbours),
    hasNeighbor(symbol, location, Direction.RIGHT, alsoNeighbours),
  ]
  .map(hasNeighbour => hasNeighbour ? "1" : "0")
  .join("");
}

function hasNeighbor(symbol: string, location: Coords, direction: Direction, alsoNeighbours: string[] = []): boolean {
  const neighbouringSymbol = getSymbol(direction.getLocation(location));
  return neighbouringSymbol === symbol || alsoNeighbours.includes(neighbouringSymbol);
}

function getSymbol(location: Coords): string {
  return map[location.y]?.charAt(location.x) || " ";
}

