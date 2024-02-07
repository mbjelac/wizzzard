import { allEditorTools, EditorTool } from "./EditorTool";
import { LevelLocation, Thing, ThingProps } from "../Level";

export interface AddResult {
  addedThing?: Thing
}

export class LevelEditor {

  private currentEditorTool: EditorTool = EditorTool.NONE;
  private editorToolIndex = 0;

  constructor() {
  }

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
    const props = createThingProps(this.currentEditorTool);
    return props ? new Thing(props) : undefined;
  }

  removeThing(location: LevelLocation, wall: Thing) {

    const index = location.things.findIndex(thing => thing.id === wall.id);

    if (index === -1) {
      throw Error(`Wall ${JSON.stringify(wall)}not found at location ${JSON.stringify(location)}.`);
    }

    location.things.splice(index, 1);
  }
}

export function createThingProps(editorTool: EditorTool): ThingProps | undefined {
  switch (editorTool) {
    case EditorTool.NONE:
      return undefined;
    case EditorTool.FLOOR:
      return Thing.defaultProps;
    case EditorTool.WALL:
      return { ...Thing.defaultProps, isWall: true, sprite: "wall" };
    case EditorTool.FIRE:
      return { ...Thing.defaultProps, isDeath: true, sprite: "fire" };
    case EditorTool.KEY:
      return { ...Thing.defaultProps, isPickup: true, sprite: "key" };
  }
}
