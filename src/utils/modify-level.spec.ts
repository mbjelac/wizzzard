import { LevelDescription } from "../game/level/LevelDescription";


const levelDescriptionString = "";

it("modify level", () => {

  const level: LevelDescription = JSON.parse(levelDescriptionString);

  level.matrix.splice(0, 28);

  level.matrix.forEach(row => row.splice(27, 43));

  console.log(JSON.stringify(level));

});
