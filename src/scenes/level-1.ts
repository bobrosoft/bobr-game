import {KAPLAYCtx} from 'kaplay';
import {createPlayer} from '../entities/player';

export const sceneLevel1 = (k:  KAPLAYCtx) => {
  k.setGravity(1000);
  
  // Create floor
  k.add([
    k.rect(k.width(), 20),
    k.pos(0, k.height() - 20),
    k.color('#9e9303'),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}), // static body for the ground
  ]);
  
  // Add some boxes or platforms
  k.add([
    k.rect(100, 20),
    k.pos(0, 340),
    k.color('#9e9303'),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);
  k.add([
    k.rect(100, 20),
    k.pos(150, k.height() - 100),
    k.color('#9e9303'),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);
  k.add([
    k.rect(100, 20),
    k.pos(400, k.height() - 150),
    k.color('#9e9303'),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);
  
  // load your level / tiles etc.
  const player = createPlayer(k, k.vec2(120, 0));

  // camera follow (if you want)
  k.onUpdate(() => {
    k.setCamPos(player.pos);
  });
};