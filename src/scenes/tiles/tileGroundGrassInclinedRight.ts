import {Comp, CompList} from 'kaplay';
import {TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGroundGrassInclinedRight: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('tile-grass-ground-inclined-left-2', 'sprites/tiles/grass-ground-inclined-left-2.png'),
      k.loadSprite('tile-grass-ground-inclined-left-3', 'sprites/tiles/grass-ground-inclined-left-3.png'),
    ]);
  },

  factory({k, getSiblings}): CompList<Comp> | void {
    const siblings = getSiblings();
    if (siblings.right === '\\') {
      return [
        'obstacle',
        k.sprite('tile-grass-ground-inclined-left-3', {flipX: true}),
        k.area({
          ...defaultFriction,
          shape: new k.Polygon([
            //
            k.vec2(32, 0),
            k.vec2(32, -16),
            k.vec2(0, -32),
            k.vec2(0, 0),
          ]),
        }),
        k.body({isStatic: true}),
        k.anchor('botleft'),
        k.offscreen({hide: true}),
      ];
    }

    return [
      'obstacle',
      k.sprite('tile-grass-ground-inclined-left-2', {flipX: true}),
      k.area({
        ...defaultFriction,
        shape: new k.Polygon([
          //
          k.vec2(32, 0),
          k.vec2(0, -16),
          k.vec2(0, 0),
          k.vec2(32, 16),
        ]),
      }),
      k.body({isStatic: true}),
      k.anchor('botleft'),
      k.offscreen({hide: true}),
    ];
  },
};
