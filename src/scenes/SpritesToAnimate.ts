import { SpriteAnimationName, spriteAnimations } from "../engine/sprite-names";
import { Thing } from "../engine/Level";

interface SpriteToAnimate {

  sprite: Phaser.Physics.Arcade.Sprite,
  animationName: SpriteAnimationName
}
export class SpritesToAnimate {

  private readonly toAnimate: SpriteToAnimate[] = [];

  public addSprite(thing: Thing, sprite: Phaser.Physics.Arcade.Sprite) {
    const animationName = spriteAnimations.get(thing.sprite);

    if (!animationName) {
      return;
    }

    this.toAnimate.push({ sprite, animationName });
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
