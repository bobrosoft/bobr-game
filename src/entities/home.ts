import {GameObj, Vec2} from 'kaplay';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';

enum State {
  INSIDE = 'INSIDE',
  OUTSIDE = 'OUTSIDE',
}

export function createHome(k: KCtx, posXY: Vec2) {
  k.loadSprite('home-outside', 'sprites/home/home-outside.png');
  k.loadSprite('home-inside', 'sprites/home/home-inside.png');
  k.loadSprite('home-fence', 'sprites/home/home-fence.png');

  const container = k.add([
    //
    'home-container',
    k.pos(posXY),
    k.anchor('botleft'),
    k.offscreen({hide: true, pause: true, unpause: true, distance: 300}),
    k.state(State.OUTSIDE, [State.INSIDE, State.OUTSIDE]),
  ]);

  // Add fence
  container.add([
    //
    k.sprite('home-fence'),
    k.pos(206, 0),
    k.anchor('botleft'),
  ]);

  // Add home inside
  const inside = container.add([
    //
    'home-outside',
    k.sprite('home-inside'),
    k.anchor('botleft'),
  ]);

  // Add home outside
  const outside = container.add([
    //
    'home-outside',
    k.sprite('home-outside'),
    k.anchor('botleft'),
    k.animate({relative: true}),
    k.z(1),
  ]);

  addCollisionWalls(k, container);

  container.onStateEnter(State.OUTSIDE, () => {
    outside.unanimateAll();
    outside.animation.seek(0);
    outside.animate('opacity', [0, 1], {duration: 1, loops: 1});
  });

  container.onStateEnter(State.INSIDE, () => {
    outside.unanimateAll();
    outside.animation.seek(0);
    outside.animate('opacity', [1, 0], {duration: 1, loops: 1});
  });

  // 180, 25x38
  // Add entrance collision detection
  const entrance = container.add([
    'home-entrance',
    k.rect(20, 38, {fill: false}),
    k.pos(125, 0),
    k.anchor('botleft'),
    k.area(),
  ]);
  entrance.onCollide('player', () => {
    if (container.state !== State.INSIDE) {
      container.enterState(State.INSIDE);
    }
  });

  // Add exit collision detection
  const exit = container.add([
    'home-exit',
    k.rect(20, 38, {fill: false}),
    k.pos(214, 0),
    k.anchor('botleft'),
    k.area(),
  ]);
  exit.onCollide('player', () => {
    if (container.state !== State.OUTSIDE) {
      container.enterState(State.OUTSIDE);
    }
  });

  return container;
}

function addCollisionWalls(k: KCtx, container: GameObj) {
  // Add necessary collision walls near entrance
  container.add([
    // to prevent jump on home entrance
    k.rect(14, 200, {fill: false}),
    k.pos(193, -42),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);
  container.add([
    // to prevent just through home entrance
    k.rect(40, 12, {fill: false}),
    k.pos(156, -42),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);

  // Add left wall
  container.add([
    //
    k.rect(10, 220, {fill: false}),
    k.pos(-10, 0),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);

  // Add right wall polys
  container.add([
    k.polygon(
      [
        //
        k.vec2(178, -54),
        k.vec2(115, -193),
        k.vec2(125, -193),
        k.vec2(188, -54),
      ],
      {fill: false},
    ),
    k.pos(-5, 0),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);
  container.add([
    k.polygon(
      [
        //
        k.vec2(115, -193),
        k.vec2(50, -221),
        k.vec2(50, -230),
        k.vec2(125, -193),
      ],
      {fill: false},
    ),
    k.pos(-5, 0),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);
  container.add([
    k.polygon(
      [
        //
        k.vec2(50, -221),
        k.vec2(0, -221),
        k.vec2(0, -230),
        k.vec2(50, -230),
      ],
      {fill: false},
    ),
    k.pos(-5, 0),
    k.anchor('botleft'),
    k.area(),
    k.body({isStatic: true}),
  ]);

  // Add floor for second floor
  container.add([
    //
    k.rect(120, 7, {fill: false}),
    k.pos(57, -58),
    k.anchor('botleft'),
    k.area(defaultFriction),
    k.body({isStatic: true}),
  ]);

  // Add floor for third floor
  container.add([
    //
    k.rect(95, 7, {fill: false}),
    k.pos(0, -122),
    k.anchor('botleft'),
    k.area(defaultFriction),
    k.body({isStatic: true}),
  ]);

  // // Add floor for second floor
  // container.add([
  //   //
  //   k.rect(120, 8, {fill: false}),
  //   k.pos(57, -58),
  //   k.anchor('botleft'),
  //   k.area(defaultFriction),
  //   k.body({isStatic: true}),
  //   k.platformEffector({ignoreSides: [k.UP, k.LEFT, k.RIGHT]}),
  // ]);
  //
  // // Add floor for third floor
  // container.add([
  //   //
  //   k.rect(95, 8, {fill: false}),
  //   k.pos(0, -122),
  //   k.anchor('botleft'),
  //   k.area(defaultFriction),
  //   k.body({isStatic: true}),
  //   k.platformEffector({ignoreSides: [k.UP, k.LEFT, k.RIGHT]}),
  // ]);
}
