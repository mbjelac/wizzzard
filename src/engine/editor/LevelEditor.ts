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

  applyEditorTool(location: LevelLocation, label?: string): AddResult {

    const thingToAdd = this.createThingToAdd(label);

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

  private createThingToAdd(label?: string): Thing | undefined {
    const props = createThingProps(this.currentEditorTool, label);
    return props ? new Thing(props) : undefined;
  }

  removeThing(location: LevelLocation, wall: Thing) {

    const index = location.things.findIndex(thing => thing.id === wall.id);

    if (index === -1) {
      throw Error(`Wall ${JSON.stringify(wall)}not found at location ${JSON.stringify(location)}.`);
    }

    location.things.splice(index, 1);
  }

  isLabelRequired(): boolean {
    return [
      EditorTool.RECEIVE,
      EditorTool.KEY_GREEN
    ].some(tool => tool === this.currentEditorTool);
  }
}

export function createThingProps(editorTool: EditorTool, label?: string): ThingProps | undefined {
  switch (editorTool) {
    case EditorTool.NONE:
      return undefined;
    case EditorTool.FLOOR:
      return Thing.defaultProps;
    case EditorTool.WALL:
      return { ...Thing.defaultProps, functions: ["wall"], sprite: "wall" };
    case EditorTool.FIRE:
      return { ...Thing.defaultProps, functions: ["death"], sprite: "fire" };
    case EditorTool.KEY:
      return { ...Thing.defaultProps, functions: ["pickup"], sprite: "key" };
    case EditorTool.KEY_GREEN:
      return { ...Thing.defaultProps, functions: ["pickup"], label: label, sprite: "key_green" };
    case EditorTool.RECEIVE:
      return { ...Thing.defaultProps, functions: ["wall", "receiver"], label: label, sprite: "lock" };
  }
}
