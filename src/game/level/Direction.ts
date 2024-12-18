import { Coords } from "./LevelDescription";

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

  private constructor(
    public readonly deltaX: number,
    public readonly deltaY: number,
    public readonly name: string
  ) {
  }


  public move(coords: Coords): Coords {
    return {
      x: coords.x + this.deltaX,
      y: coords.y + this.deltaY
    };
  }

  left(): Direction {
    return leftOf.get(this)!;
  }

  right(): Direction {
    return rightOf.get(this)!;
  }
}

const leftOf = new Map<Direction, Direction>()
.set(Direction.UP, Direction.LEFT)
.set(Direction.LEFT, Direction.DOWN)
.set(Direction.DOWN, Direction.RIGHT)
.set(Direction.RIGHT, Direction.UP);

const rightOf = new Map<Direction, Direction>()
.set(Direction.UP, Direction.RIGHT)
.set(Direction.RIGHT, Direction.DOWN)
.set(Direction.DOWN, Direction.LEFT)
.set(Direction.LEFT, Direction.UP);
