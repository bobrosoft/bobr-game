import {TimerController} from 'kaplay';
import {KCtx} from '../kaplay';

interface LeafsGeneratorComp {
  pause(): void;
  unpause(): void;
  spawnLeaf(): void;
}

export function addFlyingLeafs(
  k: KCtx,
  config?: {
    // Defines intensity of leafs generation
    intensity?: number;

    // Angle in degrees defining the axis along which leafs fly. 0 = horizontal (left → right).
    angle?: number;
  },
): LeafsGeneratorComp {
  let nextLeafTimer: TimerController;
  let isPaused = false;

  const C = {
    intensity: 1,
    angle: 10,
    ...config,
  };

  k.loadSprite('particle-leaf', 'sprites/particles/leaf.png');

  // Create dummy object so we can control effect lifetime
  const mainObj = k.add([
    'leafs-generator',
    {
      pause,
      unpause,
      spawnLeaf,
    },
  ]);
  mainObj.onDestroy(() => {
    nextLeafTimer?.cancel();
    nextLeafTimer = null;
  });

  spawnLeaf();

  function spawnLeaf() {
    const rad = (k.rand(C.angle - 5, C.angle + 5) * Math.PI) / 180;
    const forward = k.vec2(Math.cos(rad), Math.sin(rad));
    const perp = k.vec2(-Math.sin(rad), Math.cos(rad));

    // Spawn off-screen on the edge the leaf is coming from, based on dominant axis
    let screenPosX: number, screenPosY: number;
    if (Math.abs(forward.x) >= Math.abs(forward.y)) {
      // Horizontal dominant — spawn from left or right edge
      screenPosX = forward.x > 0 ? -20 : k.width() + 20;
      screenPosY = k.rand(k.height() * 0.1, k.height() * 0.9);
    } else {
      // Vertical dominant — spawn from top or bottom edge
      screenPosX = k.rand(k.width() * 0.1, k.width() * 0.9);
      screenPosY = forward.y > 0 ? -20 : k.height() + 20;
    }
    const initialPos = k.toWorld(k.vec2(screenPosX, screenPosY));

    const leaf = k.add([
      k.sprite('particle-leaf'),
      k.pos(initialPos),
      k.scale(k.rand(0.7, 1)),
      k.rotate(k.rand(0, 360)),
      k.layer('game'),
      k.offscreen({distance: 200, destroy: true}),
      {
        speed: k.rand(80, 200),
        amplitude: k.rand(5, 30),
        rotationSpeed: k.rand(-10, 60),
      },
    ]);

    const startTime = k.time();

    leaf.onUpdate(() => {
      const elapsed = k.time() - startTime;
      const waveOffset = k.wave(-leaf.amplitude, leaf.amplitude, k.time());
      leaf.pos = k.vec2(
        initialPos.x + forward.x * leaf.speed * elapsed + perp.x * waveOffset,
        initialPos.y + forward.y * leaf.speed * elapsed + perp.y * waveOffset,
      );
      leaf.angle = leaf.rotationSpeed * k.time();
    });

    // leaf.onDestroy(() => {
    // });

    // Setup next timer
    if (!isPaused) {
      nextLeafTimer = k.wait(k.rand(2 / C.intensity, 5 / C.intensity), spawnLeaf);
    }
  }

  function pause() {
    isPaused = true;
    nextLeafTimer?.cancel();
    nextLeafTimer = null;
  }

  function unpause() {
    isPaused = false;
    spawnLeaf();
  }

  return mainObj;
}

export function getLeafsGenerator(k: KCtx): LeafsGeneratorComp | undefined {
  return k.get<LeafsGeneratorComp>('leafs-generator').at(0);
}
