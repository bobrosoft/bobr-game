import {Vec2} from 'kaplay';
import {infoIcon} from '../components/InfoIconComp';
import {interactable} from '../components/InteractableComp';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';
import {GameEntity} from './generic/entity';
import {NpcConfig, NpcObj} from './generic/npc';
import {PlayerComp} from './player';

enum State {
  IDLE = 'IDLE',
  INTERACTING = 'INTERACTING',
}

export const OldBobrEntity: GameEntity<NpcConfig, NpcObj> = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('old-bobr', 'sprites/characters/old-bobr.gif', {
        sliceX: 2,
        sliceY: 1,
        anims: {
          idle: {from: 0, to: 1, speed: 1.5, loop: true},
        },
      }),
      k.loadSound('old-bobr-kurwa-1', 'sounds/old-bobr-kurwa-1.mp3'),
      k.loadSound('old-bobr-kurwa-2', 'sounds/old-bobr-kurwa-2.mp3'),
    ]);
  },

  spawn(k: KCtx, posXY: Vec2 = k.vec2(100, 100), config: NpcConfig): NpcObj {
    const C: NpcConfig = {
      ...config,
    };

    const mainObj = k.add([
      'old-bobr',
      k.sprite('old-bobr', {anim: 'idle', flipX: C.flipX || false}),
      k.state(State.IDLE, [State.IDLE, State.INTERACTING]),
      k.timer(),
      k.pos(posXY),
      k.area({...defaultFriction, collisionIgnore: ['player', 'enemy']}),
      k.body(),
      k.anchor('bot'),
      k.offscreen({pause: true, unpause: true, hide: true}),
      interactable(interact),
      {
        config: C,
        shouldShowInfoIcon,
      },
    ]);

    async function interact(player: PlayerComp): Promise<void> {
      const availableInteraction = C.getAvailableInteractionType();
      if (!availableInteraction) {
        return;
      }

      mainObj.enterState(State.INTERACTING);

      // Play a random sound
      k.play(k.choose(['old-bobr-kurwa-1', 'old-bobr-kurwa-2']));

      // Rotate the sprite based on player position
      mainObj.flipX = mainObj.pos.x > player.pos.x;

      await C.performInteraction(availableInteraction); // main logic is here
      mainObj.enterState(State.IDLE);
    }

    function shouldShowInfoIcon(): boolean {
      if (mainObj.state === State.INTERACTING) {
        return false;
      }

      const interactionType = C.getAvailableInteractionType();
      if (!interactionType) {
        return false;
      }

      // Don't show icon if that's a repeat replica
      if (interactionType.match(/REPEAT/)) {
        return false;
      }

      return true;
    }

    function updateInfoIcon() {
      if (shouldShowInfoIcon()) {
        mainObj.use(infoIcon(6 * (mainObj.flipX ? -1 : 1)));
      } else {
        mainObj.unuse(infoIcon.id);
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
