import {t} from 'i18next';
import {Vec2} from 'kaplay';
import {showDialogSeries} from '../components/showDialog';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';
import {GameEntity} from './generic/entity';
import {NpcComp, NpcConfig} from './generic/npc';
import {PlayerComp} from './player';

enum State {
  IDLE = 'IDLE',
}

export const OldBobrEntity: GameEntity<NpcConfig, NpcComp> = {
  async loadResources(k: KCtx): Promise<void> {
    await k.loadSprite('old-bobr', 'sprites/characters/old-bobr.gif', {
      sliceX: 2,
      sliceY: 1,
      anims: {
        idle: {from: 0, to: 1, speed: 1.5, loop: true},
      },
    });

    await k.loadSound('old-bobr-kurwa-1', 'sounds/old-bobr-kurwa-1.ogg');
    await k.loadSound('old-bobr-kurwa-2', 'sounds/old-bobr-kurwa-2.ogg');
  },

  spawn(k: KCtx, posXY: Vec2 = k.vec2(100, 100), config?: Partial<NpcConfig>): NpcComp {
    const C: NpcConfig = {
      ...config,
    };

    let direction = -1; // 1 for right, -1 for left

    const mainObj = k.add([
      'old-bobr',
      'interactable',
      k.sprite('old-bobr', {anim: 'idle'}),
      k.state(State.IDLE, [State.IDLE]),
      k.timer(),
      k.pos(posXY),
      k.area({...defaultFriction, collisionIgnore: ['player', 'enemy']}),
      k.body(),
      k.anchor('bot'),
      k.offscreen({pause: true, unpause: true, hide: true}),
      {
        config: C,
        interact,
      },
    ]);

    async function interact(player: PlayerComp): Promise<void> {
      k.play(k.choose(['old-bobr-kurwa-1', 'old-bobr-kurwa-2']));

      // Rotate the sprite based on player position
      mainObj.flipX = mainObj.pos.x > player.pos.x;

      // Show dialog series
      await showDialogSeries(k, mainObj, player, [
        //
        t('oldBobr.intro1'),
        t('oldBobr.intro2'),
      ]);
    }

    mainObj.onStateEnter(State.IDLE, async () => {
      mainObj.play('idle');
    });

    return mainObj;
  },
};
