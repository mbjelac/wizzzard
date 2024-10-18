import { Coords } from "../level/LevelDescription";

export interface SpellRequirements {
  readonly requirements: SpellRequirement[];
}

export interface SpellRequirement {
  readonly name: string;
  readonly spriteLocation: Coords;
  readonly label: string;
}

export const spellRequirementsBySpellId = new Map<string, SpellRequirements>()
.set(
  "strength",
  {
    requirements: [
      { label: "speenAach", name: "Speen-Aach plant", spriteLocation: { x: 2, y: 29 } },
      { label: "splendidWater", name: "Vial of Splendid Water", spriteLocation: { x: 3, y: 19 } },
      { label: "lifeCrystal", name: "Crystal of Life", spriteLocation: { x: 0, y: 30 } },
      { label: "speenAachBook", name: "Speen-Aach growing manual", spriteLocation: { x: 1, y: 29 } },
    ]
  }
);
