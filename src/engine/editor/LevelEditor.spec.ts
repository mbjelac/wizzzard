import { LevelEditor } from "./LevelEditor";
import { LevelLocation } from "../Level";
import { ThingDescription } from "../Errand";

let editor: LevelEditor;

beforeEach(() => {
  editor = new LevelEditor();
});

it("does not add same thing twice", () => {

  const location: LevelLocation = {
    coords: { x: 0, y: 0 },
    things: []
  };


  const description: ThingDescription = {
    properties: ["death"],
    label: "foo",
    sprite: "bar"
  }

  editor.addThing(location, description);
  const addResult = editor.addThing(location, description);

  expect(addResult.addedThing).toBe(undefined);
});

it("adds two different things", () => {

  const location: LevelLocation = {
    coords: { x: 0, y: 0 },
    things: []
  };

  const description: ThingDescription = {
    properties: ["death"],
    label: "foo",
    sprite: "bar"
  }

  editor.addThing(location, description);

  const anotherDescription: ThingDescription = {
    properties: ["wall"],
    sprite: "wall"
  }

  const addResult = editor.addThing(location, anotherDescription);

  expect(addResult.addedThing).not.toBe(undefined);
});
