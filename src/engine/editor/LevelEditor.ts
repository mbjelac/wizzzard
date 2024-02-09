import { allEditorTools, EditorTool } from "./EditorTool";
import { LevelLocation, Thing, ThingDescription } from "../Level";

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
      EditorTool.RECEIVER,
      EditorTool.KEY_GREEN
    ].some(tool => tool === this.currentEditorTool);
  }
}

export function createThingProps(editorTool: EditorTool, label?: string): ThingDescription | undefined {
  switch (editorTool) {
    case EditorTool.NONE:
      return undefined;
    case EditorTool.FLOOR:
      return Thing.defaultThingDescription;
    case EditorTool.WALL:
      return { ...Thing.defaultThingDescription, properties: ["wall"], sprite: "wall" };
    case EditorTool.FIRE:
      return { ...Thing.defaultThingDescription, properties: ["death"], sprite: "fire" };
    case EditorTool.KEY:
      return { ...Thing.defaultThingDescription, properties: ["pickup"], sprite: "key" };
    case EditorTool.KEY_GREEN:
      return { ...Thing.defaultThingDescription, properties: ["pickup"], label: label, sprite: "key_green" };
    case EditorTool.RECEIVER:
      return { ...Thing.defaultThingDescription, properties: ["wall", "receiver"], label: label, sprite: "lock" };
  }
}
