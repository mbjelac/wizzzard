import { Coords } from "./LevelDescription";

export interface Transmutation {
  readonly destroy: Transmuted[],
  readonly create: Transmuted[]
}

export interface Transmuted {
  readonly label: string,
  readonly at: Coords
}

export function parseTransmutation(instructions: string): Transmutation {

  if (instructions.length === 0) {
    return {
      destroy: [],
      create: []
    };
  }

  const [destroyInstructions, createInstructions] = instructions.split(":");

  return {
    destroy: parseInstructions(destroyInstructions),
    create: parseInstructions(createInstructions),
  };
}

function parseInstructions(instructions: string | undefined): Transmuted[] {
  if (instructions === undefined || instructions.length === 0){
    return [];
  }

  return instructions.split(",").map(transmuted => parseTransmuted(transmuted));
}

function parseTransmuted(transmuted: string): Transmuted {
  const [label, x, y] = transmuted.split("-");
  return {
    label,
    at: {
      x: Number.parseInt(x),
      y: Number.parseInt(y)
    }
  }
}
