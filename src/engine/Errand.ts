import { Coords, ThingDescription } from "./Level";

export interface Errand {

  readonly description: ErrandDescription,
  readonly levelDimensions: LevelDimensions,
  readonly matrix: ErrandMatrix,
  readonly startCoords: Coords
  readonly completionCriteria: CompletionCriteria
}

export interface ErrandLocation {

  things: ThingDescription[]
}

export type ErrandMatrix = ErrandLocation[][];

export interface CompletionCriteria {
  inventory: string[],
  receives: string[]
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
