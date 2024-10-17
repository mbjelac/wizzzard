import { spellRequirementsBySpellId } from "../scenes/spells/spell-requirements";

export type SpellStatus = "COLLECTING_REQUIREMENTS" | "ALL_REQUIREMENTS_COLLECTED" | "RESEARCHED";

export class SpellBook {

  private readonly inventory = new Set<string>();
  private readonly researchedSpells = new Set<string>();

  getSpellStatus(spellId: string): SpellStatus {

    if(this.researchedSpells.has(spellId)) {
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
      .every(requirement => this.inventory.has(requirement.label))
      || false;
  }

  isRequirementForSpellPresent(requirementLabel: string): boolean {
    return this.inventory.has(requirementLabel);
  }

  spellResearched(spellId: string) {
    this.researchedSpells.add(spellId);
  }

  collectRequirement(requirementLabel: string) {
    this.inventory.add(requirementLabel);
  }
}
