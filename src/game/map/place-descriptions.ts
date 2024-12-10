import { Coords, locationsSame } from "../level/LevelDescription";

const mapPlaceDescriptions: [Coords[], string][] = [
  [[{ x: 14, y: 5 }], "Eva the herbalist's house"],
  [[{ x: 18, y: 6 }], "Druid's house"],
  [[{ x: 13, y: 7 }], "Town of Bolek"],
  [
    [
      { x: 7, y: 2 },
      { x: 8, y: 2 },
      { x: 9, y: 2 },
      { x: 10, y: 2 },
    ],
    "Mountains of Dread"
  ],
  [
    [
      { x: 16, y: 4 },
      { x: 17, y: 4 },
      { x: 16, y: 5 },
      { x: 17, y: 5 }
    ],
    "Dark Forest"
  ],
  [[{ x: 16, y: 7 },], "Misty Lake"],
  [[{ x: 13, y: 10 },], "Lyra's tower"],
  [[{ x: 11, y: 7 },], "Taas Bridge"],
  [[{ x: 12, y: 6 },], "Polok Ruins"],
];

export function getMapPlaceDescriptionAt(location: Coords): string | undefined {
  return mapPlaceDescriptions
  .map(
    mapPlaceDescription => {

      const hasLocation = mapPlaceDescription[0]
      .some(
        descriptionLocation => locationsSame(location, descriptionLocation)
      );

      if (hasLocation) {
        return mapPlaceDescription[1];
      } else {
        return undefined;
      }
    }
  )
  .filter(result => result !== undefined)
    [0];
}
