import {AreaComp, BodyComp, GameObj, HealthComp, PosComp, SpriteComp, TimerComp, TimerController, Vec2} from 'kaplay';
import {gsm} from '../main';
import {changeScene} from '../misc/changeScene';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';
import {EnemyComp} from './generic/enemy';
import {GameEntity} from './generic/entity';
import {Interactable} from './generic/interactable';

export interface PlayerConfig {
  maxRunSpeed: number;
  accelGround: number;
  accelAir: number;
  decelGround: number;
  decelAir: number;
  jumpForce: number;
  minRunAnimSpeed: number;
  maxRunAnimSpeed: number;
  attackPower: number;
}

export interface PlayerComp extends GameObj<string | SpriteComp | PosComp | AreaComp | BodyComp | TimerComp> {
  vx: number; // horizontal velocity
  config: PlayerConfig; // player configuration
  waitForActionButton: () => Promise<void>; // function to wait for action button press
}

const DEFAULTS: PlayerConfig = {
  maxRunSpeed: 200, // px/s
  accelGround: 200,
  accelAir: 150,
  decelGround: 500,
  decelAir: 300,
  jumpForce: 400,
  minRunAnimSpeed: 1, // anim speed multiplier
  maxRunAnimSpeed: 2,
  attackPower: 1,
};

enum State {
  IDLE = 'IDLE',
  WALK = 'WALK',
  JUMP = 'JUMP',
  FALL = 'FALL',
  ATTACK = 'ATTACK',
  INTERACT = 'INTERACT',
}

export const PlayerEntity: GameEntity<PlayerConfig, PlayerComp> = {
  async loadResources(k: KCtx): Promise<void> {
    await k.loadSprite('player', 'sprites/characters/bobr.gif', {
      sliceX: 5,
      sliceY: 4,
      anims: {
        idle: {from: 0, to: 1, speed: 3, loop: true},
        walk: {from: 5, to: 8, speed: 10, loop: true}, // speed here is frames per second
        jump: {from: 10, to: 10},
        fall: {from: 10, to: 10},
        attack: {from: 15, to: 19, speed: 20, loop: false},
      },
    });
    await k.loadSprite('player-hit-wave', 'sprites/characters/bobr-hit-wave.png');

    await k.loadSound('player-attack', 'sounds/bobr-attack.mp3');
  },

  spawn(k: KCtx, posXY: Vec2 = k.vec2(100, 100), config?: Partial<PlayerConfig>): PlayerComp {
    const C: PlayerConfig = {...DEFAULTS, ...config};

    const player = k.add([
      'player', // tag for easy access
      k.sprite('player', {anim: 'idle'}),
      k.pos(posXY),
      k.area({
        //
        shape: new k.Rect(k.vec2(1, 0), 20, 31),
        ...defaultFriction,
      }), // custom area shape for better collision
      k.body(), // enables gravity + isGrounded()
      k.anchor('bot'),
      k.opacity(1),
      k.state<State>(State.IDLE, [State.IDLE, State.WALK, State.JUMP, State.FALL, State.ATTACK, State.INTERACT]),
      k.timer(),
      {
        vx: 0, // horizontal velocity
        config: C,
        waitForActionButton,
      },
    ]);

    let hitbox: GameObj<AreaComp>;
    let invincibleTimer: TimerController;

    function doJump() {
      player.jump(C.jumpForce);
      player.enterState(State.JUMP);
    }

    function getIsInvincible(): boolean {
      return !!invincibleTimer;
    }

    function setAnim(name: string, onEnd?: () => void) {
      if (player.getCurAnim()?.name !== name) player.play(name, {onEnd});
    }

    function waitForActionButton(): Promise<void> {
      return new Promise(resolve => {
        player.onButtonPress('action', () => {
          resolve();
        });
      });
    }

    player.onButtonPress('jump', () => {
      // Allow jumping only if player is grounded
      if (player.state !== State.INTERACT && player.isGrounded()) {
        doJump();
      }
    });

    player.onButtonPress('action', () => {
      if (player.state === State.ATTACK || player.state === State.INTERACT) {
        return;
      }

      let isFirstUpdate = true;
      let isInteractableObjectDetected = false;

      // Create a hitbox in front of the player to detect interactable objects
      const interactionHitbox = player.add([
        'player.interaction-hitbox',
        k.pos(player.flipX ? -14 : 14, 0), // offset to
        k.area({shape: new k.Rect(k.vec2(1, 0), 16, player.height)}), // small area in front of player
        k.rect(20, 20, {fill: false}),
        k.anchor('bot'),
        k.opacity(0),
      ]);

      interactionHitbox.onCollide('interactable', async (obj: GameObj<Interactable>) => {
        isInteractableObjectDetected = true;
        player.enterState(State.INTERACT);

        await obj.interact(player);
        player.enterState(State.IDLE);
      });

      interactionHitbox.onUpdate(() => {
        if (isFirstUpdate) {
          // Need that trick because onUpdate is called before onCollide
          isFirstUpdate = false;
        } else {
          // If no interactable object is detected, allow attack
          if (!isInteractableObjectDetected) {
            player.enterState(State.ATTACK);
          }

          player.remove(interactionHitbox);
        }
      });
    });

    player.onFixedUpdate(() => {
      const dt = k.dt();
      const onGround = player.isGrounded();
      let movementDirection = 0; // default direction is 0 (no movement)

      // Check if player is not in an interact state
      if (player.state !== State.INTERACT) {
        // Check which button is pressed for movement
        if (k.isButtonDown('left')) {
          movementDirection = -1; // move left
        } else if (k.isButtonDown('right')) {
          movementDirection = 1; // move right
        }
      }

      // Set friction only when on ground (hack to avoid side friction when jumping)
      player.friction = onGround ? defaultFriction.friction : 0;

      if (movementDirection !== 0) {
        let accel = onGround ? C.accelGround : C.accelAir;

        // If direction is opposite to current velocity, need to change acceleration
        if (Math.sign(movementDirection) !== Math.sign(player.vx)) {
          accel += onGround ? C.decelGround : C.decelAir; // add deceleration to acceleration
        }

        player.vx = moveTowards(player.vx, movementDirection * C.maxRunSpeed, accel * dt);
      } else {
        const accel = onGround ? C.decelGround : C.decelAir;
        const mag = Math.max(0, Math.abs(player.vx) - accel * dt);
        player.vx = mag * Math.sign(player.vx);
      }

      // apply velocity to pos (Kaplay's body() already applies gravity to vy;
      // vx is usually read by you / set on obj; if your Kaplay build needs a different prop, adapt here)
      player.move(player.vx, 0);

      // Set face direction based on direction of movement
      player.flipX = movementDirection < 0 ? true : movementDirection > 0 ? false : player.flipX;
      player.area.scale.x = player.flipX ? -1 : 1; // need to flip collision area as well

      // Animation state switches
      if (player.state === State.ATTACK) {
        // Check that we're on the right animation frame to trigger the hitbox
        if (player.getCurAnim()?.frameIndex === 2) {
          if (!hitbox) {
            hitbox = player.add([
              'player.hitbox',
              k.pos(k.vec2(player.flipX ? -16 : 16, 0)),
              k.area(),
              k.sprite('player-hit-wave', {flipX: player.flipX}), // 20x20
              k.anchor('bot'),
              // k.lifespan(0.1), // it leads to a bug where sounds in a whole game stop to play
            ]);

            hitbox.onCollide('enemy', (enemy: EnemyComp) => {
              enemy.registerHit(player);
              k.play('player-attack');
            });

            // Need to manually destroy the hitbox after a short delay
            // Replacement for k.lifespan(0.1)
            player.wait(0.1, () => {
              if (hitbox) {
                hitbox.destroy();
                hitbox = undefined;
              }
            });
          }
        }
      } else if (player.state === State.INTERACT) {
        // noop
      } else {
        if (!onGround) {
          if (player.vel.y < 0) {
            player.enterState(State.JUMP);
          } else {
            player.enterState(State.FALL);
          }
        } else {
          if (Math.abs(player.vx) > 5) {
            player.enterState(State.WALK);
          } else {
            player.enterState(State.IDLE);
          }
        }
      }

      // Add flashing if player is invincible
      if (getIsInvincible()) {
        player.opacity = Math.abs(Math.sin(k.time() * 20)) * 0.5 + 0.5; // flash effect
      } else {
        player.opacity = 1; // reset opacity when not invincible
      }
    });

    player.onStateEnter(State.IDLE, () => {
      setAnim('idle');
    });

    player.onStateEnter(State.INTERACT, () => {
      setAnim('idle');
    });

    player.onStateUpdate(State.WALK, () => {
      setAnim('walk');

      const t = k.clamp(Math.abs(player.vx) / C.maxRunSpeed, 0, 1);
      player.animSpeed = k.lerp(C.minRunAnimSpeed, C.maxRunAnimSpeed, t);
    });

    player.onStateEnter(State.JUMP, () => {
      setAnim('jump');
    });

    player.onStateEnter(State.FALL, () => {
      setAnim('fall');
    });

    player.onStateEnter(State.ATTACK, () => {
      setAnim('attack', () => {
        player.enterState(State.IDLE); // return to idle after attack
      });
      player.animSpeed = 1;
    });

    player.onCollideUpdate('enemy', (enemy: EnemyComp) => {
      if (!getIsInvincible() && player.state !== State.ATTACK && !enemy.dead && enemy.config.attackPower) {
        // Update player health
        gsm.update({
          temp: {
            player: {
              health: Math.max(0, gsm.state.temp.player.health - enemy.config.attackPower),
            },
          },
        });

        // Knockback effect
        player.applyImpulse(k.vec2(Math.sign(player.pos.x - enemy.pos.x) * 150, -230));

        // Apply invincibility frames
        invincibleTimer?.cancel();
        invincibleTimer = player.wait(1);
        invincibleTimer.onEnd(() => {
          invincibleTimer = undefined;
        });
      }
    });

    const gsmSub = gsm.onUpdate(state => {
      // Check for player death
      if (state.temp.player.health <= 0) {
        changeScene(k, k.getSceneName()).then(); // restart level on death
      }
    });

    player.onDestroy(() => {
      invincibleTimer?.cancel();
      invincibleTimer = undefined;

      gsmSub.cancel(); // unsubscribe from gsm updates
    });

    return player;
  },
};

function moveTowards(current: number, target: number, increment: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= increment) return target;

  return current + Math.sign(target) * increment;
}
