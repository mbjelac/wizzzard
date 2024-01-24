export type SpriteName = "floor" | "wall" | "fire";
export type SpriteAnimationName = "burn" | "bubble" | "splash";

export const spriteAnimations = new Map<SpriteName, SpriteAnimationName>()
  .set("fire", "burn");
