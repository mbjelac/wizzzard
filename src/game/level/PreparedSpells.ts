import { Spell } from "./LevelDescription";

export class PreparedSpells {

  private selectedSpellId: string | undefined;

  constructor(private readonly spells: Spell[]) {
  }

  changeSelectedSpell() {

    if (this.spells.length === 0) {
      return;
    }

    const indexOfCurrentlySelectedSpell = this.spells.findIndex(spell => spell.id == this.selectedSpellId);

    if (indexOfCurrentlySelectedSpell === -1) {
      this.selectedSpellId = this.spells[0].id;
      return;
    }

    if(indexOfCurrentlySelectedSpell === this.spells.length - 1) {
      this.selectedSpellId = undefined;
      return;
    }

    this.selectedSpellId = this.spells[indexOfCurrentlySelectedSpell + 1].id;
  }

  getPreparedSpells(): PreparedSpell[] {
    return this.spells.map(spell => ({
      id: spell.id,
      name: spell.name,
      isSelected: spell.id == this.selectedSpellId,
      charges: spell.charges
    }));
  }

  getSelectedSpellId(): string | undefined {
    return this.selectedSpellId;
  }
}

export interface PreparedSpell {
  readonly id: string;
  readonly name: string;
  readonly charges: number;
  readonly isSelected: boolean;
}
