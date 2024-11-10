import { TickResult } from "../Level";

export class Ticker {

  private lastTickTime = 0;
  private readonly tickInterval = 200;

  constructor(
    private readonly tickResultProvider: () => TickResult,
    private readonly tickResultHandler: (result: TickResult) => void
  ) {
  }

  tick(time: number) {

    if (time - this.lastTickTime < this.tickInterval) {
      return;
    }

    this.lastTickTime = time;

    this.tickResultHandler(this.tickResultProvider())
  }
}
