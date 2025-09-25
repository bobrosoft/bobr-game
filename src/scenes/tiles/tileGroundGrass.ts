import {TileFactory} from '../../components/addLevel';
import {k} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGroundGrass: TileFactory = () => [
  // Ground-grass tile
  k.sprite('tile-grass-ground'),
  k.area(defaultFriction),
  k.body({isStatic: true}),
  k.anchor('bot'),
  k.offscreen({hide: true}),
];
