import { Coords } from "../engine/Level";

export const sprites = new Map<string, SpriteConfig>([
  ["void", { tileCoords: {x: 0, y: 7}}],
  ["wizard", { tileCoords: {x: 0, y: 8}}],

  ["town/wall-brown", { tileCoords: {x: 4, y: 3}}],
  ["town/tree", { tileCoords: {x: 0, y: 0}}],
  ["town/grass", { tileCoords: {x: 1, y: 0}}],
  ["forest/tree", { tileCoords: {x: 2, y: 0}}],
  ["forest/floor", { tileCoords: {x: 3, y: 0}}],
  ["town/brick", { tileCoords: {x: 4, y: 0}}],
  ["town/window-green", { tileCoords: {x: 5, y: 0}}],
  ["town/floor-wooden", { tileCoords: {x: 6, y: 0}}],
  ["forest/cabin-wooden-light-v", { tileCoords: {x: 7, y: 0}}],
  ["forest/cabin-wooden-dark-v", { tileCoords: {x: 8, y: 0}}],
  ["forest/cabin-wooden-light-h", { tileCoords: {x: 7, y: 1}}],
  ["forest/cabin-wooden-dark-h", { tileCoords: {x: 8, y: 1}}],
  ["town/pumpkin-static", { tileCoords: {x: 0, y: 1}}],
  ["town/pumpkin-mobile", { tileCoords: {x: 1, y: 1}}],
  ["town/fence-stone-light-h", { tileCoords: {x: 2, y: 1}}],
  ["town/fence-stone-light-v", { tileCoords: {x: 3, y: 1}}],

  ["town/door-green-yellow-knob-closed-v", { tileCoords: {x: 4, y: 1}}],
  ["town/door-green-yellow-knob-closed-h", { tileCoords: {x: 5, y: 1}}],
  ["town/door-green-yellow-knob-open-w", { tileCoords: {x: 4, y: 2}}],
  ["town/door-green-yellow-knob-open-s", { tileCoords: {x: 5, y: 2}}],
  ["town/door-green-yellow-knob-open-e", { tileCoords: {x: 6, y: 2}}],
  ["town/door-green-yellow-knob-open-n", { tileCoords: {x: 7, y: 2}}],
  ["town/door-green-yellow-keyhole-closed-v", { tileCoords: {x: 4, y: 4}}],
  ["town/door-green-yellow-keyhole-closed-h", { tileCoords: {x: 5, y: 4}}],
  ["town/door-green-yellow-keyhole-open-w", { tileCoords: {x: 4, y: 5}}],
  ["town/door-green-yellow-keyhole-open-s", { tileCoords: {x: 5, y: 5}}],
  ["town/door-green-yellow-keyhole-open-e", { tileCoords: {x: 6, y: 5}}],
  ["town/door-green-yellow-keyhole-open-n", { tileCoords: {x: 7, y: 5}}],
  ["town/door-brown-silver-keyhole-closed-v", { tileCoords: {x: 4, y: 6}}],
  ["town/door-brown-silver-keyhole-closed-h", { tileCoords: {x: 5, y: 6}}],
  ["town/door-brown-silver-keyhole-open-w", { tileCoords: {x: 4, y: 7}}],
  ["town/door-brown-silver-keyhole-open-s", { tileCoords: {x: 5, y: 7}}],
  ["town/door-brown-silver-keyhole-open-e", { tileCoords: {x: 6, y: 7}}],
  ["town/door-brown-silver-keyhole-open-n", { tileCoords: {x: 7, y: 7}}],

  ["town/herb-garden-green-blue", { tileCoords: {x: 0, y: 4}}],
  ["town/herb-garden-green-blue-red", { tileCoords: {x: 0, y: 5}}],
  ["town/herb-garden-green-yellow", { tileCoords: {x: 1, y: 4}}],
  ["town/herb-garden-green-yellow-orange", { tileCoords: {x: 1, y: 5}}],

  ["forest/rock-1", { tileCoords: {x: 0, y: 6}}],
  ["town/barrel-brown-water", { tileCoords: {x: 1, y: 6}}],
  ["town/barrel-brown-broken", { tileCoords: {x: 2, y: 6}}],
]);

export interface SpriteConfig {
  tileCoords: Coords;
}
