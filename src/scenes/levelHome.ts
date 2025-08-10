import {createGopher} from '../entities/gopher';
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

  // Add gopher enemy
  createGopher(k, k.vec2(600, k.height() - 100));
  createGopher(k, k.vec2(800, k.height() - 100));

  const player = createPlayer(k, k.vec2(420, 0));

  // Make camera follow the player
  k.onUpdate(() => {
    k.setCamPos(Math.max(player.pos.x, k.width() / 2), player.pos.y - k.height() / 4);
  });
};
