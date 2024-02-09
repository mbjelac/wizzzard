import { ThingDescription } from "./Level";
import { createThingProps } from "./editor/LevelEditor";
import { EditorTool } from "./editor/EditorTool";
import { ErrandMatrix } from "./Errand";

export class LevelFactory {

  public fromMatrix(...rows: string[]): ErrandMatrix {
    return rows
      .map((row, rowIndex) =>
        [...row]
          .map((char, columnIndex) => {

              const thingProps = charToThingProps(
                char,
                () => {
                  throw Error(`Illegal character on row/col ${rowIndex}/${columnIndex}: ${char}`)
                }
              );

              return {
                things: [
                  createThingProps(EditorTool.FLOOR)!,
                  ...(thingProps ? [thingProps] : [])
                ]
              }
            }
          )
      );
  }
}

function charToThingProps(char: string, handleMissingCase: () => void): ThingDescription | undefined {
  switch (char) {
    case '#':
      return createThingProps(EditorTool.WALL);
    case ' ':
      return createThingProps(EditorTool.NONE);
    case '!':
      return createThingProps(EditorTool.FIRE);
    case '.':
      return createThingProps(EditorTool.KEY);
    default:
      handleMissingCase();
  }
}
