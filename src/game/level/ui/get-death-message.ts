import { PlayerDeath } from "./sprites";

export function getDeathMessage(playerDeath: PlayerDeath): string {
  switch (playerDeath) {
    case "burning": return "You have perished in the fire.";
    case "drowning": return "You have drowned.";
    default: return "You have died.";
  }
}
