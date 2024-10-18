import { ThingProperty } from "./Thing";

export interface Coords {
  readonly x: number,
  readonly y: number
}

export function locationsSame(location: Coords, anotherLocation: Coords): boolean {
  return location.x === anotherLocation.x && location.y === anotherLocation.y;
}

export interface ThingDescription {
  readonly properties: ThingProperty[],
  readonly sprite: string,
  readonly label?: string,
  readonly text?: string,
}

export interface LevelLocation {

  things: ThingDescription[]
}

export type LevelMatrix = LevelLocation[][];

export interface CompletionCriteria {
  inventory: string[],
  receives: string[]
}

export interface LevelDimensions {
  readonly width: number,
  readonly height: number
}

export type LevelType = "errand" | "ritual";

export interface LevelMetadata {
  readonly id: string,
  readonly title: string,
  readonly description: string
  readonly type: LevelType;
  readonly usage?: string;
}

export interface LevelDescription {

  readonly metadata: LevelMetadata,
  readonly levelDimensions: LevelDimensions,
  readonly matrix: LevelMatrix,
  readonly startCoords: Coords
  readonly completionCriteria: CompletionCriteria
  readonly texts: {[key: string]: TextContent}
  readonly initialAmbientSound?: string;
}

export interface TextContent {
  text: string
}
