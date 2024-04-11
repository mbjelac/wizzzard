import { ErrandLocation, ErrandMatrix, LevelDimensions } from "./Errand";
import { populateEmptyLevelMatrix } from "./game";

describe("non-positive dimensions level produces empty matrix", () => {
  it.each<LevelDimensions>([
    { width: 0, height: 0 },
    { width: 0, height: 2 },
    { width: 4, height: 0 },
  ])("%o", (dimensions) => {
    expect(populateEmptyLevelMatrix(dimensions)).toEqual([]);
  });
});

it("1-1 dimensions produce matrix with one empty location", () => {
  expect(populateEmptyLevelMatrix({ width: 1, height: 1 })).toEqual<ErrandMatrix>(
    [
      [
        {
          things: []
        }
      ]
    ]
  );
});

it("x-y dimensions produce matrix with x rows with y columns each", () => {

  const matrix = populateEmptyLevelMatrix({ width: 7, height: 3 });

  const actual = {
    height: matrix.length,
    widths: matrix.map(row => row.length)
  }

  expect(actual).toEqual<typeof actual>({
    height: 3,
    widths: [7, 7, 7]
  });
});

it("x-y dimensions produce matrix with all elements empty location", () => {

  const matrix = populateEmptyLevelMatrix({ width: 2, height: 2 });

  const empty: ErrandLocation = { things: [] };

  expect(matrix).toEqual([
    [empty, empty],
    [empty, empty],
  ]);
});
