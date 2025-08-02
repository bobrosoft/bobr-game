import {BodyComp, GameObj, Vec2} from 'kaplay';
import {k} from '../kaplay';

type KCtx = typeof k;

export interface PlayerConfig {
  maxRunSpeed: number;
  accelGround: number;
  accelAir: number;
  decelGround: number;
  decelAir: number;
  jumpForce: number;
  minRunAnimSpeed: number;
  maxRunAnimSpeed: number;
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
};

enum State {
  idle = 'idle',
  walk = 'walk',
  jump = 'jump',
  fall = 'fall',
  attack = 'attack',
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

export function createPlayer(k: KCtx, posXY: Vec2 = k.vec2(100, 100), cfg?: Partial<PlayerConfig>) {
  const C = {...DEFAULTS, ...cfg};

  const player = k.add([
    'player', // tag for easy access
    k.sprite('player', {anim: 'idle'}),
    k.pos(posXY),
    k.area({shape: new k.Rect(k.vec2(1, 0), 20, 31)}), // custom area shape for better collision
    k.body(), // enables gravity + isGrounded()
    k.anchor('bot'),
    k.state(State.idle, [State.idle, State.walk, State.jump, State.fall, State.attack]),
    {
      id: 'playerCtrl',
      vx: 0, // horizontal velocity
      get moveDirection(): number {
        return (k.isButtonDown('right') ? 1 : 0) + (k.isButtonDown('left') ? -1 : 0);
      },
    },
  ]);

  function doJump() {
    player.jump(C.jumpForce);
    player.enterState(State.jump);
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
    if (player.state === State.attack) {
      return;
    }

    player.enterState(State.attack);
  });

  player.onUpdate(() => {
    const dt = k.dt();
    const onGround = player.isGrounded();

    // horizontal movement
    const direction = player.moveDirection;

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
    if (player.state !== State.attack) {
      if (!onGround) {
        if (player.vel.y < 0) {
          player.enterState(State.jump);
        } else {
          player.enterState(State.fall);
        }
      } else {
        if (Math.abs(player.vx) > 5) {
          player.enterState(State.walk);
        } else {
          player.enterState(State.idle);
        }
      }
    } else {
      // Check that we're on the right animation frame to trigger the hitbox
      if (player.getCurAnim()?.frameIndex === 2) {
        // Add hitbox for attack
        const hitbox = player.add([
          'player.hitbox',
          k.pos(k.vec2(player.flipX ? -16 : 16, 0)),
          k.area(),
          k.rect(20, 20),
          k.opacity(0),
          k.anchor('bot'),
          k.lifespan(0.1),
        ]);

        hitbox.onCollide('enemy', (enemy: GameObj<BodyComp>) => {
          enemy.applyImpulse(k.vec2(player.flipX ? -20 : 20, -100));
        });
      }
    }
  });

  player.onStateEnter(State.idle, () => {
    setAnim('idle');
  });

  player.onStateUpdate(State.walk, () => {
    setAnim('walk');

    const t = k.clamp(Math.abs(player.vx) / C.maxRunSpeed, 0, 1);
    player.animSpeed = k.lerp(C.minRunAnimSpeed, C.maxRunAnimSpeed, t);
  });

  player.onStateEnter(State.jump, () => {
    setAnim('jump');
  });

  player.onStateEnter(State.fall, () => {
    setAnim('fall');
  });

  player.onStateEnter(State.attack, () => {
    setAnim('attack', () => {
      player.enterState(State.idle); // return to idle after attack
    });
    player.animSpeed = 1;
  });

  return player;
}

function moveTowards(current: number, target: number, increment: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= increment) return target;

  return current + Math.sign(target) * increment;
}
