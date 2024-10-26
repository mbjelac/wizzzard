import { LevelDescription, LevelMetadata } from "./LevelDescription";
import { populateEmptyLevelMatrix } from "../game";

const levels: LevelDescription[] = [
  {
    metadata: {
      id: "woodenDog",
      title: "The wooden dog",
      description: "Wooden dog description...",
      type: "errand"
    },
    levelDimensions: { width: 40, height: 30 },
    startCoords: { x: 7, y: 7 },
    matrix: [],
    completionCriteria: {
      inventory: ["seed"],
      receives: []
    },
    texts: {}
  },
  {
    metadata: {
      id: "forgetfulDruid",
      title: "The Forgetful Druid",
      description: "description...",
      type: "errand"
    },
    levelDimensions: { width: 70, height: 70 },
    startCoords: { x: 7, y: 7 },
    matrix: [],
    completionCriteria: {
      inventory: ["vial", "jar", "book"],
      receives: []
    },
    texts: {}
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
    matrix: [],
    completionCriteria: {
      inventory: ["someLabel"],
      receives: []
    },
    texts: {}
  },
  {
    metadata: {
      id: "strength",
      title: "Strength",
      description: "You feel you can push heavy stone blocks. It doesn't look like the feeling lasts long.",
      type: "ritual"
    },
    levelDimensions: { width: 11, height: 11 },
    texts: {},
    completionCriteria: {
      inventory: ["vialOfStrength"],
      receives: []
    },
    matrix: [],
    startCoords: { x: 0, y: 0 }
  },
  {
    metadata: {
      id: "waterbreathing",
      title: "Waterbreathing",
      description: "You can breathe under water. This means you can not drown.\n\nThere is much to explore under water, but beware of the spell duration!",
      type: "ritual"
    },
    levelDimensions: { width: 11, height: 11 },
    texts: {},
    completionCriteria: {
      inventory: ["vialOfStrength"],
      receives: []
    },
    matrix: [],
    startCoords: { x: 0, y: 0 }
  },
  {
    metadata: {
      id: "forestLake",
      title: "A swim in the lake",
      description: "There is a rumour that a Life Crystal can be found on a tiny island in the middle of Misty Lake in Dark Forest. However, I don't swim...",
      type: "errand"
    },
    levelDimensions: { width: 27, height: 42 },
    texts: {},
    completionCriteria: {
      inventory: ["lifeCrystal"],
      receives: []
    },
    matrix: [],
    startCoords: { x: 0, y: 0 }
  }
];

export async function getLevelDescription(levelId: string): Promise<LevelDescription> {
  const levelFromStorage = getLevelFromLocalStorage(levelId);

  if (levelFromStorage !== undefined) {
    return Promise.resolve(levelFromStorage);
  }

  const levelFromCode = levels.find(level => level.metadata.id === levelId);

  if (levelFromCode === undefined) {
    return Promise.reject(`Level not found for id: ${levelId}`);
  }

  let levelWithFilledMap = levelFromCode;

  if (levelWithFilledMap.matrix.length === 0) {
    levelWithFilledMap = {
      ...levelWithFilledMap,
      matrix: populateEmptyLevelMatrix(levelWithFilledMap.levelDimensions)
    }
  }

  await storeLevel(levelWithFilledMap);

  return Promise.resolve(levelWithFilledMap);
}

function getLevelFromLocalStorage(levelId: string): LevelDescription | undefined {

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

export async function storeLevel(level: LevelDescription) {
  localStorage.setItem(level.metadata.id, JSON.stringify(level));
}

export async function getLevelMetadata(): Promise<LevelMetadata[]> {
  return Promise.resolve(levels.map(level => level.metadata));
}
