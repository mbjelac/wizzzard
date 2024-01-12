import { ErrandDescription } from "./ErrandDescription";
import { Level } from "./Level";
import { LevelFactory } from "./LevelFactory";

export class Game {

  getErrandDescriptions(): ErrandDescription[] {
    return [
      {
        id: "beorn1",
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
      {
        id: "beorn2",
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
      {
        id: "beorn3",
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
      {
        id: "beorn4",
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
      {
        id: "beorn5",
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
    ];
  }

  goToErrand(errandId: string) {

  }

  getCurrentLevel(): Level {
    return new LevelFactory().random(7, 7);
  }
}

export const GAME = new Game();
