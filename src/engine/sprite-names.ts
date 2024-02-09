export type SpriteName = "floor" | "wall" | "fire" | "key" | "lock" | "key_green";
export type SpriteAnimationName = "burn" | "bubble" | "splash";

export const spriteAnimations = new Map<SpriteName, SpriteAnimationName>()
  .set("fire", "burn");
