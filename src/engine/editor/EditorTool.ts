export enum EditorTool {
  NONE = "none",
  WALL = "wall",
  FIRE = "fire",
  FLOOR = "floor",
  KEY = "key",
  RECEIVE = "receive"
}

export const allEditorTools: EditorTool[] = [
  EditorTool.NONE,
  EditorTool.FLOOR,
  EditorTool.WALL,
  EditorTool.FIRE,
  EditorTool.KEY,
  EditorTool.RECEIVE
];
