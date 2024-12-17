import { LevelDescription, LevelMatrix, LevelMetadata } from "./LevelDescription";
import { populateEmptyLevelMatrix } from "../game";

const levels: LevelDescription[] = [
  {
    metadata: {
      id: "misplacedVial",
      title: "A misplaced vial",
      description: "I have misplaced a vial of Splendid Water somewhere in the storage room of my tower. I must find it to research my first spell!",
      type: "errand"
    },
    levelDimensions: { width: 11, height: 11 },
    startCoords: { x: 4, y: 7 },
    completionCriteria: {
      inventory: ["vial"],
      receives: []
    },
    texts: {
      stairsDown: {
        head: "lyra",
        text: "I don't need anything from my chambers."
      },
      stairsUp: {
        head: "lyra",
        text: "I don't need anything from the laboratory."
      },
      stuff1: {
        head: "lyra",
        text: "Old books and knick-knacks."
      },
      stuff2: {
        head: "lyra",
        text: "Knick-knacks and old books."
      },
      stuff3: {
        head: "lyra",
        text: "Jars of ... stuff?"
      }

    }
  },
  {
    metadata: {
      id: "woodenDog",
      title: "The wooden dog",
      description: "Eva the herbalist said you can pick up a magical Speen-Aach plant in the forest shed behind the house. Don't mind Eva's daughter Kim, playing in the garden.",
      type: "errand"
    },
    levelDimensions: { width: 40, height: 30 },
    startCoords: { x: 6, y: 9 },
    completionCriteria: {
      inventory: ["speenAach"],
      receives: []
    },
    texts: {
      houseDoor: {
        head: "lyra",
        text: "I'm not leaving yet!"
      },
      kimPre: {
        head: "kim",
        text: "Please help me find my toy dog! I lost it in the Dark Forest, beyond the pumpkin patch, and I'm scared to go."
      },
      kimOn: {
        head: "kim",
        text: "Thank you so much! As a reward, here is a shiny thing I found in the grass. I wonder what does it open?"
      },
      kimPost: {
        head: "kim",
        text: "Thank you again for finding my dog!"
      },
      thingsUnderThings: {
        head: "stoneCarving",
        text: "Sometimes things are hidden under other things"
      },
    },
    initialAmbientSound: "summerMeadow",

  },
  {
    metadata: {
      id: "forgetfulDruid",
      title: "The Forgetful Druid",
      description: "description...",
      type: "errand"
    },
    levelDimensions: { width: 43, height: 55 },
    startCoords: { x: 24, y: 48 },
    initialAmbientSound: "forest",
    completionCriteria: {
      inventory: ["speenAachBook"],
      receives: []
    },
    texts: {
      notLeavingYet: {
        head: "lyra",
        text: "I will leave the forest when I recover the druid's book."
      },
      druidPillarText1: {
        head: "stoneCarving",
        text: "Secret passages ..."
      },
      druidPillarText2: {
        head: "stoneCarving",
        text: "... may be ..."
      },
      druidPillarText3: {
        head: "stoneCarving",
        text: "... hidden well ..."
      },
      druidPillarText4: {
        head: "stoneCarving",
        text: "... in forest bushes."
      },
      emeraldKeyHidden: {
        head: "book",
        text: "Wednesday\n\nI have hidden the key to the library well. But I no longer remember where..."
      },
      basementShelves: {
        head: "lyra",
        text: "Nothing of interest."
      },
      monsterNote: {
        head: "book",
        text: "Monsters will eat you. Good thing some are very dumb."
      },
      shelves8: {
        head: "lyra",
        text: "Various concoctions."
      },
      shelves7: {
        head: "lyra",
        text: "Druidic mumbo-jumbo."
      },
      shelves6: {
        head: "lyra",
        text: "My shelves have more interesting stuff."
      },
      shelves5: {
        head: "lyra",
        text: "Smelly."
      },
      shelves4: {
        head: "lyra",
        text: "Druidic mumbo-jumbo."
      },
      shelves1: {
        head: "lyra",
        text: "Boring druid stuff."
      },
      shelves3: {
        head: "book",
        text: "The Affairs of the Planets"
      },
      shelves2: {
        head: "book",
        text: "The Moon is a Harsh Mistress"
      }
    }
  },
  {
    metadata: {
      id: "void",
      title: "A void",
      description: "An empty black void, suitable for trying out the level editor.",
      type: "errand"
    },
    levelDimensions: { width: 10, height: 10 },
    startCoords: { x: 5, y: 5 },
    completionCriteria: {
      inventory: ["someLabel"],
      receives: []
    },
    texts: {},
    spells: [
      {
        id: "strength",
        name: "Strength",
        charges: 10
      },
      {
        id: "waterbreathing",
        name: "Waterbreathing",
        charges: 3
      },
      {
        id: "jump",
        name: "Jump",
        charges: 6
      },
    ]
  },
  {
    metadata: {
      id: "strength",
      title: "Strength",
      description: "You feel you can push heavy stone blocks. It doesn't look like the feeling lasts long.",
      type: "ritual"
    },
    initialAmbientSound: "laboratory",
    levelDimensions: { width: 11, height: 11 },
    texts: {
      stairsDown: {
        head: "lyra",
        text: "I don't need anything from downstairs."
      },
      bzzt: {
        head: "lyra",
        text: "Bzzt, bzzt"
      },
      alchemy: {
        head: "lyra",
        text: "Oooh, bubbles!"
      },
      jars: {
        head: "lyra",
        text: "Various specimens and a jar of apple jam ... but which one is it?"
      },
      incantations: {
        head: "lyra",
        text: "Vacuus primae! Baridio phenophera! Zuuuul!"
      },
      infoPlant: {
        head: "book",
        text: "Plants are combined with Earth"
      },
      infoCrystal: {
        head: "book",
        text: "Crystals are used for Flow"
      },
      infoWater: {
        head: "book",
        text: "Water brings clarity of Vision"
      }
    },
    completionCriteria: {
      inventory: ["strength"],
      receives: []
    },
    startCoords: { x: 4, y: 3 },
    initialInventory: [
      {
        sprite: "0-30",
        properties: [
          "pickup"
        ],
        label: "crystal"
      },
      {
        sprite: "2-29",
        properties: [
          "pickup"
        ],
        label: "plant"
      },
      {
        sprite: "3-19",
        properties: [
          "pickup"
        ],
        label: "vial"
      }
    ],
  },
  {
    metadata: {
      id: "waterbreathing",
      title: "Waterbreathing",
      description: "You can breathe under water. This means you can explore what's down there!",
      type: "ritual"
    },
    levelDimensions: { width: 11, height: 11 },
    texts: {},
    completionCriteria: {
      inventory: [],
      receives: []
    },
    startCoords: { x: 4, y: 3 },
  },
  {
    metadata: {
      id: "forestLake",
      title: "A swim in the lake",
      description: "There is a rumour that a Life Crystal can be found on a tiny island in the middle of Misty Lake in Dark Forest. However, I can't swim...",
      type: "errand"
    },
    levelDimensions: { width: 29, height: 42 },
    texts: {
      "notLeavingYet": {
        "head": "lyra",
        "text": "The Crystal is in there, not out here!"
      },
      "logsAdvice": {
        "head": "stoneCarving",
        "text": "Logs float on water."
      }
    },
    completionCriteria: {
      inventory: ["lifeCrystal"],
      receives: []
    },
    startCoords: {
      x: 7,
      y: 35
    },
    initialAmbientSound: "summerMeadow",
  },

  {
    metadata: {
      id: "brokenBridge",
      title: "The Broken Bridge",
      description: "The Taas bridge crossing the river Bo has collapsed in a storm several months ago. The townsfolk of Bolek asked me to try and get to the other side of the river and let Ewyn the bridge-builder know that they need her help.",
      type: "errand"
    },
    levelDimensions: { width: 35, height: 35 },
    startCoords: { x: 28, y: 17 },
    completionCriteria: {
      inventory: [],
      receives: ["meetWithEwyn"]
    },
    texts: {
      notLeaving: {
        head: "lyra",
        text: "I'm not going back to Bolek until I reach Ewyn!\n\nWaterbreathing\n13\nStrength"
      }
    }
  },
];

export function getLevelDescription(id: string): LevelDescription {
  const description = levels.find(description => description.metadata.id === id);
  if (description === undefined) {
    throw Error(`Level '${id}' description not found!`);
  }
  return description;
}

export function getLevelMatrix(levelDescription: LevelDescription): LevelMatrix {
  const levelMatrixFromStorage = getLevelMatrixFromLocalStorage(levelDescription.metadata.id);

  return levelMatrixFromStorage || populateEmptyLevelMatrix(levelDescription.levelDimensions);
}

function getLevelMatrixFromLocalStorage(levelId: string): LevelMatrix | undefined {

  const levelString = localStorage.getItem(levelId);

  if (levelString === null) {
    console.error(`Level "${levelId}" not found in local storage!`);
    return undefined;
  }

  try {
    return JSON.parse(levelString);
  } catch (e) {
    console.error("Level exists in local storage but failed to parse it: ", e, levelString);
    return undefined;
  }
}

export function storeLevel(levelId: string, matrix: LevelMatrix) {
  localStorage.setItem(levelId, JSON.stringify(matrix));
}

export function getLevelMetadata(): LevelMetadata[] {
  return levels.map(level => level.metadata);
}
