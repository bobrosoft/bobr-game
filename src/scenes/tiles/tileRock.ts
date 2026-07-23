import {Comp, CompList} from 'kaplay';
import {TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileRock: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([k.loadSprite('rock', 'sprites/tiles/rock.png')]);
  },

  factory({k}): CompList<Comp> | void {
    return [
      // Rock tile
      'obstacle',
      k.sprite('rock', {flipX: k.choose([true, false])}),
      k.anchor('botleft'),
      k.area(defaultFriction),
      k.body({mass: 2}),
      k.offscreen({hide: true}),
    ];
  },
};
