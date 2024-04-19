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
    matrix: [],
    completionCriteria: {
      inventory: ["someLabel"],
      receives: []
    },
    texts: {
    }
  },
  {
    description: {
      id: "woodenDog",
      title: "The wooden dog",
      description: "Wooden dog description..."
    },
    levelDimensions: { width: 40, height: 30 },
    startCoords: { x: 7, y: 7 },
    matrix: [],
    completionCriteria: {
      inventory: ["seed"],
      receives: []
    },
    texts: {}
  }
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

  if (fixedErrand.matrix.length === 0) {
    fixedErrand = {
      ...fixedErrand,
      matrix: populateEmptyLevelMatrix(fixedErrand.levelDimensions)
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
