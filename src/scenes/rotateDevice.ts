import {t} from 'i18next';
import {KCtx} from '../kaplay';

export const sceneRotateDevice = (k: KCtx) => {
  k.loadSprite('rotate-device', 'sprites/icons/rotate-device.gif');
  k.add([
    //
    'rotate-device',
    k.sprite('rotate-device', {width: 100}),
    k.anchor('bot'),
    k.pos(k.width() / 2, k.height() / 2 - 10),
    k.scale(k.vec2(-1, 1)),
    k.fixed(),
    k.stay(),
  ]);

  k.add([
    //
    'rotate-device-text',
    k.text(t('common.rotateDevice'), {
      font: 'pixel',
      size: 24,
      width: k.width() * 0.8,
      align: 'center',
      lineSpacing: 10,
    }),
    k.color('white'),
    k.anchor('top'),
    k.pos(k.width() / 2, k.height() / 2 + 20),
    k.fixed(),
    k.stay(),
  ]);
};
