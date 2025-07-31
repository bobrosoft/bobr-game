import {KAPLAYCtx} from 'kaplay';
import {withFriction} from '../components/withFriction';
import {createPlayer} from '../entities/player';

export const sceneLevel1 = (k:  KAPLAYCtx) => {
  k.setGravity(1000);
  
  // Create floor
  k.add([
    k.rect(k.width(), 20),
    k.pos(0, k.height() - 20),
    k.color('#9e9303' as any),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}), // static body for the ground
  ]);
  
  // Add some boxes or platforms
  k.add([
    k.rect(100, 20),
    k.pos(0, 340),
    k.color('#9e9303' as any),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);
  k.add([
    k.rect(100, 20),
    k.pos(150, k.height() - 100),
    k.color('#9e9303' as any),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);
  k.add([
    k.rect(100, 20),
    k.pos(400, k.height() - 150),
    k.color('#9e9303' as any),
    k.area(),
    k.anchor('top'),
    k.body({isStatic: true}),
  ]);
  
  // Add enemy
  const enemy = k.add([
    'enemy',
    k.pos(130, 300),
    k.rect(30, 30),
    k.color('#0000ff' as any),
    k.outline(2),
    k.area(),
    k.body(),
    k.anchor('bot'),
    withFriction(k),
    k.offscreen({destroy: true}),
  ]);
  
  // load your level / tiles etc.
  const player = createPlayer(k, k.vec2(120, 0));

  // camera follow (if you want)
  k.onUpdate(() => {
    k.setCamPos(player.pos);
  });
};