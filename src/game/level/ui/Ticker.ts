import { TickResult } from "../Level";

export class Ticker {

  private lastTickTime = 0;

  constructor(
    private readonly tickResultProvider: () => TickResult,
    private readonly tickResultHandler: (result: TickResult) => Promise<void>,
    readonly tickInterval = 400
  ) {
  }

  async tick(time: number) {

    if (time - this.lastTickTime < this.tickInterval) {
      return;
    }

    this.lastTickTime = time;

    await this.tickResultHandler(this.tickResultProvider())
  }
}
