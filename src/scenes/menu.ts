import {t} from 'i18next';
import {KCtx} from '../kaplay';
import {gsm} from '../main';
import {changeScene} from '../misc/changeScene';
import {Helpers} from '../misc/Helpers';
import {sceneLevel_1_1} from './level-1-1';

export const sceneMenu = (k: KCtx) => {
  // Add play button in the center of the screen
  k.loadSprite('button-play', 'sprites/icons/play.png');
  const playButton = k.add([
    'button-play',
    k.layer('menu'),
    k.sprite('button-play', {width: 100}),
    k.pos(k.width() / 2, k.height() / 2),
    k.anchor('center'),
    k.area(),
    k.fixed(),
  ]);

  playButton.onMousePress(() => {
    changeScene(k, gsm.state.persistent.currentLevel || sceneLevel_1_1.id, {
      isGameLevel: true,
      spawnAtExitIndex: gsm.state.persistent.spawnAtExitIndex,
    }).then();
  });

  // Version label (bottom-right)
  k.add([
    k.layer('menu'),
    k.text('v' + __APP_VERSION__, {size: 4, font: 'pixel'}),
    k.pos(k.width() - 6, k.height() - 6),
    k.anchor('botright'),
    k.fixed(),
    k.opacity(0.5),
  ]);

  // Add keyboard control labels for non-touch devices
  if (!Helpers.isTouchDevice()) {
    // Attack control label (left side)
    k.add([
      k.layer('menu'),
      k.text(t('menu.attackControl'), {size: 8, font: 'pixel'}),
      k.pos(15, k.height() - 25),
      k.anchor('botleft'),
      k.fixed(),
    ]);

    // Jump control label (right side)
    k.add([
      k.layer('menu'),
      k.text(t('menu.jumpControl'), {size: 8, font: 'pixel'}),
      k.pos(k.width() - 15, k.height() - 25),
      k.anchor('botright'),
      k.fixed(),
    ]);
  }
};
