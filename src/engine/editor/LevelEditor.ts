import { allEditorTools, EditorTool } from "./EditorTool";
import { LevelLocation, Thing } from "../Level";

export interface AddResult {
  addedThing?: Thing
}
export class LevelEditor {

  private currentEditorTool: EditorTool = EditorTool.NONE;
  private editorToolIndex = 0;

  constructor() {}

  getCurrentEditorTool(): EditorTool {
    return this.currentEditorTool;
  }

  changeEditorTool() {
    this.editorToolIndex = (this.editorToolIndex + 1) % allEditorTools.length
    this.currentEditorTool = allEditorTools[this.editorToolIndex];
  }

  applyEditorTool(location: LevelLocation): AddResult {

    const thingToAdd = this.createThingToAdd();

    if (!thingToAdd) {
      return {
        addedThing: undefined
      };
    }

    location.things.push(thingToAdd);

    return {
      addedThing: thingToAdd
    };
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

  removeThing(location: LevelLocation, wall: Thing) {

    const index = location.things.findIndex(thing => thing.id === wall.id);

    if (index === -1) {
      throw Error(`Wall ${JSON.stringify(wall)}not found at location ${JSON.stringify(location)}.`);
    }

    location.things.splice(index, 1);
  }
}
