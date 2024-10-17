import { SpellBook, SpellStatus } from "./SpellBook";
import { SpellRequirement, SpellRequirements, spellRequirementsBySpellId } from "../scenes/spells/spell-requirements";

const ALL_SPELL_IDS = [...spellRequirementsBySpellId.keys()];

let spellBook: SpellBook;

const testSpellId = "thisIsATestSpell";
const testSpellRequirements: SpellRequirements = {
  requirements: ["foo", "bar", "pop"].map(label => createTestSpellRequirement(label))
};

function createTestSpellRequirement(label: string): SpellRequirement {
  return {
    label: label,
    name: label,
    spriteLocation: { x: 0, y: 0 }
  };
}

beforeAll(() => {
  spellRequirementsBySpellId.set(testSpellId, testSpellRequirements);
});

beforeEach(() => {
  spellBook = new SpellBook();
});

describe("requirements", () => {

  it("spell requirement initially not present", () => {
    expect(spellBook.isRequirementForSpellPresent("someItem")).toBe(false);
  });

  it("spell requirement present when collected", () => {
    spellBook.collectRequirement("someItem");
    expect(spellBook.isRequirementForSpellPresent("someItem")).toBe(true);
  });

  it("all spell requirements are not present", () => {
    spellBook.collectRequirement(testSpellRequirements.requirements[0].label);
    expect(spellBook.getSpellStatus(testSpellId)).toEqual<SpellStatus>("COLLECTING_REQUIREMENTS");
  });

  it("all spell requirements are present", () => {

    testSpellRequirements
    .requirements
    .forEach(requirement =>
      spellBook
      .collectRequirement(requirement.label)
    );

    expect(spellBook.getSpellStatus(testSpellId)).toEqual<SpellStatus>("ALL_REQUIREMENTS_COLLECTED");
  });
});

describe("research", () => {

  it.each<string>(ALL_SPELL_IDS)("%s spell initially not researched", (spellId) => {
    expect(spellBook.getSpellStatus(spellId)).toEqual<SpellStatus>("COLLECTING_REQUIREMENTS");
  });

  it.each<string>(ALL_SPELL_IDS)("%s spell has been researched", (spellId) => {
    spellBook.spellResearched(spellId);
    expect(spellBook.getSpellStatus(spellId)).toEqual<SpellStatus>("RESEARCHED");
  });
});
