import {Vec2} from 'kaplay';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';
import {EnemyComp, EnemyConfig} from './generic/enemy';
import {GameEntity} from './generic/entity';
import {PlayerComp} from './player';

enum State {
  IDLE = 'IDLE',
  ALARM = 'ALARM',
  RUN = 'RUN',
  BREAK = 'BREAK',
  DEAD = 'DEAD',
}

interface Config extends EnemyConfig {
  detectionRange: number; // distance to detect player
  alarmDuration: number; // seconds in alarm state
  breakDuration: number; // seconds in break state
  maxSpeed: number; // maximum running speed
  acceleration: number; // acceleration rate when running
  deceleration: number; // deceleration rate when breaking
}

export const BoarEntity: GameEntity<Config, EnemyComp> = {
  async loadResources(k: KCtx): Promise<void> {
    await k.loadSprite('boar', 'sprites/enemies/boar.gif', {
      sliceX: 2,
      sliceY: 4,
      anims: {
        idle: {from: 0, to: 0},
        alarm: {from: 2, to: 2},
        run: {from: 4, to: 5, speed: 12, loop: true},
        break: {from: 6, to: 6},
      },
    });
    await k.loadSprite('particle-ground', 'sprites/particles/ground.png', {
      sliceX: 2,
      sliceY: 1,
    });

    await k.loadSound('boar-alarm', 'sounds/boar-squeal.mp3');
    await k.loadSound('boar-break', 'sounds/boar-break.mp3');
  },

  spawn(k: KCtx, posXY: Vec2 = k.vec2(100, 100), config?: Partial<Config>): EnemyComp {
    const C: Config = {
      health: 5,
      attackPower: 1,
      knockbackPower: k.vec2(250, -230),
      detectionRange: 150,
      alarmDuration: 0.8,
      breakDuration: 1.3,
      maxSpeed: 220, // max horizontal speed
      acceleration: 400, // pixels per second squared
      deceleration: 300, // pixels per second squared

      // For debugging
      // ...{
      //   detectionRange: 10,
      //   health: 1,
      // },
      ...config,
    };

    let direction = -1; // 1 for right, -1 for left
    let currentSpeed = 0;
    let player: PlayerComp | null = null;

    const mainObj = k.add([
      'boar',
      'enemy',
      k.sprite('boar', {anim: 'idle'}),
      k.state(State.IDLE, [State.IDLE, State.ALARM, State.RUN, State.BREAK, State.DEAD]),
      k.health(C.health, C.health),
      k.timer(),
      k.pos(posXY),
      k.area({...defaultFriction, shape: new k.Rect(k.vec2(0, 0), 50, 40)}),
      k.body({mass: 2}),
      k.anchor('bot'),
      k.offscreen(),
      {
        registerHit: (player: PlayerComp) => {
          mainObj.applyImpulse(k.vec2(Math.sign(mainObj.pos.x - player.pos.x) * 150, 0));
          mainObj.hp -= player.config.attackPower;
        },
        config: C,
      },
    ]);

    // Add particles generator for clumps of dirt
    const particlesEmitter = mainObj.add([
      k.particles(
        {
          max: 20,
          speed: [100, 60],
          lifeTime: [0.75, 1.0],
          angle: [0, 360],
          angularVelocity: [0, 30],
          opacities: [1.0, 1.0, 0.0],
          texture: k.getSprite('particle-ground').data.tex, // texture of a sprite
          quads: k.getSprite('particle-ground').data.frames, // frames of a sprite
        },
        {
          // rate: 5,
          position: k.vec2(0, 0),
          direction: -15,
          spread: 15,
        },
      ),
    ]);

    function getPlayer(): PlayerComp | null {
      if (player) return player;

      player = k.get('player')[0] as PlayerComp | undefined;
      return player;
    }

    // Helper function to find player
    function detectPlayer(): PlayerComp | null {
      const player = getPlayer();
      if (!player) return null;

      const distance = mainObj.pos.dist(player.pos);
      if (distance <= C.detectionRange) {
        return player;
      }

      return null;
    }

    mainObj.onStateEnter(State.IDLE, async () => {
      mainObj.play('idle');
      mainObj.flipX = direction < 0;
    });

    mainObj.onStateUpdate(State.IDLE, () => {
      if (mainObj.dead) {
        return;
      }

      const player = detectPlayer();

      if (player) {
        direction = player.pos.x > mainObj.pos.x ? 1 : -1;
        mainObj.enterState(State.ALARM);
      }
    });

    mainObj.onStateEnter(State.ALARM, async () => {
      mainObj.flipX = direction < 0;
      mainObj.play('alarm');
      k.play('boar-alarm');
      mainObj.applyImpulse(k.vec2(0, -150));
      await mainObj.wait(C.alarmDuration);

      if (!mainObj.dead) {
        mainObj.enterState(State.RUN);
      }
    });

    mainObj.onStateEnter(State.RUN, () => {
      mainObj.play('run');
      particlesEmitter.emitter.direction = direction < 0 ? -15 : 180 + 15;
    });

    mainObj.onStateEnter(State.BREAK, async () => {
      mainObj.play('break');
      k.play('boar-break');

      await mainObj.wait(C.breakDuration);

      if (!mainObj.dead) {
        mainObj.enterState(State.IDLE);
      }
    });

    mainObj.onStateUpdate(State.DEAD, () => {
      // In DEAD state boar becomes a rock which player can move :)
      mainObj.untag('enemy'); // to prevent player from damage
      mainObj.play('break');
    });

    mainObj.onFixedUpdate(() => {
      if (mainObj.state === State.RUN) {
        // Check if reached target
        const deltaX = player.pos.x - mainObj.pos.x;
        if ((direction > 0 && deltaX < 5) || (direction < 0 && deltaX > -5)) {
          mainObj.enterState(State.BREAK);
          return;
        }

        // Accelerate towards target
        if (currentSpeed < C.maxSpeed) {
          currentSpeed = k.clamp(currentSpeed + C.acceleration * k.dt(), 0, C.maxSpeed);
          mainObj.move(direction * currentSpeed, 0);
        } else {
          mainObj.move(direction * C.maxSpeed, 0);
        }

        // Emit particles only when boar runs fast enough
        if (currentSpeed > C.maxSpeed / 5) {
          // Rhythmically emit particles, not on every frame
          if (Math.round(k.time() * 10) % 4 === 0) {
            particlesEmitter.emit(1);
          }
        }
      } else if (mainObj.state === State.BREAK || mainObj.state === State.DEAD) {
        // Decelerate to zero
        if (currentSpeed > 0) {
          currentSpeed = k.clamp(currentSpeed - C.deceleration * k.dt(), 0, C.maxSpeed);
          mainObj.move(direction * currentSpeed, 0);

          // Emit particles only when boar breaks with enough speed
          if (currentSpeed > C.maxSpeed / 10) {
            particlesEmitter.emit(1);
          }
        }
      }
    });

    mainObj.onCollide('player', () => {
      // Need to go into BREAK state after hit the player
      if (!mainObj.dead) {
        mainObj.enterState(State.BREAK);
      }
    });

    mainObj.onDeath(() => {
      mainObj.enterState(State.DEAD);
    });

    return mainObj;
  },
};
