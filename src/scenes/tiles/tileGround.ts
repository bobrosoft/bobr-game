import {Comp, CompList, Vec2} from 'kaplay';
import {SiblingTiles, TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGround: TileEntity = {
  async loadResources(k: KCtx): Promise<void> {
    await k.loadSprite('tile-grass-ground-inclined-left-1', 'sprites/tiles/grass-ground-inclined-left-1.png');
    await k.loadSprite('tile-ground', 'sprites/tiles/ground.png');
  },

  factory(
    k: KCtx,
    tilePos: Vec2,
    worldPos: Vec2,
    getSiblings: () => SiblingTiles,
    charAt: (x: number, y: number) => string,
  ): CompList<Comp> | void {
    const siblings = getSiblings();
    if (siblings.topRight === '/') {
      // Special ground case for inclined surfaces
      return [
        //
        'obstacle',
        k.sprite('tile-grass-ground-inclined-left-1'),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ];
    }

    if (siblings.topLeft === '\\') {
      // Special ground case for inclined surfaces
      return [
        //
        'obstacle',
        k.sprite('tile-grass-ground-inclined-left-1', {flipX: true}),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ];
    }

    const needCollisions =
      siblings.left === ' ' || siblings.right === ' ' || siblings.bottom === ' ' || siblings.left === '';

    return [
      // Ground tile
      'obstacle',
      k.sprite('tile-ground'),
      ...(needCollisions ? [k.area(defaultFriction), k.body({isStatic: true})] : []),
      k.anchor('bot'),
      k.offscreen({hide: true}),
    ];
  },
};
