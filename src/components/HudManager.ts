import {AreaComp, GameObj, OpacityComp, PosComp, ScaleComp, SpriteComp} from 'kaplay';
import {KCtx} from '../kaplay';
import {gsm} from '../main';
import {changeScene} from '../misc/changeScene';
import {Helpers} from '../misc/Helpers';
import {sceneLevelHome} from '../scenes/levelHome';
import {addJoystick} from './addJoystick';
import {GameState} from './GameStateManager';
import {hud} from './HudComp';

interface HudComp {
  shouldBeShown: boolean;
  targetOpacity?: number;
}

export class HudManager {
  protected isShown = false;
  protected dimOverlay: GameObj<OpacityComp>;
  protected reloadButton: GameObj<HudComp | AreaComp>;
  protected luckyCharm: GameObj<HudComp | AreaComp | OpacityComp | PosComp | ScaleComp | SpriteComp>;

  constructor(protected k: KCtx) {
    // Add local fade-in overlay for HUD
    this.dimOverlay = this.k.add([
      // 'hud', // not tagging as 'hud' to avoid hiding it with hide()
      this.k.layer('hud'),
      this.k.rect(this.k.width(), this.k.height()),
      this.k.color(0, 0, 0),
      this.k.pos(0, 0),
      this.k.anchor('topleft'),
      this.k.opacity(0),
      this.k.fixed(),
      this.k.stay(),
    ]);

    // Add mobile joystick and buttons if on a touch device
    if (Helpers.isTouchDevice()) {
      addJoystick(this.k, {size: Math.min(window.innerWidth / 15, 60)});
    }

    // Add reload button to the top right corner
    this.k.loadSprite('reload-button', 'sprites/icons/reload.png');
    this.reloadButton = this.k.add([
      'reload-button',
      hud({shouldBeShown: true}),
      this.k.sprite('reload-button'),
      this.k.area(),
      this.k.pos(10, 10),
      this.k.anchor('topleft'),
    ]);
    this.reloadButton.onClick(() => {
      gsm.reset();
      changeScene(this.k, sceneLevelHome.id).then();
    });

    // Add lucky charm
    this.k.loadSprite('lucky-charm', 'sprites/icons/lucky-charm.gif', {
      sliceX: 2,
      sliceY: 1,
      anims: {
        health2: {from: 0, to: 0, loop: false},
        health1: {from: 1, to: 1, loop: false},
      },
    });
    this.luckyCharm = this.k.add([
      'lucky-charm',
      hud({shouldBeShown: gsm.state.persistent.player.hasLuckyCharm}),
      this.k.sprite('lucky-charm'),
      this.k.area(),
      this.k.pos(this.k.width() - 10, 10),
      this.k.anchor('topright'),
      this.k.scale(1),
    ]);

    // Hide by default, will be shown when the game starts
    this.hide();

    // Subscribe to state changes to show/hide HUD
    gsm.onUpdate(state => this.onStateUpdate(state));
  }

  show() {
    this.k.get('hud').forEach(o => {
      if (!o.shouldBeShown) {
        return;
      }

      this.k.tween(0, 1, 1, v => {
        o.opacity = v * (o.targetOpacity ?? 1);
      });
      o.paused = false;
    });
    this.isShown = true;
  }

  hide() {
    this.k.get('hud').forEach(o => {
      o.opacity = 0;
      o.paused = true;
    });
    this.isShown = false;
  }

  async showDimOverlay() {
    return this.k.tween(0, 0.4, 0.6, v => {
      this.dimOverlay.opacity = v;
    });
  }

  async hideDimOverlay() {
    return this.k.tween(0.4, 0, 0.6, v => {
      this.dimOverlay.opacity = v;
    });
  }

  async onStateUpdate(state: GameState) {
    // Check if need to show lucky charm
    if (state.persistent.player.hasLuckyCharm && !this.luckyCharm.shouldBeShown) {
      this.luckyCharm.shouldBeShown = true;
      this.luckyCharm.paused = false;

      const initialPos = this.k.vec2(this.k.width() / 2 + 10, this.k.height() / 2 - 10);
      const endPos = this.luckyCharm.pos.clone();
      this.luckyCharm.pos = initialPos.clone();
      this.luckyCharm.scale = this.k.vec2(2);

      await this.showDimOverlay();
      await this.k.tween(0, 1, 1, v => {
        this.luckyCharm.opacity = v;
      });

      await this.k.wait(1);
      this.k.play('player-take-key');

      this.hideDimOverlay().then();
      await this.k.tween(
        0,
        1,
        1.5,
        v => {
          this.luckyCharm.pos = this.k.vec2(
            this.k.lerp(initialPos.x, endPos.x, v),
            this.k.lerp(initialPos.y, endPos.y, v),
          );
          this.luckyCharm.scale = this.k.vec2(this.k.lerp(2, 1, v));
        },
        this.k.easings['easeOutElastic'],
      );
    }

    // Check if need to hide lucky charm
    if (!state.persistent.player.hasLuckyCharm && this.luckyCharm.shouldBeShown) {
      this.luckyCharm.shouldBeShown = false;
      this.luckyCharm.paused = true;
      this.luckyCharm.opacity = 0;
    }

    // Update lacky charm animation based on health
    if (state.persistent.player.hasLuckyCharm) {
      if (state.temp.player.health) {
        this.luckyCharm.play('health' + state.temp.player.health);
      }
    }
  }
}
