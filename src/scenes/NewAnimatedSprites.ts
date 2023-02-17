import { SpriteAnimationName, spriteAnimations } from "../engine/sprite-names";
import { Thing } from "../engine/Level";

interface ItemToAnimate {

  sprite: Phaser.Physics.Arcade.Sprite,
  animationName: SpriteAnimationName
}
export class SpritesToAnimate {

  private readonly toAnimate: ItemToAnimate[] = [];

  public addAnimatedSprite(thing: Thing, sprite: Phaser.Physics.Arcade.Sprite) {
    const animationName = spriteAnimations.get(thing.sprite);

    if (!animationName) {
      return;
    }

    this.toAnimate.push({ sprite, animationName });
  }

  public animate() {
    this.toAnimate.forEach(item => {
      item.sprite.anims.play({
        key: item.animationName,
        startFrame: Math.floor(Math.random() * 4)
      });
    });

    this.toAnimate.length = 0;
  }
}
