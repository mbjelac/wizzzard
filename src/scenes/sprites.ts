export const sprites = new Map<string, SpriteConfig>([
  ["forest/alpaca-tree", { frameIndex: 0}],
  ["forest/micro-tree", { frameIndex: 0}],
  ["forest/grass", { frameIndex: 1}],
  ["town/brick", { frameIndex: 4}],
  ["town/window", { frameIndex: 5}],
  ["town/floor-wooden", { frameIndex: 6}],
  ["void", { frameIndex: 2}],
  ["wizard1", { frameIndex: 9}],
]);

export interface SpriteConfig {
  frameIndex: number;
}
