import {Rect, Vec2} from 'kaplay';
import {createBumblebee} from '../entities/bumblebee';
import {createGopher} from '../entities/gopher';
import {createHome} from '../entities/home';
import {createOldBobr} from '../entities/old-bobr';
import {createPlayer, PlayerComp} from '../entities/player';
import {KCtx} from '../kaplay';
import {defaultFriction} from '../misc/defaults';
import map from './maps/home.txt?raw';

export const sceneLevelHome = (k: KCtx) => {
  k.setGravity(1000);

  k.loadSprite('tile-ground', 'sprites/tiles/ground.png');
  k.loadSprite('tile-grass-ground', 'sprites/tiles/grass-ground.png');
  k.loadSprite('tile-grass-ground-air', 'sprites/tiles/grass-ground-air.png');
  k.loadSprite('tile-grass-1', 'sprites/tiles/grass-1.png');
  k.loadSprite('tile-grass-2', 'sprites/tiles/grass-2.png');
  k.loadSprite('tile-grass-3', 'sprites/tiles/grass-3.png');
  k.loadSprite('tile-tree-1', 'sprites/tiles/tree-1.png');
  k.loadSprite('tile-tree-2', 'sprites/tiles/tree-2.png');

  let player: PlayerComp;

  const level = k.addLevel(map.split('\n'), {
    pos: k.vec2(0, 0),
    tileWidth: 32,
    tileHeight: 32,
    tiles: {
      P: (pos: Vec2) => {
        // Player entry point
        player = createPlayer(k, pos.scale(32));
        return undefined;
      },
      '=': () => [
        // Ground-grass tile
        k.sprite('tile-grass-ground'),
        k.area(defaultFriction),
        k.body({isStatic: true}),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ],
      '-': () => [
        // Ground-grass-air tile
        k.sprite('tile-grass-ground-air'),
        k.area({...defaultFriction, shape: new k.Rect(k.vec2(0, -8), 32, 24)}),
        k.body({isStatic: true}),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ],
      '.': () => [
        // Ground tile
        k.sprite('tile-ground'),
        k.area(defaultFriction),
        k.body({isStatic: true}),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ],
      ',': () => [
        // Grass tile
        k.sprite(k.choose(['tile-grass-1', 'tile-grass-2', 'tile-grass-3']), {flipX: k.choose([true, false])}),
        k.z(k.choose([1, -1])),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ],
      t: () => [
        // Tree tile
        k.sprite(k.choose(['tile-tree-1', 'tile-tree-2']), {flipX: k.choose([true, false])}),
        k.z(k.choose([1, -1])),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ],
      G: (pos: Vec2) => {
        // Gopher enemy
        createGopher(k, pos.scale(32));
        return undefined;
      },
      F: (pos: Vec2) => {
        // Gopher enemy
        createBumblebee(k, pos.scale(32));
        return undefined;
      },
      H: (pos: Vec2) => {
        // Home
        createHome(k, pos.scale(32));
        return undefined;
      },
      B: (pos: Vec2) => {
        // Old Bobr
        createOldBobr(k, pos.scale(32));
        return undefined;
      },
    },
  });

  // Make camera follow the player
  k.onUpdate(() => {
    if (!player) {
      return;
    }

    k.setCamPos(Math.max(player.pos.x, k.width() / 2), player.pos.y - k.height() / 4);
  });
};
