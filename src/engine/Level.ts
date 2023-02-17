import { EditorTool } from "./editor/EditorTool";
import { SpriteName } from "./sprite-names";
import { LevelEditor } from "./editor/LevelEditor";

export class Direction {

  public static readonly UP = new Direction(0, -1, "up");
  public static readonly DOWN = new Direction(0, 1, "down");
  public static readonly LEFT = new Direction(-1, 0, "left");
  public static readonly RIGHT = new Direction(1, 0, "right");

  public static getAllDirections(): Direction[] {
    return [
      Direction.UP,
      Direction.DOWN,
      Direction.LEFT,
      Direction.RIGHT
    ];
  }

  private constructor(public readonly deltaX: number, public readonly deltaY: number, public readonly name: string) {
  }


  public move(coords: Coords): Coords {
    return {
      x: coords.x + this.deltaX,
      y: coords.y + this.deltaY
    };
  }
}

export interface Coords {
  x: number,
  y: number
}

export interface Location {

  things: Thing[]
}

export class Thing {

  private static nextId = 0;

  public readonly id = Thing.nextId++;

  constructor(
    public readonly isWall: boolean,
    public readonly sprite: SpriteName
  ) {

  }
}

export class Level {

  public static random(width: number, height: number): Level {

    let start: Coords;

    const locations = Array(width).fill(0).map((_, y) =>
      Array(height).fill(0).map((_, x) => {
          if (Math.random() > 0.2) {
            if (Math.random() > 0.6 && !start) {
              start = { x: x, y: y };
              console.log("Start: " + JSON.stringify(start));
            }
            return emptySpot();
          } else {
            return aWall();
          }
        }
      )
    );

    return new Level(locations, start!);
  }

  public static fromMatrix(...rows: string[]): Level {

    let start: Coords = { x: 0, y: 0 };

    const locations: Location[][] = rows
      .map((row, rowIndex) =>
        [...row]
          .map((char, columnIndex) => {
              switch (char) {
                case '#':
                  return aWall();
                case '@': {
                  start = { x: columnIndex, y: rowIndex };
                  return emptySpot();
                }
                case ' ':
                  return emptySpot();
                default:
                  throw Error(`Illegal character on row/col ${rowIndex}/${columnIndex}: ${char}`);
              }
            }
          )
      );

    return new Level(locations, start);
  }

  public readonly editor = new LevelEditor();

  private playerLocation: Coords;

  public collisionEnabled = true;


  constructor(
    public locations: Location[][],
    public start: Coords
  ) {
    this.playerLocation = { ...start };
  }

  public tryToMove(direction: Direction): boolean {

    const nextCoords = direction.move(this.playerLocation);

    const nextLocation = this.getLocation(nextCoords);

    const canMove = !!nextLocation && (!nextLocation.things.some(thing => thing.isWall) || !this.collisionEnabled);

    if (canMove) {
      this.playerLocation = nextCoords;
    }

    return canMove;
  }

  private getLocation(coords: Coords): Location | undefined {
    const row = this.locations[coords.y];

    if (!row) {
      return undefined;
    }

    return row[coords.x];
  }


}


export function aWall(): Location {
  return { things: [new Thing(true, "wall")] };
}

export function emptySpot(): Location {
  return { things: [] };
}
