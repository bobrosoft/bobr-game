import {Comp, CompList, Vec2} from 'kaplay';
import {SiblingTiles, TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';

export const tileGrass: TileEntity = {
  async loadResources(k: KCtx): Promise<void> {
    await k.loadSprite('tile-grass-1', 'sprites/tiles/grass-1.png');
    await k.loadSprite('tile-grass-2', 'sprites/tiles/grass-2.png');
    await k.loadSprite('tile-grass-3', 'sprites/tiles/grass-3.png');
  },

  factory(
    k: KCtx,
    tilePos: Vec2,
    worldPos: Vec2,
    getSiblings: () => SiblingTiles,
    charAt: (x: number, y: number) => string,
  ): CompList<Comp> | void {
    return [
      // Grass tile
      k.sprite(k.choose(['tile-grass-1', 'tile-grass-2', 'tile-grass-3']), {flipX: k.choose([true, false])}),
      k.z(k.choose([1, -1])),
      k.anchor('bot'),
      k.offscreen({hide: true}),
    ];
  },
};
