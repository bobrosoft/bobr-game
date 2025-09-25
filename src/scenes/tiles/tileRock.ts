import {TileFactory} from '../../components/addLevel';
import {k} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileRock: TileFactory = () => [
  // Rock tile
  'obstacle',
  k.sprite('rock', {flipX: k.choose([true, false])}),
  k.anchor('bot'),
  k.area(defaultFriction),
  k.body({mass: 2}),
  k.offscreen({hide: true}),
];
