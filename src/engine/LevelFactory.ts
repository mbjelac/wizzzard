import { LevelMatrix, Thing } from "./Level";
import { createThing, LevelEditor } from "./editor/LevelEditor";
import { EditorTool } from "./editor/EditorTool";

export class LevelFactory {

  public fromMatrix(...rows: string[]): LevelMatrix {
    return rows
      .map((row, rowIndex) =>
        [...row]
          .map((char, columnIndex) => {

              const thing = charToThing(
                char,
                () => {
                  throw Error(`Illegal character on row/col ${rowIndex}/${columnIndex}: ${char}`)
                }
              );

              return {
                things: thing ? [thing] : []
              }
            }
          )
      );
  }
}

function charToThing(char: string, handleMissingCase: () => void): Thing | undefined {
  switch (char) {
    case '#':
      return createThing(EditorTool.WALL);
    case ' ':
      return createThing(EditorTool.NONE);
    case '!':
      return createThing(EditorTool.FIRE);
    case '.':
      return createThing(EditorTool.KEY);
    default:
      handleMissingCase();
  }
}
