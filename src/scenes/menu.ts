import {changeScene} from '../misc/changeScene';
import {KCtx} from '../kaplay';

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

  playButton.onClick(() => {
    changeScene(k, 'level-home').then();
  });
};
