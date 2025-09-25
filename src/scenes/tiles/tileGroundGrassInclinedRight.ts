import {TileFactory} from '../../components/addLevel';
import {k} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGroundGrassInclinedRight: TileFactory = (tilePos, worldPos, getSiblings) => {
  const siblings = getSiblings();
  if (siblings.right === '\\') {
    return [
      'obstacle',
      k.sprite('tile-grass-ground-inclined-left-3', {flipX: true}),
      k.area({
        ...defaultFriction,
        shape: new k.Polygon([
          //
          k.vec2(16, 0),
          k.vec2(16, -16),
          k.vec2(-16, -32),
          k.vec2(-16, 0),
        ]),
      }),
      k.body({isStatic: true}),
      k.anchor('bot'),
      k.offscreen({hide: true}),
    ];
  }

  return [
    'obstacle',
    k.sprite('tile-grass-ground-inclined-left-2', {flipX: true}),
    k.area({
      ...defaultFriction,
      shape: new k.Polygon([
        //
        k.vec2(16, 0),
        k.vec2(-16, -16),
        k.vec2(-16, 0),
        k.vec2(16, 16),
      ]),
    }),
    k.body({isStatic: true}),
    k.anchor('bot'),
    k.offscreen({hide: true}),
  ];
};
