import { AnimationConfig } from "./sprites";
import { Coords } from "../LevelDescription";

export interface TalkingHeadConfig {
  head: string,
  tileCoords: Coords,
  config: AnimationConfig
}

export const talkingHeadConfigs: TalkingHeadConfig[] = [
  {
    head: "lyra",
    tileCoords: { x: 0, y: 0 },
    config: {
      frameCount: 6,
      framesPerSecond: 4
    }
  },
  {
    head: "book",
    tileCoords: { x: 0, y: 1 },
    config: {
      frameCount: 1
    }
  }
];
