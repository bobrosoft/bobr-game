import {TileFactory} from '../../components/addLevel';
import {k} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGroundGrassAir: TileFactory = (tilePos, worldPos, getSiblings) => {
  const siblings = getSiblings();

  return [
    'obstacle',
    // Ground-grass-air tile
    k.sprite(
      siblings.left === ' '
        ? 'tile-grass-ground-air-left'
        : siblings.right === ' '
          ? 'tile-grass-ground-air-right'
          : 'tile-grass-ground-air',
    ),
    // k.sprite('tile-grass-ground-air'),
    k.area({...defaultFriction, shape: new k.Rect(k.vec2(0, -8), 32, 24)}),
    k.body({isStatic: true}),
    k.anchor('bot'),
    k.offscreen({hide: true}),
  ];
};
