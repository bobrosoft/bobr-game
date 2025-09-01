import {addBackground} from '../components/addBackground';
import {addLevel} from '../components/addLevel';
import {BumblebeeEntity} from '../entities/bumblebee';
import {GopherEntity} from '../entities/gopher';
import {HomeEntity} from '../entities/home';
import {OldBobrEntity} from '../entities/old-bobr';
import {KCtx} from '../kaplay';
import {bgMusicManager} from '../main';
import {defaultFriction} from '../misc/defaults';
import map from './maps/home.txt?raw';

export const sceneLevelHome = async (k: KCtx) => {
  const {player} = await addLevel(k, map, {
    preloadResources: async (k: KCtx) => {
      // Preload assets
      await Promise.all([
        k.loadSprite('tile-ground', 'sprites/tiles/ground.png'),
        k.loadSprite('tile-grass-ground', 'sprites/tiles/grass-ground.png'),
        k.loadSprite('tile-grass-ground-air', 'sprites/tiles/grass-ground-air.png'),
        k.loadSprite('tile-grass-ground-air-left', 'sprites/tiles/grass-ground-air-left.png'),
        k.loadSprite('tile-grass-ground-air-right', 'sprites/tiles/grass-ground-air-right.png'),
        k.loadSprite('tile-grass-ground-inclined-left-1', 'sprites/tiles/grass-ground-inclined-left-1.png'),
        k.loadSprite('tile-grass-ground-inclined-left-2', 'sprites/tiles/grass-ground-inclined-left-2.png'),
        k.loadSprite('tile-grass-ground-inclined-left-3', 'sprites/tiles/grass-ground-inclined-left-3.png'),
        k.loadSprite('tile-grass-1', 'sprites/tiles/grass-1.png'),
        k.loadSprite('tile-grass-2', 'sprites/tiles/grass-2.png'),
        k.loadSprite('tile-grass-3', 'sprites/tiles/grass-3.png'),
        k.loadSprite('tile-tree-1', 'sprites/tiles/tree-1.png'),
        k.loadSprite('tile-tree-2', 'sprites/tiles/tree-2.png'),
        k.loadSprite('rock', 'sprites/tiles/rock.png'),

        GopherEntity.loadResources(k),
        BumblebeeEntity.loadResources(k),
        HomeEntity.loadResources(k),
        OldBobrEntity.loadResources(k),
      ]);

      // Define music
      bgMusicManager.loadMusic('home', 'music/home.mp3');
      bgMusicManager.loadMusic('start-location', 'music/start-location.mp3');
    },
    tileWidth: 32,
    tileHeight: 32,
    tiles: {
      '=': () => [
        // Ground-grass tile
        k.sprite('tile-grass-ground'),
        k.area(defaultFriction),
        k.body({isStatic: true}),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ],
      '-': (tilePos, worldPos, getSiblings) => {
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
          // k.sprite('tile-grass-ground-air'),
          k.area({...defaultFriction, shape: new k.Rect(k.vec2(0, -8), 32, 24)}),
          k.body({isStatic: true}),
          k.anchor('bot'),
          k.offscreen({hide: true}),
        ];
      },
      '.': (tilePos, worldPos, getSiblings) => {
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
      ',': () => [
        // Grass tile
        k.sprite(k.choose(['tile-grass-1', 'tile-grass-2', 'tile-grass-3']), {flipX: k.choose([true, false])}),
        k.z(k.choose([1, -1])),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ],
      '/': (tilePos, worldPos, getSiblings) => {
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
      '\\': (tilePos, worldPos, getSiblings) => {
        const siblings = getSiblings();
        if (siblings.right === '\\') {
          return [
            'obstacle',
            k.sprite('tile-grass-ground-inclined-left-3', {flipX: true}),
            k.area({
              ...defaultFriction,
              shape: new k.Polygon([
                //
                k.vec2(16, 0),
                k.vec2(16, -16),
                k.vec2(-16, -32),
                k.vec2(-16, 0),
              ]),
            }),
            k.body({isStatic: true}),
            k.anchor('bot'),
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
              k.vec2(16, 0),
              k.vec2(-16, -16),
              k.vec2(-16, 0),
              k.vec2(16, 16),
            ]),
          }),
          k.body({isStatic: true}),
          k.anchor('bot'),
          k.offscreen({hide: true}),
        ];
      },
      t: () => [
        // Tree tile
        k.sprite(k.choose(['tile-tree-1', 'tile-tree-2']), {flipX: k.choose([true, false])}),
        k.z(k.choose([1, -1])),
        k.anchor('bot'),
        k.offscreen({hide: true}),
      ],
      r: () => [
        // Rock tile
        'obstacle',
        k.sprite('rock', {flipX: k.choose([true, false])}),
        k.anchor('bot'),
        k.area(defaultFriction),
        k.body({mass: 2}),
        k.offscreen({hide: true}),
      ],
      G: (tilePos, worldPos) => {
        // Gopher enemy
        GopherEntity.spawn(k, worldPos);
      },
      F: (tilePos, worldPos) => {
        // Bumblebee enemy
        BumblebeeEntity.spawn(k, worldPos);
      },
      H: (tilePos, worldPos) => {
        // Home
        HomeEntity.spawn(k, worldPos);
      },
      B: (tilePos, worldPos) => {
        // Old Bobr
        OldBobrEntity.spawn(k, worldPos);
      },
    },
  });

  await k.loadSprite('bg-home-day', 'sprites/backgrounds/home-day.png');
  addBackground(k, 'bg-home-day', player, {offsetY: 40});

  bgMusicManager.playMusic('start-location');

  // Make camera follow the player
  player.onUpdate(() => {
    if (!player) {
      return;
    }

    const x = Math.max(player.pos.x, k.width() / 2);
    const y = player.pos.y - k.height() / 4;
    k.setCamPos(x, y);
  });
};

sceneLevelHome.id = 'level-home';