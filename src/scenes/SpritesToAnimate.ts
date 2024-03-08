import { Thing } from "../engine/Level";

interface SpriteToAnimate {

  sprite: Phaser.Physics.Arcade.Sprite,
  animationName: string
}
export class SpritesToAnimate {

  private readonly toAnimate: SpriteToAnimate[] = [];

  public addSprite(thing: Thing, sprite: Phaser.Physics.Arcade.Sprite) {

    if (!thing.description.sprite.startsWith("__")) {
      return;
    }

    this.toAnimate.push({ sprite: sprite, animationName: thing.description.sprite });
  }

  public animateAll() {
    this.toAnimate.forEach(spriteToAnimate => {
      spriteToAnimate.sprite.anims.play({
        key: spriteToAnimate.animationName,
        startFrame: Math.floor(Math.random() * 4)
      });
    });

    this.toAnimate.length = 0;
  }

  public clearAll() {
    this.toAnimate.length = 0;
  }
}
