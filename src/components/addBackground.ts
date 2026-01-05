import {GameObj} from 'kaplay';
import {KCtx} from '../kaplay';

interface Options {
  offsetY?: number;
}

export function addBackground(k: KCtx, spriteName: string, options?: Options): GameObj {
  const background = k.add([
    //
    k.sprite(spriteName, {
      tiled: true,
      width: k.width() * 10,
    }),
    k.layer('bg'),
    k.pos(0, 0),
    k.scale(1.5),
    k.fixed(),
    k.anchor('center'),
  ]);

  background.onUpdate(() => {
    background.pos = k.vec2(
      k.width() / 2 + -k.getCamPos().x / 50,
      k.height() / 2 + (options?.offsetY || 0) - k.getCamPos().y / 25,
    );
  });

  return background;
}
