import {withFriction} from '../components/withFriction';
import {createHome} from '../entities/home';
import {createPlayer} from '../entities/player';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';

export const sceneLevelHome = (k: KCtx) => {
  k.setGravity(1000);

  // Create floor
  k.add([
    k.rect(1200, 20),
    k.pos(0, k.height()),
    k.color('#9e9303' as any),
    k.area(defaultFriction),
    k.anchor('topleft'),
    k.body({isStatic: true}), // static body for the ground
  ]);

  // Add home
  createHome(k, k.vec2(0, k.height()));

  // Add some boxes or platforms
  k.add([
    k.rect(100, 20),
    k.pos(400, k.height() - 60),
    k.color('#9e9303' as any),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);
  k.add([
    k.rect(100, 20),
    k.pos(550, k.height() - 100),
    k.color('#9e9303' as any),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);
  k.add([
    k.rect(100, 20),
    k.pos(800, k.height() - 150),
    k.color('#9e9303' as any),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);

  // Add enemy
  const enemy = k.add([
    'enemy',
    k.pos(430, k.height() - 100),
    k.rect(30, 30),
    k.color('#0000ff' as any),
    k.outline(2),
    k.area(),
    k.body(),
    k.anchor('bot'),
    withFriction(k),
    k.offscreen({destroy: true}),
  ]);

  const player = createPlayer(k, k.vec2(420, 0));

  // Make camera follow the player
  k.onUpdate(() => {
    k.setCamPos(Math.max(player.pos.x, k.width() / 2), player.pos.y - k.height() / 4);
  });
};
