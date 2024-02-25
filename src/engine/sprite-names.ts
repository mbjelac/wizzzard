export type SpriteAnimationName = "burn" | "bubble" | "splash";

export const spriteAnimations = new Map<string, SpriteAnimationName>()
  .set("fire", "burn");
