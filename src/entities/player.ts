import {AreaComp, BodyComp, GameObj, HealthComp, PosComp, SpriteComp, TimerComp, TimerController, Vec2} from 'kaplay';
import {k, KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';
import {EnemyComp} from './enemy';

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
  maxHealth: number;
}

export interface PlayerComp
  extends GameObj<string | SpriteComp | PosComp | AreaComp | BodyComp | TimerComp | HealthComp> {
  vx: number; // horizontal velocity
  moveDirection: number; // -1 for left, 0 for none, 1 for right
  config: PlayerConfig; // player configuration
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
  maxHealth: 2,
};

enum State {
  IDLE = 'IDLE',
  WALK = 'WALK',
  JUMP = 'JUMP',
  FALL = 'FALL',
  ATTACK = 'ATTACK',
}

k.loadSprite('player', 'sprites/characters/bobr.gif', {
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

export function createPlayer(k: KCtx, posXY: Vec2 = k.vec2(100, 100), cfg?: Partial<PlayerConfig>): PlayerComp {
  const C = {...DEFAULTS, ...cfg};

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
    k.state(State.IDLE, [State.IDLE, State.WALK, State.JUMP, State.FALL, State.ATTACK]),
    k.health(C.maxHealth, C.maxHealth), // health component
    k.timer(),
    {
      vx: 0, // horizontal velocity
      config: C,
      get moveDirection(): number {
        return (k.isButtonDown('right') ? 1 : 0) + (k.isButtonDown('left') ? -1 : 0);
      },
    },
  ]);

  let hitbox: GameObj;
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

  player.onButtonPress('jump', () => {
    // Allow jumping only if player is grounded
    if (player.isGrounded()) {
      doJump();
    }
  });

  player.onButtonPress('action', () => {
    // Allow attack only if player is not already attacking
    if (player.state === State.ATTACK) {
      return;
    }

    player.enterState(State.ATTACK);
  });

  player.onFixedUpdate(() => {
    const dt = k.dt();
    const onGround = player.isGrounded();

    // horizontal movement
    const direction = player.moveDirection;

    // Set friction only when on ground (hack to avoid side friction when jumping)
    player.friction = onGround ? defaultFriction.friction : 0;

    if (direction !== 0) {
      let accel = onGround ? C.accelGround : C.accelAir;

      // If direction is opposite to current velocity, need to change acceleration
      if (Math.sign(direction) !== Math.sign(player.vx)) {
        accel += onGround ? C.decelGround : C.decelAir; // add deceleration to acceleration
      }

      player.vx = moveTowards(player.vx, direction * C.maxRunSpeed, accel * dt);
    } else {
      const accel = onGround ? C.decelGround : C.decelAir;
      const mag = Math.max(0, Math.abs(player.vx) - accel * dt);
      player.vx = mag * Math.sign(player.vx);
    }

    // apply velocity to pos (Kaplay's body() already applies gravity to vy;
    // vx is usually read by you / set on obj; if your Kaplay build needs a different prop, adapt here)
    player.move(player.vx, 0);

    // Set face direction based on direction of movement
    player.flipX = direction < 0 ? true : direction > 0 ? false : player.flipX;
    player.area.scale.x = player.flipX ? -1 : 1; // need to flip collision area as well

    // Animation state switches
    if (player.state !== State.ATTACK) {
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
    } else {
      // Check that we're on the right animation frame to trigger the hitbox
      if (player.getCurAnim()?.frameIndex === 2) {
        if (!hitbox) {
          hitbox = player.add([
            'player.hitbox',
            k.pos(k.vec2(player.flipX ? -16 : 16, 0)),
            k.area(),
            k.rect(20, 20),
            k.opacity(0),
            k.anchor('bot'),
            k.lifespan(0.1),
          ]);

          hitbox.onCollide('enemy', (enemy: EnemyComp) => {
            enemy.registerHit(player);
          });

          hitbox.onDestroy(() => {
            hitbox = undefined; // reset hitbox reference
          });
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
      player.hp -= enemy.config.attackPower;
      player.applyImpulse(k.vec2(Math.sign(player.pos.x - enemy.pos.x) * 150, -230));
      invincibleTimer?.cancel();
      invincibleTimer = player.wait(1);
      invincibleTimer.onEnd(() => {
        invincibleTimer = undefined;
      });
    }
  });

  player.onDeath(() => {
    window.location.reload();
  });

  return player;
}

function moveTowards(current: number, target: number, increment: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= increment) return target;

  return current + Math.sign(target) * increment;
}
