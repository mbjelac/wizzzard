import { Coords } from "../engine/Errand";

export interface SpriteConfig {
  tileCoords: Coords;
  animation?: AnimationConfig;
  auxAnimation?: AnimationConfig;
  variants: Coords[];
  soundEffect?: string;
}

export interface AnimationConfig {
  frameCount: number;
  framesPerSecond?: number;
  uniformStartFrame?: boolean;
}


function spriteConfig(
  config: {
    coords: Coords;
    animation?: AnimationConfig;
    auxAnimation?: AnimationConfig;
    variants?: Coords[];
    soundEffect?: string;
  }
): SpriteConfig {
  return {
    tileCoords: config.coords,
    animation: config.animation,
    auxAnimation: config.auxAnimation,
    variants: config.variants || [],
    soundEffect: config.soundEffect
  };
}

export function spriteAt(x: number, y: number, soundEffect: string | undefined = undefined): SpriteConfig {
  return {
    tileCoords: { x, y },
    variants: [],
    soundEffect
  };
}


export const SPRITE_CONFIGS_BY_LOCATION: Map<string, SpriteConfig> = new Map();

export const SPRITE_CONFIG_VOID = spriteAt(0, 7);
export const SPRITE_CONFIG_WIZARD = spriteAt(0, 10);

export const SPRITE_CONFIGS = {
  transparent: spriteAt(1, 7),
  town: {
    wall: {
      brownStone: spriteAt(4, 3),
      brownStoneDark: spriteAt(5, 3),
      brick: spriteAt(4, 0),
      mud: spriteAt(12, 5),
      torch:
        spriteConfig({
          coords: { x: 12, y: 4 },
          animation: {
            frameCount: 4,
            framesPerSecond: 8
          }
        })
    },
    stairs: {
      brownStone: {
        up: spriteAt(6, 3),
        down: spriteAt(7, 3)
      }
    },
    tree: spriteAt(0, 0),
    bush: spriteAt(3, 3),
    grass: spriteConfig({
      coords: { x: 1, y: 0 },
      soundEffect: "grassStep"
    }),
    dirt_old: spriteAt(2, 0),
    dirt: spriteConfig({
      coords: { x: 12, y: 7 },
      variants: [
        { x: 12, y: 7 },
        { x: 13, y: 7 },
        { x: 14, y: 7 },
      ]
    }),
    window: {
      green: spriteAt(5, 0),
    },
    floor: {
      wooden: spriteAt(6, 0),
      stone: spriteAt(6, 1),
      earth: spriteAt(12, 6)
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
      },
      hearth: {
        front: spriteAt(0, 27),
        back: spriteAt(1, 27)
      }
    },
    pumpkin: {
      static: spriteAt(0, 1),
      mobile: spriteAt(1, 1, "slide2"),
      haloween: spriteAt(3, 2, "slide2"),
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
            vertical: spriteConfig(
              {
                coords: { x: 4, y: 4 },
                soundEffect: "doorUnlock",
                animation: {
                  frameCount: 1
                },
                auxAnimation: {
                  frameCount: 1
                }
              }
            ),
            horizontal: spriteConfig(
              {
                coords: { x: 4, y: 5 },
                soundEffect: "doorUnlock",
                animation: {
                  frameCount: 1
                },
                auxAnimation: {
                  frameCount: 1
                }
              }
            ),
          }
        }
      },
      brownSilver: {
        keyhole: {
          closed: {
            vertical: spriteConfig(
              {
                coords: { x: 4, y: 6 },
                soundEffect: "doorUnlock",
                animation: {
                  frameCount: 1
                },
                auxAnimation: {
                  frameCount: 1
                }
              }
            ),
            horizontal: spriteConfig(
              {
                coords: { x: 4, y: 7 },
                soundEffect: "doorUnlock",
                animation: {
                  frameCount: 1
                },
                auxAnimation: {
                  frameCount: 1
                }
              }
            ),
          }
        }
      },
      blueBarSilver: {
        keyhole: {
          closed: {
            vertical: spriteConfig(
              {
                coords: { x: 8, y: 6 },
                soundEffect: "doorUnlock",
                animation: {
                  frameCount: 1
                },
                auxAnimation: {
                  frameCount: 1
                }
              }
            ),
            horizontal: spriteConfig(
              {
                coords: { x: 8, y: 7 },
                soundEffect: "doorUnlock",
                animation: {
                  frameCount: 1
                },
                auxAnimation: {
                  frameCount: 1
                }
              }
            ),
          },
          open: {
            vertical: spriteAt(8, 7),
            horizontal: spriteAt(9, 7),
          },
        }
      },
      darkBrownEmerald: {
        keyhole: {
          closed: {
            vertical: spriteConfig(
              {
                coords: { x: 6, y: 4 },
                soundEffect: "doorUnlock",
                animation: {
                  frameCount: 1
                },
                auxAnimation: {
                  frameCount: 1
                }
              }
            ),
            horizontal: spriteConfig(
              {
                coords: { x: 6, y: 5 },
                soundEffect: "doorUnlock",
                animation: {
                  frameCount: 1
                },
                auxAnimation: {
                  frameCount: 1
                }
              }
            ),
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
        water: spriteConfig({
          coords: { x: 0, y: 6 },
          animation: {
            frameCount: 4,
            framesPerSecond: 4
          },
          soundEffect: "slide1"
        }),
        broken: spriteAt(2, 7),
      }
    },
    flowers: spriteConfig({
      coords: { x: 0, y: 15 },
      variants: [
        { x: 1, y: 15 },
        { x: 2, y: 15 },
        { x: 3, y: 15 },
        { x: 4, y: 15 },
        { x: 5, y: 15 },
        { x: 6, y: 15 },
      ]
    }),
  },
  forest: {
    tree: spriteConfig({
      coords: { x: 0, y: 17 },
      variants: [
        { x: 1, y: 17 },
        { x: 2, y: 17 },
        { x: 3, y: 17 },
        { x: 4, y: 17 },
      ]
    }),
    treeStump: spriteAt(5, 17),
    bush: spriteConfig({
      coords: { x: 6, y: 17 },
      variants: [
        { x: 7, y: 17 },
        { x: 8, y: 17 },
        { x: 9, y: 17 },
      ]
    }),
    floor: spriteAt(3, 0, "forestStep"),
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
    rocks: {
      big: spriteAt(3, 7),
      rock1: spriteAt(0, 19),
      writing1: spriteAt(1, 19),
      pad: spriteAt(2, 19),
      pillar: spriteAt(0, 23),
      pillarWriting: spriteAt(1, 23)
    },
    fly: {
      silver: spriteConfig({
        coords: { x: 0, y: 12 },
        animation: {
          frameCount: 16,
          framesPerSecond: 8
        }
      }),
    },
    toadstool: spriteConfig({
      coords: { x: 0, y: 16 },
      variants: [
        { x: 1, y: 16 },
        { x: 2, y: 16 },
        { x: 3, y: 16 },
        { x: 4, y: 16 },
        { x: 5, y: 16 },
        { x: 6, y: 16 },
      ]
    }),
    path: {
      horizontal: spriteAt(0, 18),
      vertical: spriteAt(1, 18),
      crossing: spriteAt(2, 18),
      t_s: spriteAt(3, 18),
      t_n: spriteAt(4, 18),
      t_w: spriteAt(5, 18),
      t_e: spriteAt(6, 18),
      bend_e_s: spriteAt(7, 18),
      bend_w_s: spriteAt(8, 18),
      bend_e_n: spriteAt(9, 18),
      bend_w_n: spriteAt(10, 18),
    },
    water: {
      surface: spriteConfig({
        coords: { x: 0, y: 20 },
        animation: {
          frameCount: 6,
          framesPerSecond: 5
        }
      }),
      surfaceBobbing: spriteConfig({
        coords: { x: 0, y: 21 },
        animation: {
          frameCount: 4,
          framesPerSecond: 4,
          uniformStartFrame: true
        }
      }),
      steppingStone: spriteConfig({
        coords: { x: 1, y: 22 },
        animation: {
          frameCount: 4,
          framesPerSecond: 4,
        }
      }),
      bank: {
        south: spriteConfig({
          coords: { x: 6, y: 20 },
          animation: {
            frameCount: 4,
            framesPerSecond: 4,
          }
        }),
        north: spriteConfig({
          coords: { x: 6, y: 21 },
          animation: {
            frameCount: 4,
            framesPerSecond: 4,
          }
        }),
        east: spriteConfig({
          coords: { x: 6, y: 22 },
          animation: {
            frameCount: 4,
            framesPerSecond: 4,
          }
        }),
        west: spriteConfig({
          coords: { x: 6, y: 23 },
          animation: {
            frameCount: 4,
            framesPerSecond: 4,
          }
        }),
      }
    },
    floatingLog: {
      horizontal: spriteConfig({
        coords: { x: 0, y: 24 },
        animation: {
          frameCount: 1
        },
        auxAnimation: {
          frameCount: 4,
          framesPerSecond: 4
        },
      }),
      vertical: spriteConfig({
        coords: { x: 0, y: 25 },
        animation: {
          frameCount: 1
        },
        auxAnimation: {
          frameCount: 4,
          framesPerSecond: 4
        },
      }),
    },
  },
  keys: {
    silver: spriteAt(1, 8),
    gold: spriteAt(3, 8),
    emerald: spriteAt(4, 8),
  },
  characters: {
    kim: spriteConfig({
      coords: { x: 2, y: 9 },
      animation: { frameCount: 6, framesPerSecond: 3 },
      auxAnimation: { frameCount: 4, framesPerSecond: 3 }
    })
  },
  misc: {
    woodenDog: spriteAt(0, 9),
    seed: spriteAt(1, 9),
    magicWaterVial: spriteConfig({
      coords: { x: 3, y: 19 },
      animation: {
        frameCount: 4,
        framesPerSecond: 6
      },
    }),
    fire: spriteConfig({
      coords: { x: 0, y: 26 },
      animation: {
        frameCount: 4,
        framesPerSecond: 8
      },
      auxAnimation: {
        frameCount: 1
      }
    }),
    waterBucket: spriteConfig({
      coords: { x: 0, y: 28 },
      animation: {
        frameCount: 4,
        framesPerSecond: 4
      }
    }),
    jar: spriteAt(0,29),
    book: spriteAt(1, 29)
  }
}

