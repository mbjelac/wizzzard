import { Spell } from "./LevelDescription";

export class PreparedSpells {

  private selectedSpellId: string | undefined;

  private readonly charges = new Map<string, number>();

  constructor(private readonly spells: Spell[]) {
    spells.forEach(spell => this.charges.set(spell.id, spell.charges));
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

    if (indexOfCurrentlySelectedSpell === this.spells.length - 1) {
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

  castSpell(spellId: string): boolean {

    if (this.selectedSpellId !== spellId) {
      return false;
    }

    const charges = this.charges.get(spellId);

    if (charges === undefined || charges === 0) {
      return false;
    }

    this.charges.set(spellId, charges - 1);

    return true;
  }

  getSpellCharges(): number[] {
    return this.spells.map(spell => this.charges.get(spell.id)!);
  }
}

export interface PreparedSpell {
  readonly id: string;
  readonly name: string;
  readonly charges: number;
  readonly isSelected: boolean;
}
