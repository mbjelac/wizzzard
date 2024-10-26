import { LevelDescription, LevelLocation } from "../game/level/LevelDescription";


const levelDescriptionString = "";


const emptyLevelLocation: LevelLocation = { things: [] };


it("modify level", () => {

  const level: LevelDescription = JSON.parse(levelDescriptionString);

  // crop top
  // level.matrix.splice(0, 28);

  // crop right
  // level.matrix.forEach(row => row.splice(27, 43));

  // insert tiles left
  // level.matrix.forEach(row => row.splice(0, 0, emptyLevelLocation));

  // insert tiles right
  level.matrix.forEach(row => row.push(emptyLevelLocation));

  console.log(JSON.stringify(level));

});
