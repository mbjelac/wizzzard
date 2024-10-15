import { Coords } from "../../engine/LevelDescription";
import { TILE_SIZE, tileCenterOffset } from "../../config";

function toPixelCoords(coords: Coords): Coords {
  return {
    x: coords.x * TILE_SIZE + tileCenterOffset,
    y: coords.y * TILE_SIZE + tileCenterOffset
  }
}

export default toPixelCoords;
