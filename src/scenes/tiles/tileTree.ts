import {TileFactory} from '../../components/addLevel';
import {k} from '../../kaplay';

export const tileTree: TileFactory = () => [
  // Tree tile
  k.sprite(k.choose(['tile-tree-1', 'tile-tree-2']), {flipX: k.choose([true, false])}),
  k.z(k.choose([1, -1])),
  k.anchor('bot'),
  k.offscreen({hide: true}),
];
