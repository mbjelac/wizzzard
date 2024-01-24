import { Errand, ErrandDescription } from "./Errand";

const errands: Errand[] = [
  {
    description: {
      id: "void",
      title: "A void",
      description: "An empty black void, suitable for trying out the level editor."
    },
    levelDimensions: { width: 10, height: 10 },
    startCoords: { x: 5, y: 5},
    levelMatrix: []
  },
  {
    description: {
      id: "emptyRoom",
      title: "Empty Room",
      description: "An empty room"
    },
    levelDimensions: { width: 3, height: 3 },
    levelMatrix: [
      "   ",
      "   ",
      "   ",
    ],
    startCoords: { x: 1, y: 1},
  },
  {
    description: {
      id: "ringOfFire",
      title: "Ring of fire",
      description: "A ring of fire is conjured around you. What do you do?"
    },
    levelDimensions: { width: 7, height: 7 },
    levelMatrix: [
      "       ",
      "  !!!  ",
      " !   ! ",
      " !   ! ",
      " !   ! ",
      "  !!!  ",
      "       ",
    ],
    startCoords: { x: 3, y: 3},
  },
  {
    description: {
      id: "dungeon",
      title: "A dungeon",
      description: "Another dungeon. Boring."
    },
    levelDimensions: { width: 12, height: 9 },
    levelMatrix: [
      "############",
      "#     ##   #",
      "### ##### ##",
      "       #   #",
      "### ## # # #",
      "##   # # # #",
      "## ! # # # #",
      "##   #     #",
      "############",
    ],
    startCoords: { x: 0, y: 3},
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
