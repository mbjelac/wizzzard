import { SpriteConfig } from "./sprites";

export function convertToHtml(
  spriteConfigs: any,
  configToHtml: (lastKey: string, spriteConfig: SpriteConfig) => string
): string {
  return Object
    .keys(spriteConfigs)
    .map(key => {

      if (spriteConfigs[key].tileCoords !== undefined) {
        return configToHtml(key, spriteConfigs[key]);
      }

      return "<details><summary>" +
        key +
        "</summary>" +
        convertToHtml(spriteConfigs[key], configToHtml) +
        "</details>";
    })
    .join("");
}
