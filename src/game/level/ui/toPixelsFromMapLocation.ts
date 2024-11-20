import { Coords } from "../LevelDescription";
import { TILE_SIZE, tileCenterOffset } from "../../../constants";

export function toPixelsFromMapLocation(coords: Coords): Coords {
  return {
    x: coords.x * TILE_SIZE + tileCenterOffset,
    y: coords.y * TILE_SIZE + tileCenterOffset
  }
}
