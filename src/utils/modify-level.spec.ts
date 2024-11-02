import { Coords, LevelDescription, LevelMatrixElement } from "../game/level/LevelDescription";


const emptyLevelLocation: LevelMatrixElement = { things: [] };


const level: LevelDescription = require("./level.json");

it("modify level", () => {

  /*
    21,29       38,29


    21,69       38,69
  */

  // padRight(1);
  // padBottom(22);

  paste({x: 25, y: 14});

  console.log(JSON.stringify(level));
});

function cropTop(amount: number) {
  level.matrix.splice(0, amount);
}

function cropBottom(amount: number) {
  level.matrix.splice(level.matrix.length - amount, amount);
}

function cropLeft(amount: number) {
  level.matrix.forEach(row => row.splice(0, amount));
}

function cropRight(amount: number) {
  level.matrix.forEach(row => row.splice(row.length - amount, amount));
}

function padTop(amount: number) {
  const rowWidth = level.matrix[0].length;
  const emptyRow = Array(rowWidth).fill(emptyLevelLocation);
  level.matrix.splice(0, 0, ...Array(amount).fill(emptyRow));
}

function padBottom(amount: number) {
  const rowWidth = level.matrix[0].length;
  const emptyRow = Array(rowWidth).fill(emptyLevelLocation);
  level.matrix.push(...Array(amount).fill(emptyRow));
}

function padRight(amount: number) {
  level.matrix.forEach(row => {
    row.push(...Array(amount).fill(emptyLevelLocation))
  });
}

function padLeft(amount: number) {
  level.matrix.forEach(row => row.splice(0, 0, ...Array(amount).fill(emptyLevelLocation)));
}

function paste(coordinates: Coords) {
  const fromClipboard: LevelDescription = require("./clipboard.json");

  const clipboardWidth = fromClipboard.matrix[0].length;
  const clipboardHeight = fromClipboard.matrix.length;

  console.log("pasting... size: ", clipboardWidth + "x" + clipboardHeight);

  for (let x = 0; x < clipboardWidth; x++)
    for (let y = 0; y < clipboardHeight; y++) {
      level.matrix[y + coordinates.y][x + coordinates.x] = fromClipboard.matrix[y][x];
    }
}
