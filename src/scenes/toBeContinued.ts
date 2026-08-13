import {t} from 'i18next';
import {KCtx} from '../kaplay';

export const sceneToBeContinued = async (k: KCtx) => {
  k.add([
    //
    k.layer('bg'),
    k.rect(k.width(), k.height()),
    k.color('black'),
    k.pos(0, 0),
    k.anchor('topleft'),
    k.fixed(),
  ]);

  k.add([
    //
    k.text(t('theEnd.toBeContinued'), {font: 'pixel', size: 20}),
    k.color('white'),
    k.anchor('center'),
    k.pos(k.width() / 2, k.height() / 2 - 20),
    k.fixed(),
  ]);

  k.add([
    //
    k.text(t('theEnd.thanksForPlaying'), {font: 'pixel', size: 10}),
    k.color('white'),
    k.anchor('center'),
    k.pos(k.width() / 2, k.height() / 2 + 20),
    k.fixed(),
  ]);
};

sceneToBeContinued.id = 'to-be-continued';
