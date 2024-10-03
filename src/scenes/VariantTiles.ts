import { Coords } from "../engine/Errand";
import { SpriteConfig } from "./sprites";

export class VariantTiles {

  private readonly variantCoordsCache = new Map<string, Coords>();

  getTileCoords(spriteConfig: SpriteConfig, spriteCoords: Coords): Coords {

    if (spriteConfig.variants.length === 0) {
      return spriteConfig.tileCoords;
    }

    const variantCacheKey = `x=${spriteCoords.x} y=${spriteCoords.y}`;

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

}
