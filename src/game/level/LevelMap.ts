import { Thing } from "./Thing";
import { Coords, LevelDimensions, LevelMatrix } from "./LevelDescription";
import { SavedLocation } from "./Level";
import { Direction } from "./Direction";
import { Surroundings } from "./monster-utils";

export interface LevelLocation {
  coords: Coords,
  things: Thing[],
}

export interface Neighborhood {
  readonly here: LevelLocation,
  readonly neighbours: Map<Direction, LevelLocation>
}

export class LevelMap {

  static fromLevelMatrix(matrix: LevelMatrix): LevelMap {
    return new LevelMap(
      matrix.map((row, rowIndex) => row
        .map((location, columnIndex) => ({
            coords: { x: columnIndex, y: rowIndex },
            things: location.things
            .map(thingProps => Thing.create(thingProps))
          })
        )
      )
    );
  }

  static fromSavedLocations(savedLocations: SavedLocation[][], thingCreationListener: (thing: Thing) => void) {
    return new LevelMap(savedLocations.map(
        row => row.map(
          savedLocation => (
            {
              coords: savedLocation.coords,
              things: savedLocation.things.map(savedThing => {
                const thing = Thing.load(savedThing);
                thingCreationListener(thing);
                return thing;
              })
            }
          )
        )
      )
    );
  }

  private readonly dimensions: LevelDimensions;

  private constructor(private readonly levelLocations: LevelLocation[][]) {
    this.dimensions = {
      width: levelLocations[0]?.length || 0,
      height: levelLocations.length
    };
  }

  getLocation(coords: Coords): LevelLocation | undefined {
    const row = this.levelLocations[coords.y];

    if (!row) {
      return undefined;
    }

    return row[coords.x];
  }

  getNeighbours(coordinates: Coords): LevelLocation[] {
    return [
      { y: coordinates.y - 1, x: coordinates.x },
      { y: coordinates.y + 1, x: coordinates.x },
      { y: coordinates.y, x: coordinates.x - 1 },
      { y: coordinates.y, x: coordinates.x + 1 },
    ]
    .filter(coords => coords.x >= 0 && coords.y >= 0 && coords.x < this.dimensions.width && coords.y < this.dimensions.height)
    .map(coords => this.levelLocations[coords.y][coords.x]);
  }

  getLocationOfThing(thing: Thing): LevelLocation | undefined {
    return this
    .levelLocations
    .flatMap(row => row
    .flatMap(location => ({
      hitCount: location.things.filter(levelThing => levelThing.equals(thing)).length,
      location: location
    })))
    .find(result => result.hitCount === 1)
      ?.location;
  }

  save(): SavedLocation[][] {
    return this.levelLocations.map(
      row => row.map(
        location => (
          {
            coords: location.coords,
            things: location.things.map(thing => thing.save())
          }
        )
      )
    );
  }

  findLocationByThingId(thingId: number): Coords | undefined {
    return this
    .levelLocations
    .flatMap((row, rowIndex) => row
    .flatMap((col, colIndex) => ({
      hitCount: col.things.filter(levelThing => levelThing.id == thingId).length,
      coords: { x: colIndex, y: rowIndex }
    })))
    .find(loc => loc.hitCount === 1)
      ?.coords;
  }

  getLevelMatrix(): LevelMatrix {
    return this.levelLocations
    .map(row => row
      .map(location => ({
          things: location.things
          .map(thing => thing.description)
        })
      )
    );
  }

  getLocationsWhich(predicate: (location: LevelLocation) => boolean): LevelLocation[] {
    return this
    .levelLocations
    .flatMap(row => row)
    .filter(levelLocation => predicate(levelLocation));
  }

  getLocationsWhichHave(thingPredicate: (thing: Thing) => boolean): LevelLocation[] {
    return this
    .getLocationsWhich(location => location.things.some(thingPredicate));
  }

  getSurroundings(location: LevelLocation): Surroundings {

    const thingsAround = new Map<Direction, Thing[]>();

    Direction.getAllDirections().forEach(direction => {
      const things = this.getLocation(direction.move(location.coords))?.things;

      if(things !== undefined) {
        thingsAround.set(direction, things);
      }
    });

    return {
      thingsInDirection: thingsAround
    };
  }

  move(thingToMove: Thing, currentLocation: LevelLocation, nextCoords: Coords) {
    currentLocation.things = currentLocation.things.filter(thing => thing.id !== thingToMove.id);
    this.getLocation(nextCoords)!.things.push(thingToMove);
  }
}
