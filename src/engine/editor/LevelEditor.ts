import { allEditorTools, EditorTool } from "./EditorTool";
import { Location, Thing } from "../Level";

export class LevelEditor {

  private currentEditorTool: EditorTool = EditorTool.NONE;
  private editorToolIndex = 0;

  getCurrentEditorTool(): EditorTool {
    return this.currentEditorTool;
  }

  changeEditorTool() {
    this.editorToolIndex = (this.editorToolIndex + 1) % allEditorTools.length
    this.currentEditorTool = allEditorTools[this.editorToolIndex];
  }

  applyEditorTool(location: Location): Thing | undefined {

    const thingToAdd = this.createThingToAdd();

    if (!thingToAdd) {
      return undefined;
    }

    location.things.push(thingToAdd);
    return thingToAdd;
  }

  private createThingToAdd(): Thing | undefined {
    switch (this.currentEditorTool) {
      case EditorTool.NONE:
        return undefined;
      case EditorTool.WALL:
        return new Thing(true, false, "wall");
      case EditorTool.FIRE:
        return new Thing(false, true, "fire");
    }
  }

  removeThing(location: Location, wall: Thing) {

    const index = location.things.findIndex(thing => thing.id === wall.id);

    if (index === -1) {
      throw Error(`Wall ${JSON.stringify(wall)}not found at location ${JSON.stringify(location)}.`);
    }

    location.things.splice(index, 1);
  }
}
