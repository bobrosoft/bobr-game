import {Comp, CompList, Vec2} from 'kaplay';
import {SiblingTiles, TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';

export const tileDirectionSignRight: TileEntity = {
  async loadResources(k: KCtx): Promise<void> {
    await k.loadSprite('direction-sign', 'sprites/tiles/direction-sign.png');
  },

  factory(
    k: KCtx,
    tilePos: Vec2,
    worldPos: Vec2,
    getSiblings: () => SiblingTiles,
    charAt: (x: number, y: number) => string,
  ): CompList<Comp> | void {
    return [
      //
      k.sprite('direction-sign'),
      k.anchor('bot'),
    ];
  },
};
