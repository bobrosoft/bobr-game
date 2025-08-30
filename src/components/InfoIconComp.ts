import {AnchorComp, AnimateComp, Comp, GameObj, PosComp, SpriteComp} from 'kaplay';
import {k} from '../kaplay';

interface InfoIconComp extends Comp {}

const COMPONENT_ID = 'info-icon-comp';

export function infoIcon(offsetX: number = 0): InfoIconComp {
  let icon: GameObj<SpriteComp | PosComp | AnchorComp | AnimateComp>;

  return {
    id: COMPONENT_ID,

    add(this: GameObj<SpriteComp | InfoIconComp>) {
      k.loadSprite('info-icon', 'sprites/icons/info.png');

      icon = this.add([
        //
        k.sprite('info-icon'),
        k.pos(offsetX, -this.height - 2),
        k.anchor('bot'),
        k.animate({
          relative: true,
        }),
      ]);
      icon.animate(
        'pos',
        [
          //
          k.vec2(0, 0),
          k.vec2(0, -2),
          k.vec2(0, 0),
          k.vec2(0, -2),
          k.vec2(0, 0),
          k.vec2(0, 0),
          k.vec2(0, 0),
        ],
        {
          duration: 1,
          direction: 'forward',
        },
      );
    },

    destroy(this: GameObj<SpriteComp | InfoIconComp>) {
      icon?.destroy();
      icon = undefined;
    },
  };
}

infoIcon.id = COMPONENT_ID;
