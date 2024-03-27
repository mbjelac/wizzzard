import { Coords } from "../engine/Level";

export const sprites = new Map<string, SpriteConfig>([
  ["forest/alpaca-tree", { tileCoords: {x: 0, y: 0}}],
  ["forest/micro-tree", { tileCoords: {x: 0, y: 0}}],
  ["forest/grass", { tileCoords: {x: 1, y: 0}}],
  ["town/brick", { tileCoords: {x: 4, y: 0}}],
  ["town/window", { tileCoords: {x: 5, y: 0}}],
  ["town/floor-wooden", { tileCoords: {x: 6, y: 0}}],
  ["town/door-wooden-green-horizontal", { tileCoords: {x: 5, y: 1}}],
  ["void", { tileCoords: {x: 2, y: 0}}],
  ["wizard1", { tileCoords: {x: 1, y: 1}}],
]);

export interface SpriteConfig {
  tileCoords: Coords;
}
