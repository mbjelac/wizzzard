import { Coords, LevelMatrix } from "./Level";

export interface Errand {

  readonly description: ErrandDescription,
  readonly levelDimensions: LevelDimensions,
  readonly levelMatrix: LevelMatrix,
  readonly startCoords: Coords
}

export interface LevelDimensions {
  readonly width: number,
  readonly height: number
}
export interface ErrandDescription {
  readonly id: string,

  readonly title: string,
  readonly description: string
}
