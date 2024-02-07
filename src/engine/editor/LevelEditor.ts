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

  private readonly emptyAddResult: AddResult = {
    addedThing: undefined
  };

  applyEditorTool(location: LevelLocation): AddResult {

    const thingToAdd = this.createThingToAdd();

    if (!thingToAdd) {
      return this.emptyAddResult;
    }

    if (location.things.find(thing => thing.equals(thingToAdd)) !== undefined) {
      return this.emptyAddResult;
    }

    location.things.push(thingToAdd);

    return {
      addedThing: thingToAdd
    };
  }

  private createThingToAdd(): Thing | undefined {
    return createThing(this.currentEditorTool);
  }

  removeThing(location: LevelLocation, wall: Thing) {

    const index = location.things.findIndex(thing => thing.id === wall.id);

    if (index === -1) {
      throw Error(`Wall ${JSON.stringify(wall)}not found at location ${JSON.stringify(location)}.`);
    }

    location.things.splice(index, 1);
  }
}

export function createThing(editorTool: EditorTool): Thing | undefined {
  switch (editorTool) {
    case EditorTool.NONE:
      return undefined;
    case EditorTool.FLOOR:
      return new Thing(Thing.defaultProps);
    case EditorTool.WALL:
      return new Thing({ ...Thing.defaultProps, isWall: true, sprite: "wall" });
    case EditorTool.FIRE:
      return new Thing({ ...Thing.defaultProps, isDeath: true, sprite: "fire" });
    case EditorTool.KEY:
      return new Thing({ ...Thing.defaultProps, isPickup: true, sprite: "key" });
  }
}
