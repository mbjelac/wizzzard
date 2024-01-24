import { LevelMatrix, Location, Thing } from "./Level";

export class LevelFactory {
  private wall(): Location {
    return { things: [new Thing(true, false, "wall")] };
  }

  private empty(): Location {
    return { things: [] };
  }

  private fire(): Location {
    return { things: [new Thing(false, true, "fire")] };
  }

  public random(width: number, height: number): LevelMatrix {

    return Array(width).fill(0).map((_, _y) =>
      Array(height).fill(0).map((_, _x) => {
          if (Math.random() > 0.2) {
            return this.empty();
          } else {
            return this.wall();
          }
        }
      )
    );
  }

  public fromMatrix(...rows: string[]): LevelMatrix {
    return rows
      .map((row, rowIndex) =>
        [...row]
          .map((char, columnIndex) => {
              switch (char) {
                case '#':
                  return this.wall();
                case ' ':
                  return this.empty();
                case '!':
                  return this.fire();
                default:
                  throw Error(`Illegal character on row/col ${rowIndex}/${columnIndex}: ${char}`);
              }
            }
          )
      );
  }
}
