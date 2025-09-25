import {TileFactory} from '../../components/addLevel';
import {k} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGround: TileFactory = (tilePos, worldPos, getSiblings) => {
  const siblings = getSiblings();
  if (siblings.topRight === '/') {
    // Special ground case for inclined surfaces
    return [
      //
      'obstacle',
      k.sprite('tile-grass-ground-inclined-left-1'),
      k.anchor('bot'),
      k.offscreen({hide: true}),
    ];
  }

  if (siblings.topLeft === '\\') {
    // Special ground case for inclined surfaces
    return [
      //
      'obstacle',
      k.sprite('tile-grass-ground-inclined-left-1', {flipX: true}),
      k.anchor('bot'),
      k.offscreen({hide: true}),
    ];
  }

  const needCollisions =
    siblings.left === ' ' || siblings.right === ' ' || siblings.bottom === ' ' || siblings.left === '';

  return [
    // Ground tile
    'obstacle',
    k.sprite('tile-ground'),
    ...(needCollisions ? [k.area(defaultFriction), k.body({isStatic: true})] : []),
    k.anchor('bot'),
    k.offscreen({hide: true}),
  ];
};
