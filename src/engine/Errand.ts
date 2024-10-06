import { ThingProperty } from "./Thing";

export interface Coords {
  readonly x: number,
  readonly y: number
}

export interface ThingDescription {
  readonly properties: ThingProperty[],
  readonly sprite: string,
  readonly label?: string,
  readonly text?: string,
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

export interface Errand {

  readonly description: ErrandDescription,
  readonly levelDimensions: LevelDimensions,
  readonly matrix: ErrandMatrix,
  readonly startCoords: Coords
  readonly completionCriteria: CompletionCriteria
  readonly texts: {[key: string]: TextContent}
  readonly initialAmbientSound?: string;
}

export interface TextContent {
  text: string
}
