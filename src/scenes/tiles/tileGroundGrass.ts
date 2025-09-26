import {Comp, CompList, Vec2} from 'kaplay';
import {SiblingTiles, TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGroundGrass: TileEntity = {
  async loadResources(k: KCtx): Promise<void> {
    await k.loadSprite('tile-grass-ground', 'sprites/tiles/grass-ground.png');
  },

  factory(
    k: KCtx,
    tilePos: Vec2,
    worldPos: Vec2,
    getSiblings: () => SiblingTiles,
    charAt: (x: number, y: number) => string,
  ): CompList<Comp> | void {
    return [
      // Ground-grass tile
      k.sprite('tile-grass-ground'),
      k.area(defaultFriction),
      k.body({isStatic: true}),
      k.anchor('bot'),
      k.offscreen({hide: true}),
    ];
  },
};
