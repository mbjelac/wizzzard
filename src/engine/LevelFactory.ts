import { Thing } from "./Level";
import { EditorTool } from "./editor/EditorTool";
import { ErrandMatrix, ThingDescription } from "./Errand";

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

export function createThingProps(editorTool: EditorTool, label?: string): ThingDescription | undefined {
  switch (editorTool) {
    case EditorTool.NONE:
      return undefined;
    case EditorTool.FLOOR:
      return Thing.defaultThingDescription;
    case EditorTool.WALL:
      return { ...Thing.defaultThingDescription, properties: ["wall"], label: label, sprite: "wall" };
    case EditorTool.FIRE:
      return { ...Thing.defaultThingDescription, properties: ["death"], label: label, sprite: "fire" };
    case EditorTool.KEY:
      return { ...Thing.defaultThingDescription, properties: ["pickup"], label: label, sprite: "key" };
    case EditorTool.KEY_GREEN:
      return { ...Thing.defaultThingDescription, properties: ["pickup"], label: label, sprite: "key_green" };
    case EditorTool.RECEIVER:
      return { ...Thing.defaultThingDescription, properties: ["wall", "receiver"], label: label, sprite: "lock" };
  }
}
