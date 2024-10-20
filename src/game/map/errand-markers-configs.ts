import { MapTile, tileLocationToFrameIndex } from "./map-tiles";
import { Coords } from "../level/LevelDescription";

export interface ErrandMarkerConfig {
  readonly mapTile: MapTile;
  readonly location: Coords;

}

export const errandMarkersConfigs = new Map<string, ErrandMarkerConfig>()
  .set(
    "woodenDog",
    {
      mapTile: {
        frameIndex: tileLocationToFrameIndex({ x: 4, y: 4 }),
        animation: {
          frameCount: 2,
          framesPerSecond: 3
        }
      },
      location: { x: 14, y: 5 }
    }
  )
  .set(
    "forgetfulDruid",
    {
      mapTile: {
        frameIndex: tileLocationToFrameIndex({ x: 4, y: 5 }),
        animation: {
          frameCount: 20,
          framesPerSecond: 4
        }
      },
      location: { x: 16, y: 9 }
    }
  )
  .set(
    "void",
    {
      mapTile: {
        frameIndex: tileLocationToFrameIndex({ x: 2, y: 0 }),
      },
      location: { x: 2, y: 4 }
    }
  )
;
