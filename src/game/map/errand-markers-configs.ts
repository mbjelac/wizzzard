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
          framesPerSecond: 2
        }
      },
      location: { x: 14, y: 5 }
    }
  )
  .set(
    "forgetfulDruid",
    {
      mapTile: {
        frameIndex: tileLocationToFrameIndex({ x: 3, y: 0 }),
      },
      location: { x: 18, y: 6 }
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
  .set(
    "forestLake",
    {
      mapTile: {
        frameIndex: tileLocationToFrameIndex({ x: 4, y: 6 }),
        animation: {
          frameCount: 4,
          framesPerSecond: 4
        }
      },
      location: { x: 16, y: 7 }
    }
  )
  .set(
    "misplacedVial",
    {
      mapTile: {
        frameIndex: tileLocationToFrameIndex({ x: 3, y: 0 }),
      },
      location: { x: 13, y: 10 }
    }
  )
  .set(
    "brokenBridge",
    {
      mapTile: {
        frameIndex: tileLocationToFrameIndex({ x: 4, y: 8 }),
        animation: {
          frameCount: 1,
          framesPerSecond: 1
        }
      },
      location: { x: 11, y: 7 }
    }
  )
;
