import {Comp, CompList, Vec2} from 'kaplay';
import {SiblingTiles, TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGroundGrassInclinedLeft: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('tile-grass-ground-inclined-left-2', 'sprites/tiles/grass-ground-inclined-left-2.png'),
      k.loadSprite('tile-grass-ground-inclined-left-3', 'sprites/tiles/grass-ground-inclined-left-3.png'),
    ]);
  },

  factory(
    k: KCtx,
    tilePos: Vec2,
    worldPos: Vec2,
    getSiblings: () => SiblingTiles,
    charAt: (x: number, y: number) => string,
  ): CompList<Comp> | void {
    const siblings = getSiblings();
    if (siblings.left === '/') {
      return [
        'obstacle',
        k.sprite('tile-grass-ground-inclined-left-3'),
        k.area({
          ...defaultFriction,
          shape: new k.Polygon([
            //
            k.vec2(-16, 0),
            k.vec2(-16, -16),
            k.vec2(16, -32),
            k.vec2(16, 0),
          ]),
        }),
        k.body({isStatic: true}),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ];
    }

    return [
      'obstacle',
      k.sprite('tile-grass-ground-inclined-left-2'),
      k.area({
        ...defaultFriction,
        shape: new k.Polygon([
          //
          k.vec2(-16, 0),
          k.vec2(16, -16),
          k.vec2(16, 0),
          k.vec2(-16, 16),
        ]),
      }),
      k.body({isStatic: true}),
      k.anchor('bot'),
      k.offscreen({hide: true}),
    ];
  },
};
