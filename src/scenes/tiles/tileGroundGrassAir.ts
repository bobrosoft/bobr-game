import {Comp, CompList} from 'kaplay';
import {TileEntity} from '../../components/addLevel';
import {KCtx} from '../../kaplay';
import {defaultFriction} from '../../misc/defaults';

export const tileGroundGrassAir: TileEntity = {
  async loadResources(k: KCtx): Promise<any> {
    return Promise.all([
      k.loadSprite('tile-grass-ground-air', 'sprites/tiles/grass-ground-air.png'),
      k.loadSprite('tile-grass-ground-air-left', 'sprites/tiles/grass-ground-air-left.png'),
      k.loadSprite('tile-grass-ground-air-right', 'sprites/tiles/grass-ground-air-right.png'),
    ]);
  },

  factory({k, getSiblings}): CompList<Comp> | void {
    const siblings = getSiblings();

    return [
      'obstacle',
      // Ground-grass-air tile
      k.sprite(
        siblings.left === ' '
          ? 'tile-grass-ground-air-left'
          : siblings.right === ' '
            ? 'tile-grass-ground-air-right'
            : 'tile-grass-ground-air',
      ),
      k.area({...defaultFriction, shape: new k.Rect(k.vec2(0, -8), 32, 24)}),
      k.body({isStatic: true}),
      k.anchor('botleft'),
      k.offscreen({hide: true}),
    ];
  },
};
