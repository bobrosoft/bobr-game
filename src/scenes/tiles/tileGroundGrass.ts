import {Comp, CompList} from 'kaplay';
import {TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGroundGrass: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([k.loadSprite('tile-grass-ground', 'sprites/tiles/grass-ground.png')]);
  },

  factory({k}): CompList<Comp> | void {
    return [
      // Ground-grass tile
      k.sprite('tile-grass-ground'),
      k.area(defaultFriction),
      k.body({isStatic: true}),
      k.anchor('botleft'),
      k.offscreen({hide: true}),
    ];
  },
};
