import {Comp, CompList} from 'kaplay';
import {TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';

export const tileTree: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('tile-tree-1', 'sprites/tiles/tree-1.png'),
      k.loadSprite('tile-tree-2', 'sprites/tiles/tree-2.png'),
    ]);
  },

  factory({k}): CompList<Comp> | void {
    return [
      // Tree tile
      k.sprite(k.choose(['tile-tree-1', 'tile-tree-2']), {flipX: k.choose([true, false])}),
      k.z(k.choose([1, -1])),
      k.anchor('botleft'),
      k.offscreen({hide: true}),
    ];
  },
};
