import { spellRequirementsBySpellId } from "./spell-requirements";
import { Inventory } from "../Inventory";

export type SpellStatus = "COLLECTING_REQUIREMENTS" | "ALL_REQUIREMENTS_COLLECTED" | "RESEARCHED";

export class SpellBook {

  constructor(
    private readonly items: Inventory,
    private readonly knownSpells: Inventory
  ) {
  }

  getSpellStatus(spellId: string): SpellStatus {

    if (this.knownSpells.has(spellId)) {
      return "RESEARCHED";
    }

    if (this.allRequirementsForSpellPresent(spellId)) {
      return "ALL_REQUIREMENTS_COLLECTED";
    }

    return "COLLECTING_REQUIREMENTS";
  }

  private allRequirementsForSpellPresent(spellId: string): boolean {
    return spellRequirementsBySpellId
      .get(spellId)
      ?.requirements
      .every(requirement => this.items.has(requirement.label))
      || false;
  }

  isRequirementForSpellPresent(requirementLabel: string): boolean {
    return this.items.has(requirementLabel);
  }

  collectRequirement(requirementLabel: string) {
    this.items.add(requirementLabel);
  }
}
