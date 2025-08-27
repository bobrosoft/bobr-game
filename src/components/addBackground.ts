import {GameObj} from 'kaplay';
import {PlayerComp} from '../entities/player';
import {KCtx} from '../kaplay';

export function addBackground(k: KCtx, spriteName: string, player: PlayerComp): GameObj {
  const background = k.add([
    //
    k.sprite(spriteName, {
      tiled: true,
      width: k.width() * 10,
      height: k.height(),
    }),
    k.layer('bg'),
    k.pos(0, 0),
    k.scale(1.5),
    k.fixed(),
    k.anchor('center'),
  ]);

  background.onUpdate(() => {
    background.pos.x = k.width() / 2 + -k.getCamPos().x / 100;
    background.pos.y = k.height() / 2 + -k.getCamPos().y / 50;
  });

  return background;
}
