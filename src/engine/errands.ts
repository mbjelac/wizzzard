import { Errand, ErrandDescription } from "./Errand";
import { populateEmptyLevelMatrix } from "./game";

const errands: Errand[] = [
  {
    description: {
      id: "void",
      title: "A void",
      description: "An empty black void, suitable for trying out the level editor."
    },
    levelDimensions: { width: 10, height: 10 },
    startCoords: { x: 5, y: 5 },
    levelMatrix: []
  },
  {
    description: {
      id: "emptyRoom",
      title: "Empty Room",
      description: "An empty room"
    },
    levelDimensions: { width: 3, height: 3 },
    levelMatrix: [],
    startCoords: { x: 1, y: 1 },
  },
  {
    description: {
      id: "ringOfFire",
      title: "Ring of fire",
      description: "A ring of fire is conjured around you. What do you do?"
    },
    levelDimensions: { width: 7, height: 7 },
    levelMatrix: [],
    startCoords: { x: 3, y: 3 },
  },
  {
    description: {
      id: "dungeon",
      title: "A dungeon",
      description: "Another dungeon. Boring."
    },
    levelDimensions: { width: 12, height: 9 },
    levelMatrix: [],
    startCoords: { x: 1, y: 3 },
  },
];

export async function getErrand(errandId: string): Promise<Errand> {
  const errandFromStorage = getErrandFromLocalStorage(errandId);

  if (errandFromStorage !== undefined) {
    return Promise.resolve(errandFromStorage);
  }

  const errandFromCode = errands.find(errand => errand.description.id === errandId);

  if (errandFromCode === undefined) {
    return Promise.reject(`Errand not found for id: ${errandId}`);
  }

  let fixedErrand = errandFromCode;

  if (fixedErrand.levelMatrix.length === 0) {
    fixedErrand = {
      ...fixedErrand,
      levelMatrix: populateEmptyLevelMatrix(fixedErrand.levelDimensions)
    }
  }

  await setErrand(fixedErrand);

  return Promise.resolve(fixedErrand);
}

function getErrandFromLocalStorage(errandId: string): Errand | undefined {

  const errandString = localStorage.getItem(errandId);

  if (errandString === null) {
    console.error(`Errand "${errandId}" not found in local storage!`);
    return undefined;
  }

  try {
    return JSON.parse(errandString);
  } catch (e) {
    console.error("Level exists in local storage but failed to parse it: ", e, errandString);
    return undefined;
  }
}

export async function setErrand(errand: Errand) {
  localStorage.setItem(errand.description.id, JSON.stringify(errand));
}

export async function getErrandDescriptions(): Promise<ErrandDescription[]> {
  return Promise.resolve(errands.map(errand => errand.description));
}
