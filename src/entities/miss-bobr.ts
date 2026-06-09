import {Vec2} from 'kaplay';
import {infoIcon} from '../components/InfoIconComp';
import {interactable} from '../components/InteractableComp';
import {KCtx} from '../kaplay';
import {gsm} from '../main';
import {defaultFriction} from '../misc/defaults';
import {GameEntity} from './generic/entity';
import {NpcConfig, NpcObj} from './generic/npc';
import {PlayerComp} from './player';

enum State {
  IDLE = 'IDLE',
  WALK = 'WALK',
  INTERACTING = 'INTERACTING',
}

export const MissBobrEntity: GameEntity<NpcConfig, NpcObj> = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('miss-bobr', 'sprites/characters/miss-bobr.gif', {
        sliceX: 4,
        sliceY: 2,
        anims: {
          idle: {from: 0, to: 1, speed: 3, loop: true},
          walk: {from: 4, to: 7, speed: 5, loop: true}, // speed here is frames per second
        },
      }),
    ]);
  },

  spawn(k: KCtx, posXY: Vec2 = k.vec2(100, 100), config?: NpcConfig): NpcObj {
    const C: NpcConfig = {
      speedX: 60,
      ...config,
    };

    let destPos: Vec2;

    const mainObj = k.add([
      'miss-bobr',
      k.sprite('miss-bobr', {anim: 'idle', flipX: C.flipX || false}),
      k.state(State.IDLE, [State.IDLE, State.WALK, State.INTERACTING]),
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
        walkToPosition,
      },
    ]);

    async function interact(player: PlayerComp): Promise<void> {
      const availableInteraction = getAvailableInteractionType();
      if (!availableInteraction) {
        return;
      }

      mainObj.enterState(State.INTERACTING);

      // Play a random sound
      // k.play(k.choose(['old-bobr-kurwa-1', 'old-bobr-kurwa-2']));

      // Rotate the sprite based on player position
      mainObj.flipX = mainObj.pos.x > player.pos.x;

      await performInteraction(availableInteraction, player); // main logic is here
      mainObj.enterState(State.IDLE);
    }

    function shouldShowInfoIcon(): boolean {
      if (mainObj.state === State.INTERACTING) {
        return false;
      }

      const interactionType = getAvailableInteractionType();
      if (!interactionType) {
        return false;
      }

      switch (interactionType) {
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
      const gameState = gsm.state;
      return InteractionType.SAY_INTRO_REPEAT;
    }

    async function performInteraction(type: InteractionType, player: PlayerComp) {
      //
    }

    function walkToPosition(newPos: Vec2) {
      if (mainObj.state === State.INTERACTING) {
        return;
      }

      mainObj.enterState(State.WALK);
      mainObj.flipX = newPos.x < mainObj.pos.x; // Flip sprite based on direction
      destPos = newPos;
    }

    mainObj.onStateEnter(State.IDLE, async () => {
      mainObj.play('idle');
      updateInfoIcon();
    });

    mainObj.onStateEnter(State.INTERACTING, async () => {
      updateInfoIcon();
    });

    mainObj.onStateEnter(State.WALK, async () => {
      mainObj.play('walk');
    });

    mainObj.onStateUpdate(State.WALK, () => {
      if (mainObj.isGrounded()) {
        const direction = mainObj.flipX ? -1 : 1;
        mainObj.move(C.speedX * direction, 0);
      }

      if (destPos.dist(mainObj.pos) < C.speedX * k.dt()) {
        mainObj.enterState(State.IDLE);
      }
    });

    mainObj.onEnterScreen(() => {
      updateInfoIcon();
    });

    return mainObj;
  },
};

enum InteractionType {
  SAY_INTRO_REPEAT = 'SAY_INTRO_REPEAT',
}
