import { Monster, ThingMap, Things } from "./Monster";
import { Thing } from "./Thing";
import { Direction } from "./Direction";
import { ThingAt } from "./Level";
import { Coords, ThingDescription } from "./LevelDescription";

const wallDescription: ThingDescription = {
  properties: ["wall"],
  sprite: "any",
};

const EMPTY: Things = { things: [] };
const WALL: Things = { things: [Thing.create(wallDescription)] };

const map: ThingMap = [
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
  [EMPTY, EMPTY, EMPTY],
];


const monsterCoords: Coords = { x: 1, y: 1 };


describe("moves in initial direction if empty ahead", () => {

  it.each<Direction>(Direction.getAllDirections())("%s", (direction) => {

    const monsterThing = createMonster(`anyType|${(direction.name.toLowerCase())}`)

    const monster = new Monster(
      monsterThing,
      monsterCoords,
      map
    );

    expect(monster.move()).toEqual<ThingAt>({
      thing: monsterThing,
      at: direction.move(monsterCoords)
    });
  });
});

function createMonster(label: string): Thing {
  return Thing.create({
    label: label,
    sprite: "any",
    text: undefined,
    properties: ["monster"]
  });
}
