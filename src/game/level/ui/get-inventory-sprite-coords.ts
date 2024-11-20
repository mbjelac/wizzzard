import { Coords } from "../LevelDescription";
import { INVENTORY_MARGIN, TILE_SIZE } from "../../../constants";

export function getInventorySpriteCoords(index: number, offset: Coords): Coords {

  const itemOffset = TILE_SIZE + INVENTORY_MARGIN

  return {
    x: offset.x + itemOffset * (index % 3),
    y: offset.y + itemOffset * Math.floor(index / 3)
  };
}
