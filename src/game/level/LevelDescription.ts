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

export interface LevelMatrixElement {
  things: ThingDescription[]
}

export type LevelMatrix = LevelMatrixElement[][];

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
}

export interface LevelDescription {

  readonly metadata: LevelMetadata,
  readonly levelDimensions: LevelDimensions,
  readonly startCoords: Coords
  readonly completionCriteria: CompletionCriteria
  readonly texts: {[key: string]: TextContent}
  readonly initialAmbientSound?: string;
  readonly initialInventory?: ThingDescription[];
  readonly spells?: Spell[];
}

export interface TextContent {
  readonly text: string
  readonly head: string | undefined
}

export interface Spell {
  readonly id: string;
  readonly name: string;
  readonly charges: number;
}
