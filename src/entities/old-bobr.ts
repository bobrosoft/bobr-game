import {t} from 'i18next';
import {Vec2} from 'kaplay';
import {infoIcon} from '../components/InfoIconComp';
import {showDialogSeries} from '../components/showDialog';
import {KCtx} from '../kaplay';
import {gameStateManager} from '../main';
import {defaultFriction} from '../misc/defaults';
import {GameEntity} from './generic/entity';
import {NpcComp, NpcConfig} from './generic/npc';
import {PlayerComp} from './player';

enum State {
  IDLE = 'IDLE',
  INTERACTING = 'INTERACTING',
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

    const mainObj = k.add([
      'old-bobr',
      'interactable',
      k.sprite('old-bobr', {anim: 'idle'}),
      k.state(State.IDLE, [State.IDLE, State.INTERACTING]),
      k.timer(),
      k.pos(posXY),
      k.area({...defaultFriction, collisionIgnore: ['player', 'enemy']}),
      k.body(),
      k.anchor('bot'),
      k.offscreen({pause: true, unpause: true, hide: true}),
      {
        config: C,
        interact,
        shouldShowInfoIcon,
      },
    ]);

    async function interact(player: PlayerComp): Promise<void> {
      const availableInteraction = getAvailableInteractionType();
      if (!availableInteraction) {
        return;
      }

      mainObj.enterState(State.INTERACTING);

      // Play a random sound
      k.play(k.choose(['old-bobr-kurwa-1', 'old-bobr-kurwa-2']));

      // Rotate the sprite based on player position
      mainObj.flipX = mainObj.pos.x > player.pos.x;

      await performInteraction(availableInteraction, player); // main logic is here
      mainObj.enterState(State.IDLE);
    }

    function shouldShowInfoIcon(): boolean {
      if (mainObj.state === State.INTERACTING) {
        return false;
      }

      switch (getAvailableInteractionType()) {
        case InteractionType.SAY_INTRO_REPEAT:
          return false;

        default:
          return true;
      }
    }

    function updateInfoIcon() {
      if (shouldShowInfoIcon()) {
        mainObj.use(infoIcon(6 * (mainObj.flipX ? -1 : 1)));
      } else {
        mainObj.unuse(infoIcon.id);
      }
    }

    function getAvailableInteractionType(): InteractionType {
      const gameState = gameStateManager.state;

      if (!gameState.oldBobr.isIntroSaid) {
        return InteractionType.SAY_INTRO;
      } else {
        return InteractionType.SAY_INTRO_REPEAT;
      }
    }

    async function performInteraction(type: InteractionType, player: PlayerComp) {
      const gameState = gameStateManager.state;

      switch (type) {
        case InteractionType.SAY_INTRO:
          await showDialogSeries(k, mainObj, player, [
            //
            t('oldBobr.intro1'),
            t('oldBobr.intro2'),
          ]);

          gameStateManager.setState({
            oldBobr: {
              ...gameState.oldBobr,
              isIntroSaid: true,
            },
          });
          break;

        case InteractionType.SAY_INTRO_REPEAT:
          await showDialogSeries(k, mainObj, player, [
            //
            t(k.choose(['oldBobr.introRepeat1', 'oldBobr.introRepeat2', 'oldBobr.introRepeat3'])),
          ]);
          break;
      }
    }

    mainObj.onStateEnter(State.IDLE, async () => {
      mainObj.play('idle');
      updateInfoIcon();
    });

    mainObj.onStateEnter(State.INTERACTING, async () => {
      updateInfoIcon();
    });

    mainObj.onEnterScreen(() => {
      updateInfoIcon();
    });

    return mainObj;
  },
};

enum InteractionType {
  SAY_INTRO = 'SAY_INTRO',
  SAY_INTRO_REPEAT = 'SAY_INTRO_REPEAT',
}
