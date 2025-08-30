import {KCtx} from '../kaplay';
import {Helpers} from '../misc/Helpers';
import {addJoystick} from './addJoystick';
import {changeScene} from './changeScene';

export const createHud = (k: KCtx) => {
  // Add mobile joystick and buttons if on a touch device
  if (Helpers.isTouchDevice()) {
    addJoystick(k, {size: Math.min(window.innerWidth / 15, 60)});
  }

  // Add reload button to the top right corner
  k.loadSprite('reload-button', 'sprites/icons/reload.png');
  const reloadButton = k.add([
    'reload-button',
    'hud',
    k.layer('hud'),
    k.sprite('reload-button'),
    k.area(),
    k.pos(k.width() - 10, 10),
    k.anchor('topright'),
    k.fixed(),
    k.stay(),
  ]);
  reloadButton.onClick(() => {
    changeScene(k, 'level-home').then();
  });

  // Hide by default, will be shown when the game starts
  hide();

  function show() {
    k.get('hud').forEach(o => {
      o.hidden = false;
      o.paused = false;
    });
  }

  function hide() {
    k.get('hud').forEach(o => {
      o.hidden = true;
      o.paused = true;
    });
  }

  return {
    show,
    hide,
  };
};
