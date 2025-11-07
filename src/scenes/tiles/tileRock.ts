import {Comp, CompList, Vec2} from 'kaplay';
import {SiblingTiles, TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileRock: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('rock', 'sprites/tiles/rock.png'),
    ]);
  },

  factory(
    k: KCtx,
    tilePos: Vec2,
    worldPos: Vec2,
    getSiblings: () => SiblingTiles,
    charAt: (x: number, y: number) => string,
  ): CompList<Comp> | void {
    return [
      // Rock tile
      'obstacle',
      k.sprite('rock', {flipX: k.choose([true, false])}),
      k.anchor('bot'),
      k.area(defaultFriction),
      k.body({mass: 2}),
      k.offscreen({hide: true}),
    ];
  },
};
