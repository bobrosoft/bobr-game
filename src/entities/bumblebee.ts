import {Vec2} from 'kaplay';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';
import {EnemyComp, EnemyConfig} from './generic/enemy';
import {GameEntity} from './generic/entity';
import {PlayerComp} from './player';

enum State {
  IDLE = 'IDLE',
  FLY = 'FLY',
}

interface Config extends EnemyConfig {
  flyDuration: number; // seconds
}

export const BumblebeeEntity: GameEntity<Config, EnemyComp> = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('bumblebee', 'sprites/enemies/bumblebee.gif', {
        sliceX: 2,
        sliceY: 1,
        anims: {
          idle: {from: 0, to: 1, speed: 20, loop: true},
          fly: {from: 0, to: 1, speed: 20, loop: true},
        },
      }),
    ]);
  },

  spawn(k: KCtx, posXY: Vec2 = k.vec2(200, 80), config?: Partial<Config>): EnemyComp {
    const C: Config = {
      health: 1,
      attackPower: 1,
      speedX: 70,
      flyDuration: 3,
      ...config,
    };

    let direction = -1; // 1 for right, -1 for left
    let flyTime = 0;
    let isFirstFly = true;

    const mainObj = k.add([
      'bumblebee',
      'enemy',
      k.sprite('bumblebee', {anim: 'idle'}),
      k.state(State.FLY, [State.IDLE, State.FLY]),
      k.health(C.health, C.health),
      k.timer(),
      k.pos(posXY),
      k.area({...defaultFriction, collisionIgnore: ['obstacle']}),
      k.body({gravityScale: 0}),
      k.anchor('center'),
      k.offscreen({pause: true, unpause: true, hide: true}),
      {
        registerHit: (player: PlayerComp) => {
          mainObj.applyImpulse(k.vec2(Math.sign(mainObj.pos.x - player.pos.x) * 180, -120));
          mainObj.hp -= player.config.attackPower;
        },
        config: C,
      },
    ]);

    function calcYOffset(speed: number, time: number): number {
      // Calculate vertical offset using a sine wave
      return Math.sin(time * speed) * -30; // Adjust amplitude as needed
    }

    mainObj.onStateEnter(State.FLY, async () => {
      mainObj.flipX = direction < 0;
      mainObj.play('fly');

      await mainObj.wait(C.flyDuration * (isFirstFly ? 0.5 : 1)); // Half duration for the first fly
      isFirstFly = false; // After the first fly, use full duration
      mainObj.enterState(State.IDLE);
    });

    mainObj.onStateUpdate(State.FLY, () => {
      flyTime += k.dt();
      mainObj.move(C.speedX * direction, calcYOffset(6, flyTime));
    });

    mainObj.onStateEnter(State.IDLE, async () => {
      mainObj.play('idle');
      await mainObj.wait(1.5);

      if (!mainObj.dead) {
        direction *= -1;
        mainObj.enterState(State.FLY);
      }
    });

    mainObj.onStateUpdate(State.IDLE, () => {
      flyTime += k.dt();
      mainObj.move(0, calcYOffset(12, flyTime));
    });

    mainObj.onDeath(() => {
      mainObj.paused = true;
      mainObj.gravityScale = 1; // Enable gravity on death
      mainObj.collisionIgnore = ['*'];
      mainObj.use(k.rotate(mainObj.flipX ? 15 : -15));
    });

    mainObj.onExitScreen(() => {
      if (mainObj.dead) {
        mainObj.destroy();
      }
    });

    return mainObj;
  },
};
