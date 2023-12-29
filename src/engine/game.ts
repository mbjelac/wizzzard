import { Errand } from "./Errand";

export class Game {

  getErrands(): Errand[] {
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
}

export const GAME = new Game();
