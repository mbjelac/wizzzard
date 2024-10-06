import { map } from "./map";
import { Coords } from "../../engine/Errand";

export interface MapTiles {
  tiles: MapTile[][];
}

export interface MapTile {
  readonly frameIndex: number;
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
      }
    default:
      return {
        frameIndex: -1
      }
  }
}
