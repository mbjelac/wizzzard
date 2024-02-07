import { LevelMatrix, LevelLocation, Thing } from "./Level";

export class LevelFactory {
  private wall(): LevelLocation {
    return { things: [new Thing({ ...Thing.defaultProps, isWall: true, sprite: "wall" })] };
  }

  private empty(): LevelLocation {
    return { things: [] };
  }

  private fire(): LevelLocation {
    return { things: [new Thing({ ...Thing.defaultProps, isDeath: true, sprite: "fire" })] };
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
