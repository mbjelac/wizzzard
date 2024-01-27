import { LevelEditor } from "./LevelEditor";
import { LevelLocation } from "../Level";

let editor: LevelEditor;

beforeEach(()=>{
  editor = new LevelEditor();
});

it("does not add same thing twice", () => {

  const location: LevelLocation = {
    things: []
  };

  editor.changeEditorTool();
  editor.applyEditorTool(location);
  const addResult = editor.applyEditorTool(location);

  expect(addResult.addedThing).toBe(undefined);
});

it("adds two different things", () => {

  const location: LevelLocation = {
    things: []
  };

  editor.changeEditorTool();
  editor.applyEditorTool(location);

  editor.changeEditorTool();
  const addResult = editor.applyEditorTool(location);

  expect(addResult.addedThing).not.toBe(undefined);
});
