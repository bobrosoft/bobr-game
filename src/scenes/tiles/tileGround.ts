import {Comp, CompList} from 'kaplay';
import {TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGround: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('tile-grass-ground-inclined-left-1', 'sprites/tiles/grass-ground-inclined-left-1.png'),
      k.loadSprite('tile-ground', 'sprites/tiles/ground.png'),
    ]);
  },

  factory({k, getSiblings}): CompList<Comp> | void {
    const siblings = getSiblings();
    if (siblings.topRight === '/') {
      // Special ground case for inclined surfaces
      return [
        //
        'obstacle',
        k.sprite('tile-grass-ground-inclined-left-1'),
        k.anchor('botleft'),
        k.offscreen({hide: true}),
      ];
    }

    if (siblings.topLeft === '\\') {
      // Special ground case for inclined surfaces
      return [
        //
        'obstacle',
        k.sprite('tile-grass-ground-inclined-left-1', {flipX: true}),
        k.anchor('botleft'),
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
      k.anchor('botleft'),
      k.offscreen({hide: true}),
    ];
  },
};
