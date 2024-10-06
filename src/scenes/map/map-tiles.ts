import { map } from "./map";
import { Coords } from "../../engine/Errand";

const tileSetWidth = 25;

export interface MapTiles {
  tiles: MapTile[][];
}

export interface MapTile {
  readonly frameIndex: number;
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
        frameIndex: 0
      };
    case "h":
      return {
        frameIndex: tileLocationToFrameIndex({x: 1, y: 12})
      };
    case "v":
      return {
        frameIndex: tileLocationToFrameIndex({x: 0, y: 12})
      };
    case "f":
      return {
        frameIndex: tileLocationToFrameIndex(getZoneTileLocation(symbol, location), { x: 0, y: 1 })
      }
    default:
      return {
        frameIndex: -1
      };
  }
}

function tileLocationToFrameIndex(
  location: Coords,
  offset: Coords = {x: 0, y: 0},
): number {

  const actualLocation: Coords = {
    x: location.x + offset.x,
    y: location.y + offset.y
  };

  return actualLocation.y * tileSetWidth + actualLocation.x;
}

function getZoneTileLocation(symbol: string, location: Coords): Coords {

  const zoneIndexes: { [key: string]: Coords } = {
    "0000": { x: 3, y: 0 },
    "0001": { x: 3, y: 1 },
    "0010": { x: 5, y: 1 },
    "0011": { x: 4, y: 1 },
    "0100": { x: 3, y: 2 },
    "0101": { x: 0, y: 0 },
    "0110": { x: 2, y: 0 },
    "0111": { x: 1, y: 0 },
    "1000": { x: 5, y: 2 },
    "1001": { x: 4, y: 1 },
    "1010": { x: 2, y: 2 },
    "1011": { x: 1, y: 2 },
    "1100": { x: 4, y: 2 },
    "1101": { x: 0, y: 2 },
    "1110": { x: 2, y: 2 },
    "1111": { x: 1, y: 1 },
  };

  return zoneIndexes[getZoneIndexKey(symbol, location)];
}

function getZoneIndexKey(symbol: string, location: Coords): string {
  return [
    getSymbol(Direction.UP.getLocation(location)) === symbol,
    getSymbol(Direction.DOWN.getLocation(location)) === symbol,
    getSymbol(Direction.LEFT.getLocation(location)) === symbol,
    getSymbol(Direction.RIGHT.getLocation(location)) === symbol,
  ]
  .map(hasNeighbour => hasNeighbour ? "1" : "0")
  .join("");
}

function getSymbol(location: Coords): string {
  return map[location.y]?.charAt(location.x) || " ";
}
