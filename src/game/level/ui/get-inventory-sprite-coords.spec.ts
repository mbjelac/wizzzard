import { getInventorySpriteCoords } from "./get-inventory-sprite-coords";
import { Coords } from "../LevelDescription";
import { INVENTORY_MARGIN, TILE_SIZE } from "../../../constants";

const offset: Coords = {x: 45, y: 32};

const expectedOffsetPixels = TILE_SIZE + INVENTORY_MARGIN;

it("return offset for 1st item", () => {
  expect(getInventorySpriteCoords(0, offset)).toEqual(offset);
});

it("return shifted to right for 2nd item", () => {
  expect(getInventorySpriteCoords(1, offset)).toEqual<Coords>({
    x: offset.x + expectedOffsetPixels,
    y: offset.y
  });
});

it("return shifted to more right for 3nd item", () => {
  expect(getInventorySpriteCoords(2, offset)).toEqual<Coords>({
    x: offset.x + expectedOffsetPixels * 2,
    y: offset.y
  });
});

it("return shifted to next row for 4th item", () => {
  expect(getInventorySpriteCoords(3, offset)).toEqual<Coords>({
    x: offset.x,
    y: offset.y + expectedOffsetPixels
  });
});
