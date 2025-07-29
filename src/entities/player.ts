import {Vec2} from 'kaplay';
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
  maxRunSpeed: 300, // px/s
  accelGround: 300,
  accelAir: 150,
  decelGround: 600,
  decelAir: 300,
  jumpForce: 400,
  minRunAnimSpeed: 1, // anim speed multiplier
  maxRunAnimSpeed: 2,
};

enum AnimName {
  idle = 'idle',
  walk = 'walk',
  jump = 'jump',
  fall = 'fall',
}

k.loadSprite('player', '/sprites/characters/bobr.gif', {
  sliceX: 5,
  sliceY: 4,
  anims: {
    idle: {from: 0, to: 0},
    walk: {from: 5, to: 8, speed: 10, loop: true}, // speed here is frames per second
    jump: {from: 10, to: 10},
    fall: {from: 10, to: 10},
  },
});

export function createPlayer(k: KCtx, posXY: Vec2 = k.vec2(100, 100), cfg?: Partial<PlayerConfig>) {
  const C = {...DEFAULTS, ...cfg};

  const player = k.add([
    k.sprite('player', {anim: 'idle'}),
    k.pos(posXY),
    k.area({shape: new k.Rect(k.vec2(3, 0), 20, 31)}), // custom area shape for better collision
    k.body(), // enables gravity + isGrounded()
    k.anchor('bot'),
    k.state('idle', ['idle', 'walk', 'jump', 'fall']),
    {
      id: 'playerCtrl',
      vx: 0, // horizontal velocity
      get moveDirection(): number {
        return (k.isButtonDown('right') ? 1 : 0) +
          (k.isButtonDown('left') ? -1 : 0);
      },
    },
  ]);

  k.onButtonPress(['jump'], () => {
    // Allow jumping only if player is grounded
    if (player.isGrounded()) {
      doJump();
    }
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
        accel += (onGround ? C.decelGround : C.decelAir); // add deceleration to acceleration
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

    // animation state switches
    if (!onGround) {
      if (player.vel.y < 0) {
        setAnim(AnimName.jump);
      } else {
        setAnim(AnimName.fall);
      }
    } else {
      if (Math.abs(player.vx) > 5) {
        setAnim(AnimName.walk);
      } else {
        setAnim(AnimName.idle);
      }
    }

    // Change animation speed based on velocity
    if (player.getCurAnim()?.name === AnimName.walk) {
      const t = k.clamp(Math.abs(player.vx) / C.maxRunSpeed, 0, 1);
      player.animSpeed = k.lerp(C.minRunAnimSpeed, C.maxRunAnimSpeed, t);
    }
  });

  function doJump() {
    player.jump(C.jumpForce);
    setAnim(AnimName.jump);
  }

  function setAnim(name: AnimName) {
    if (player.getCurAnim()?.name !== name) player.play(name);
  }

  return player;
}

function moveTowards(current: number, target: number, maxDelta: number): number {
  const delta = target - current;
  if (Math.abs(delta) <= maxDelta) return target;

  return current + Math.sign(target) * maxDelta;
}