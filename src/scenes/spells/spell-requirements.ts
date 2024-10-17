import { Coords } from "../../engine/LevelDescription";

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
      { label: "speenAach", name: "Speen-Aach plant", spriteLocation: { x: 0, y: 0 } },
      { label: "splendidWater", name: "Vial of Splendid Water", spriteLocation: { x: 0, y: 0 } },
      { label: "lifeCrystal", name: "Crystal of Life", spriteLocation: { x: 0, y: 0 } },
      { label: "speenAachBook", name: "'How to grow your Speen-Aach plant' by Ebeneezer Croodfish", spriteLocation: { x: 0, y: 0 } },
    ]
  }
);
