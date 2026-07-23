import {Comp, CompList} from 'kaplay';
import {TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';

export const tileDirectionSignLeft: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([k.loadSprite('direction-sign', 'sprites/tiles/direction-sign.png')]);
  },

  factory({k}): CompList<Comp> | void {
    return [
      //
      k.sprite('direction-sign', {flipX: true}),
      k.anchor('botleft'),
    ];
  },
};
