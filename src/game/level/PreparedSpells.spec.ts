import { PreparedSpell, PreparedSpells } from "./PreparedSpells";

let spells: PreparedSpells;

beforeEach(()=> {

  spells = new PreparedSpells([
    { id: "a", name: "A", charges: 1 },
    { id: "b", name: "B", charges: 2 },
    { id: "c", name: "C", charges: 3 },
  ]);

});

it("initially no spells are selected", () => {
expect(
    spells
    .getPreparedSpells()
    .map(spell => spell.isSelected))
  .toEqual(
    [
      false,
      false,
      false
    ]
  );
});

it("changing selection selects first spell", () => {

  spells.changeSelectedSpell();

  expect(
    spells
    .getPreparedSpells()
    .map(spell => spell.isSelected))
  .toEqual(
    [
      true,
      false,
      false
    ]
  );
});

it("changing selection twice selects second spell", () => {

  spells.changeSelectedSpell();
  spells.changeSelectedSpell();

  expect(
    spells
    .getPreparedSpells()
    .map(spell => spell.isSelected))
  .toEqual(
    [
      false,
      true,
      false
    ]
  );
});

it("no spells selected when changing selection once over the number of spells", () => {

  spells.changeSelectedSpell();
  spells.changeSelectedSpell();
  spells.changeSelectedSpell();
  spells.changeSelectedSpell();

  expect(
    spells
    .getPreparedSpells()
    .map(spell => spell.isSelected))
  .toEqual(
    [
      false,
      false,
      false
    ]
  );
});

it("no spells selected when changing selection on empty spells", ()=> {

  const emptySpells = new PreparedSpells([]);

  emptySpells.changeSelectedSpell();

  expect(emptySpells.getPreparedSpells()).toEqual([]);
});
