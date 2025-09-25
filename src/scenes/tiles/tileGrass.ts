import {TileFactory} from '../../components/addLevel';
import {k} from '../../kaplay';

export const tileGrass: TileFactory = () => [
  // Grass tile
  k.sprite(k.choose(['tile-grass-1', 'tile-grass-2', 'tile-grass-3']), {flipX: k.choose([true, false])}),
  k.z(k.choose([1, -1])),
  k.anchor('bot'),
  k.offscreen({hide: true}),
];
