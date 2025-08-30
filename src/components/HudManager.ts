import {AreaComp, GameObj} from 'kaplay';
import {KCtx} from '../kaplay';
import {Helpers} from '../misc/Helpers';
import {addJoystick} from './addJoystick';
import {changeScene} from '../misc/changeScene';

export class HudManager {
  protected reloadButton: GameObj<AreaComp>;

  constructor(protected k: KCtx) {
    // Add mobile joystick and buttons if on a touch device
    if (Helpers.isTouchDevice()) {
      addJoystick(this.k, {size: Math.min(window.innerWidth / 15, 60)});
    }

    // Add reload button to the top right corner
    this.k.loadSprite('reload-button', 'sprites/icons/reload.png');
    this.reloadButton = this.k.add([
      'reload-button',
      'hud',
      this.k.layer('hud'),
      this.k.sprite('reload-button'),
      this.k.area(),
      this.k.pos(this.k.width() - 10, 10),
      this.k.anchor('topright'),
      this.k.fixed(),
      this.k.stay(),
    ]);
    this.reloadButton.onClick(() => {
      changeScene(this.k, 'level-home').then();
    });

    // Hide by default, will be shown when the game starts
    this.hide();
  }

  show() {
    this.k.get('hud').forEach(o => {
      o.hidden = false;
      o.paused = false;
    });
  }

  hide() {
    this.k.get('hud').forEach(o => {
      o.hidden = true;
      o.paused = true;
    });
  }
}
