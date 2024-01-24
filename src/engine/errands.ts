import { Errand, ErrandDescription } from "./Errand";

const errands: Errand[] = [
  {
    description: {
      id: "void",
      title: "A void",
      description: "An empty black void, suitable for trying out the level editor."
    },
    levelMatrix: ["@"]
  },
  {
    description: {
      id: "emptyRoom",
      title: "Empty Room",
      description: "An empty room"
    },
    levelMatrix: [
      "   ",
      " @ ",
      "   ",
    ]
  },
  {
    description: {
      id: "ringOfFire",
      title: "Ring of fire",
      description: "A ring of fire is conjured around you. What do you do?"
    },
    levelMatrix: [
      "       ",
      "  !!!  ",
      " !   ! ",
      " ! @ ! ",
      " !   ! ",
      "  !!!  ",
      "       ",
    ]
  },
  {
    description: {
      id: "dungeon",
      title: "A dungeon",
      description: "Another dungeon. Boring."
    },
    levelMatrix: [
      "############",
      "#     ##   #",
      "### ##### ##",
      "@      #   #",
      "### ## # # #",
      "##   # # # #",
      "## ! # # # #",
      "##   #     #",
      "############",
    ]
  },
];

export async function getErrand(errandId: string): Promise<Errand> {
  const errand = errands.find(errand => errand.description.id === errandId);

  return errand === undefined
    ? Promise.reject(`Errand not found for id: ${errandId}`)
    : Promise.resolve(errand);
}

export async function getErrandDescriptions(): Promise<ErrandDescription[]> {
  return Promise.resolve(errands.map(errand => errand.description));
}
