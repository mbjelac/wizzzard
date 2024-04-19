import { Coords } from "../engine/Errand";

export interface SpriteConfig {
  tileCoords: Coords;
  animation?: Animation;
  auxAnimation?: Animation;
  variants: Coords[];
}

export interface Animation {
  frameCount: number;
  framesPerSecond?: number;
}


function spriteConfig(
  coords: Coords,
  animation: Animation | undefined = undefined,
  auxAnimation: Animation | undefined = undefined,
  variants: Coords[] = []
): SpriteConfig {
  return {
    tileCoords: coords,
    animation,
    auxAnimation,
    variants
  };
}

export function spriteAt(x: number, y: number): SpriteConfig {
  return {
    tileCoords: { x, y },
    variants: []
  };
}


export const SPRITE_CONFIGS_BY_LOCATION: Map<string, SpriteConfig> = new Map();

export const SPRITE_CONFIG_VOID = spriteAt(0, 7);
export const SPRITE_CONFIG_WIZARD = spriteAt(0, 10);

export const SPRITE_CONFIGS = {
  transparent: spriteAt(1, 7),
  town: {
    wall: {
      brown: spriteAt(4, 3)
    },
    tree: spriteAt(0, 0),
    bush: spriteAt(3, 3),
    grass: spriteAt(1, 0),
    brick: spriteAt(4, 0),
    window: {
      green: spriteAt(5, 0),
    },
    floor: {
      wooden: spriteAt(6, 0),
    },
    furniture: {
      wooden: {
        table: spriteAt(9, 0),
        tableContents1: spriteAt(10, 0),
        tableContents2: spriteAt(11, 0),
        tableContents3: spriteAt(12, 0),
        tableContents4: spriteAt(13, 0),
        shelves: spriteAt(9, 1),
        shelveContents1: spriteAt(10, 1),
        shelveContents2: spriteAt(11, 1),
        shelveContents3: spriteAt(12, 1),
        shelveContents4: spriteAt(13, 1),
        shelveContents5: spriteAt(14, 1),
        chair: spriteAt(9, 2),
      }
    },
    pumpkin: {
      static: spriteAt(0, 1),
      mobile: spriteAt(1, 1),
      haloween: spriteAt(3, 2),
    },
    fence: {
      stone: {
        light: {
          horizontal: spriteAt(2, 1),
          vertical: spriteAt(3, 1),
        }
      }
    },
    door: {
      greenYellow: {
        knob: {
          closed: {
            vertical: spriteAt(4, 1),
            horizontal: spriteAt(5, 1),
          },
          open: {
            west: spriteAt(4, 2),
            south: spriteAt(5, 2),
            east: spriteAt(6, 2),
            north: spriteAt(7, 2),
          }
        },
        keyhole: {
          closed: {
            vertical: spriteAt(4, 4),
            horizontal: spriteAt(5, 4),
          },
          open: {
            west: spriteAt(4, 5),
            south: spriteAt(5, 5),
            east: spriteAt(6, 5),
            north: spriteAt(7, 5),
          }
        }
      },
      brownSilver: {
        keyhole: {
          closed: {
            vertical: spriteAt(4, 6),
            horizontal: spriteAt(5, 6),
          },
          open: {
            west: spriteAt(4, 7),
            south: spriteAt(5, 7),
            east: spriteAt(6, 7),
            north: spriteAt(7, 7),
          }
        }
      }
    },
    herbGarden: {
      greenBlue: spriteAt(0, 4),
      greenBlueRed: spriteAt(0, 5),
      greenYellow: spriteAt(1, 4),
      greenYellowOrange: spriteAt(1, 5),
    },
    barrel: {
      brown: {
        water: spriteConfig(
          { x: 0, y: 6 },
          {
            frameCount: 4,
            framesPerSecond: 4
          }
        ),
        broken: spriteAt(2, 7),
      }
    }
  },
  forest: {
    tree: spriteConfig(
      {x:0, y:17},
      undefined,
      undefined,
      [
        {x: 1, y: 17},
        {x: 2, y: 17},
        {x: 3, y: 17},
        {x: 4, y: 17},
      ]
    ),
    floor: spriteAt(3, 0),
    woodenWall: {
      light: {
        vertical: spriteAt(7, 0),
        horizontal: spriteAt(7, 1),
      },
      dark: {
        vertical: spriteAt(8, 0),
        horizontal: spriteAt(8, 1),
      },
    },
    rock: {
      big: spriteAt(3, 7)
    },
    fly: {
      silver: spriteConfig(
        { x: 0, y: 12 },
        {
          frameCount: 16,
          framesPerSecond: 8
        }
      ),
    },
    toadstool: spriteConfig(
      {x:0, y:16},
      undefined,
      undefined,
      [
        {x: 1, y: 16},
        {x: 2, y: 16},
        {x: 3, y: 16},
        {x: 4, y: 16},
        {x: 5, y: 16},
        {x: 6, y: 16},
      ]
    ),
  },
  keys: {
    silver: spriteAt(1, 8)
  },
  characters: {
    kim: spriteConfig(
      { x: 2, y: 9 },
      { frameCount: 6, framesPerSecond: 3 },
      { frameCount: 4, framesPerSecond: 3 }
    )
  },
  misc: {
    woodenDog: spriteAt(0, 9),
    seed: spriteAt(1, 9),
  }
}

