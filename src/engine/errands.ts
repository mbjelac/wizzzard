import { Errand } from "./Errand";
import { LevelFactory } from "./LevelFactory";

export const errands: Errand[] = [
  {
    description: {
      id: "empty",
      title: "Empty",
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
