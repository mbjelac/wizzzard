import { Coords } from "../LevelDescription";
import { SpriteConfig } from "./sprites";

export class VariantTiles {

  private readonly variantCoordsCache = new Map<string, Coords>();

  getTileCoords(spriteConfig: SpriteConfig, spriteName: string, spriteCoords: Coords): Coords {

    if (spriteConfig.variants.length === 0) {
      return spriteConfig.tileCoords;
    }

    const variantCacheKey = createVariantCacheKey(spriteName, spriteCoords);

    if (this.variantCoordsCache.has(variantCacheKey)) {
      return this.variantCoordsCache.get(variantCacheKey)!;
    }

    const randomIndex = Math.floor(Math.random() * (spriteConfig.variants.length + 1)) - 1;

    if (randomIndex === -1) {
      return spriteConfig.tileCoords;
    }

    const variantTileCoords = spriteConfig.variants[randomIndex];

    this.variantCoordsCache.set(variantCacheKey, variantTileCoords);

    return variantTileCoords;
  }

  remove(spriteName: string, spriteCoords: Coords) {
    const key = createVariantCacheKey(spriteName, spriteCoords);
    this.variantCoordsCache.delete(key);

  }
}

function createVariantCacheKey(name: string, coords: Coords): string {
  return `${name}(${coords.x},${coords.y})`;
}
