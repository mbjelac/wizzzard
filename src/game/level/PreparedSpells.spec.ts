import { PreparedSpells } from "./PreparedSpells";

let spells: PreparedSpells;

beforeEach(() => {

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

it("no spells selected when changing selection on empty spells", () => {

  const emptySpells = new PreparedSpells([]);

  emptySpells.changeSelectedSpell();

  expect(emptySpells.getPreparedSpells()).toEqual([]);
});

it("can not cast spell if not selected", () => {

  const spells = new PreparedSpells([
    { id: "a", name: "A", charges: 1 },
    { id: "b", name: "B", charges: 1 },
  ]);

  spells.changeSelectedSpell();

  expect(spells.castSpell("b")).toBe(false);
});

it("can cast spell if selected", () => {

  const spells = new PreparedSpells([
    { id: "a", name: "A", charges: 1 },
    { id: "b", name: "B", charges: 1 },
  ]);

  spells.changeSelectedSpell();
  spells.changeSelectedSpell();

  expect(spells.castSpell("b")).toBe(true);
});

it("can not cast spell if charges spent", () => {

  const spells = new PreparedSpells([{ id: "a", name: "A", charges: 2 }]);

  spells.changeSelectedSpell();

  expect([
    spells.castSpell("a"),
    spells.castSpell("a"),
    spells.castSpell("a"),
    spells.castSpell("a"),
  ]).toEqual([
    true,
    true,
    false,
    false
  ]);
});

it("casting spends charges for that spell only", () => {

  const spells = new PreparedSpells([
    { id: "a", name: "A", charges: 2 },
    { id: "b", name: "B", charges: 2 },
  ]);

  spells.changeSelectedSpell();
  const cast1 =spells.castSpell("a");
  const cast2 =spells.castSpell("a");

  spells.changeSelectedSpell();
  const cast3 =spells.castSpell("b");
  const cast4 =spells.castSpell("b");

  spells.changeSelectedSpell();
  spells.changeSelectedSpell();
  const cast5 =spells.castSpell("a");

  expect([
    cast1,
    cast2,
    cast3,
    cast4,
    cast5,
  ]).toEqual([
    true,
    true,
    true,
    true,
    false
  ]);
});
