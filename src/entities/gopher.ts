import {Vec2} from 'kaplay';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';
import {EnemyComp, EnemyConfig} from './generic/enemy';
import {PlayerComp} from './player';

enum State {
  IDLE = 'IDLE',
  WALK = 'WALK',
}

export function createGopher(k: KCtx, posXY: Vec2 = k.vec2(100, 100), cfg?: Partial<EnemyConfig>): EnemyComp {
  const C: EnemyConfig = {
    health: 2,
    attackPower: 1,
    speedX: 50,
    ...cfg,
  };

  let direction = -1; // 1 for right, -1 for left
  let isFirstWalk = true;

  k.loadSprite('gopher', 'sprites/enemies/gopher.gif', {
    sliceX: 4,
    sliceY: 1,
    anims: {
      idle: {from: 0, to: 0, loop: false},
      walk: {from: 0, to: 3, speed: 10, loop: true},
    },
  });

  const mainObj = k.add([
    'gopher',
    'enemy', // tag for easy access
    k.sprite('gopher', {anim: 'idle'}),
    k.state(State.WALK, [State.IDLE, State.WALK]),
    k.health(C.health, C.health),
    k.timer(),
    k.pos(posXY),
    k.area(defaultFriction),
    k.body(),
    k.anchor('bot'),
    k.offscreen({pause: true, unpause: true, hide: true}),
    {
      registerHit: (player: PlayerComp) => {
        mainObj.applyImpulse(k.vec2(Math.sign(mainObj.pos.x - player.pos.x) * 100, -200));
        mainObj.hp -= player.config.attackPower;
      },
      config: C,
    },
  ]);

  mainObj.onStateEnter(State.WALK, async () => {
    mainObj.flipX = direction < 0; // flip sprite based on direction
    mainObj.play('walk');
    await mainObj.wait(4 * (isFirstWalk ? 0.5 : 1)); // Half duration for the first walk
    isFirstWalk = false; // After the first walk, use full duration
    mainObj.enterState(State.IDLE);
  });

  mainObj.onStateUpdate(State.WALK, () => {
    if (mainObj.isGrounded()) {
      mainObj.move(C.speedX * direction, 0);
    }
  });

  mainObj.onStateEnter(State.IDLE, async () => {
    mainObj.play('idle');
    await mainObj.wait(2);

    if (!mainObj.dead) {
      direction *= -1; // change direction
      mainObj.enterState(State.WALK);
    }
  });

  mainObj.onDeath(() => {
    mainObj.paused = true;
    mainObj.collisionIgnore = ['*'];
    mainObj.use(k.rotate(mainObj.flipX ? 10 : -10));
  });

  mainObj.onExitScreen(() => {
    if (mainObj.dead) {
      mainObj.destroy();
    }
  });

  return mainObj;
}
