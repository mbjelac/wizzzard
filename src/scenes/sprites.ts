import { Coords } from "../engine/Level";


export function spriteConfig(coords: Coords): SpriteConfig {
  return {
    tileCoords: coords
  };
}

export const SPRITE_CONFIGS_BY_LOCATION: Map<string, SpriteConfig> = new Map();

export const SPRITE_CONFIG_VOID: SpriteConfig = { tileCoords: { x: 0, y: 7 } };
export const SPRITE_CONFIG_WIZARD: SpriteConfig = { tileCoords: { x: 0, y: 8 } };

export const SPRITE_CONFIGS = {
  town: {
    wall: {
      brown: spriteConfig({ x: 4, y: 3 })
    },
    tree: spriteConfig({ x: 0, y: 0 }),
    grass: spriteConfig({ x: 1, y: 0 }),
    brick: spriteConfig({ x: 4, y: 0 }),
    window: {
      green: spriteConfig({ x: 5, y: 0 }),
    },
    floor: {
      wooden: spriteConfig({ x: 6, y: 0 }),
    },
    pumpkin: {
      static: spriteConfig({ x: 0, y: 1 }),
      mobile: spriteConfig({ x: 1, y: 1 }),
    },
    fence: {
      stone: {
        light: {
          horizontal: spriteConfig({ x: 2, y: 1 }),
          vertical: spriteConfig({ x: 3, y: 1 }),
        }
      }
    },
    door: {
      greenYellow: {
        knob: {
          closed: {
            vertical: spriteConfig({ x: 4, y: 1 }),
            horizontal: spriteConfig({ x: 5, y: 1 }),
          },
          open: {
            west: spriteConfig({ x: 4, y: 2 }),
            south: spriteConfig({ x: 5, y: 2 }),
            east: spriteConfig({ x: 6, y: 2 }),
            north: spriteConfig({ x: 7, y: 2 }),
          }
        },
        keyhole: {
          closed: {
            vertical: spriteConfig({ x: 4, y: 4 }),
            horizontal: spriteConfig({ x: 5, y: 4 }),
          },
          open: {
            west: spriteConfig({ x: 4, y: 5 }),
            south: spriteConfig({ x: 5, y: 5 }),
            east: spriteConfig({ x: 6, y: 5 }),
            north: spriteConfig({ x: 7, y: 5 }),
          }
        }
      },
      brownSilver: {
        keyhole: {
          closed: {
            vertical: spriteConfig({ x: 4, y: 6 }),
            horizontal: spriteConfig({ x: 5, y: 6 }),
          },
          open: {
            west: spriteConfig({ x: 4, y: 7 }),
            south: spriteConfig({ x: 5, y: 7 }),
            east: spriteConfig({ x: 6, y: 7 }),
            north: spriteConfig({ x: 7, y: 7 }),
          }
        }
      }
    },
    herbGarden: {
      greenBlue: spriteConfig({ x: 0, y: 4 }),
      greenBlueRed: spriteConfig({ x: 0, y: 5 }),
      greenYellow: spriteConfig({ x: 1, y: 4 }),
      greenYellowOrange: spriteConfig({ x: 1, y: 5 }),
    },
    barrel: {
      brown: {
        water: spriteConfig({x: 1, y: 6}),
        broken: spriteConfig({x: 1, y: 6}),
      }
    }
  },
  forest: {
    tree: spriteConfig({ x: 2, y: 0 }),
    floor: spriteConfig({ x: 3, y: 0 }),
    woodenWall: {
      light: {
        vertical: spriteConfig({ x: 7, y: 0 }),
        horizontal: spriteConfig({ x: 7, y: 1 }),
      },
      dark: {
        vertical: spriteConfig({ x: 8, y: 0 }),
        horizontal: spriteConfig({ x: 8, y: 1 }),
      },
    },
    rock: {
      big: spriteConfig({x: 0, y: 6})
    },
  }
}

export interface SpriteConfig {
  tileCoords: Coords;
}
