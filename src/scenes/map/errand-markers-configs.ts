import { MapTile, tileLocationToFrameIndex } from "./map-tiles";
import { Coords } from "../../engine/Errand";

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
);
