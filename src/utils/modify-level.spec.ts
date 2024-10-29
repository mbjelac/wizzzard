import { LevelDescription, LevelLocation } from "../game/level/LevelDescription";


const emptyLevelLocation: LevelLocation = { things: [] };


it("modify level", () => {

  const level: LevelDescription = require("./level.json");

  // crop top
  // level.matrix.splice(0, 28);

  // crop bottom
  level.matrix.splice(32, 37);

  // crop right
  // level.matrix.forEach(row => row.splice(27, 43));

  // crop left
  level.matrix.forEach(row => row.splice(0, 38));

  // insert tiles left
  // level.matrix.forEach(row => row.splice(0, 0, emptyLevelLocation));

  // insert tiles right
  // level.matrix.forEach(row => row.push(emptyLevelLocation));

  console.log(JSON.stringify(level));

});
