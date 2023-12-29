import { Errand } from "./Errand";

export class Game {

  getErrands(): Errand[] {
    return [
      {
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
      {
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
      {
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
      {
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
      {
        title: "Beorn's farewell",
        description: "Upon Beorn's specific request, his funeral pyre boat has to be ignited by magical flames, so his soul can rest within Taysha's wizardly realm."
      },
    ];
  }
}

export const GAME = new Game();
