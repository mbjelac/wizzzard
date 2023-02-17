import { Coords, Level, Location, Thing } from "./Level";

export class LevelFactory {
  private aWall(): Location {
    return { things: [new Thing(true, false, "wall")] };
  }

  private emptySpot(): Location {
    return { things: [] };
  }

  public random(width: number, height: number): Level {

    let start: Coords;

    const locations = Array(width).fill(0).map((_, y) =>
      Array(height).fill(0).map((_, x) => {
          if (Math.random() > 0.2) {
            if (Math.random() > 0.6 && !start) {
              start = { x: x, y: y };
              console.log("Start: " + JSON.stringify(start));
            }
            return this.emptySpot();
          } else {
            return this.aWall();
          }
        }
      )
    );

    return new Level(locations, start!);
  }

  public fromMatrix(...rows: string[]): Level {

    let start: Coords = { x: 0, y: 0 };

    const locations: Location[][] = rows
      .map((row, rowIndex) =>
        [...row]
          .map((char, columnIndex) => {
              switch (char) {
                case '#':
                  return this.aWall();
                case '@': {
                  start = { x: columnIndex, y: rowIndex };
                  return this.emptySpot();
                }
                case ' ':
                  return this.emptySpot();
                default:
                  throw Error(`Illegal character on row/col ${rowIndex}/${columnIndex}: ${char}`);
              }
            }
          )
      );

    return new Level(locations, start);
  }
}
