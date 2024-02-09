export enum EditorTool {
  NONE = "none",
  WALL = "wall",
  FIRE = "fire",
  FLOOR = "floor",
  KEY = "key",
  RECEIVE = "receive",
  KEY_GREEN = "key_green",
}

export const allEditorTools: EditorTool[] = [
  EditorTool.NONE,
  EditorTool.FLOOR,
  EditorTool.WALL,
  EditorTool.FIRE,
  EditorTool.KEY,
  EditorTool.RECEIVE,
  EditorTool.KEY_GREEN,
];
