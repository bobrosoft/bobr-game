import {addBackground} from '../components/addBackground';
import {addFurnitureItem} from '../components/addFurnitureItem';
import {addLevel} from '../components/addLevel';
import {BumblebeeEntity} from '../entities/bumblebee';
import {ExitEntity} from '../entities/exit';
import {GopherEntity} from '../entities/gopher';
import {MapItemEntity} from '../entities/map-item';
import {OldBobrEntity} from '../entities/old-bobr';
import {KCtx} from '../kaplay';
import {bgMusicManager, gsm} from '../main';
import {sceneLevel_1_1} from './level-1-1';
import {sceneLevel_1_3} from './level-1-3';
import map from './maps/level-1-2.txt?raw';
import {tileGrass} from './tiles/tileGrass';
import {tileGround} from './tiles/tileGround';
import {tileGroundGrass} from './tiles/tileGroundGrass';
import {tileGroundGrassAir} from './tiles/tileGroundGrassAir';
import {tileGroundGrassInclinedLeft} from './tiles/tileGroundGrassInclinedLeft';
import {tileGroundGrassInclinedRight} from './tiles/tileGroundGrassInclinedRight';
import {tileRock} from './tiles/tileRock';
import {tileTree} from './tiles/tileTree';

export const sceneLevel_1_2 = async (k: KCtx) => {
  const {player, level} = await addLevel(k, map, {
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
        k.loadSprite('home-kitchen-chair-right', 'sprites/home/home-kitchen-chair-right.png'),

        ExitEntity.loadResources(k),
        GopherEntity.loadResources(k),
        BumblebeeEntity.loadResources(k),
        OldBobrEntity.loadResources(k),
        MapItemEntity.loadResources(k),
      ]);

      // Define music
      bgMusicManager.loadMusic('start-location', 'music/start-location.mp3');
    },
    tileWidth: 32,
    tileHeight: 32,
    tiles: {
      '=': tileGroundGrass,
      '-': tileGroundGrassAir,
      '.': tileGround,
      ',': tileGrass,
      '/': tileGroundGrassInclinedLeft,
      '\\': tileGroundGrassInclinedRight,
      t: tileTree,
      r: tileRock,
      G: (tilePos, worldPos) => {
        // Gopher enemy
        GopherEntity.spawn(k, worldPos);
      },
      F: (tilePos, worldPos) => {
        // Bumblebee enemy
        BumblebeeEntity.spawn(k, worldPos);
      },
      B: (tilePos, worldPos) => {
        // Old Bobr
        OldBobrEntity.spawn(k, worldPos, {flipX: true});
      },
      '1': (tilePos, worldPos) => {
        addFurnitureItem(k, {
          itemId: 'home-kitchen-chair-right',
          sprite: 'home-kitchen-chair-right',
          worldPos,
        });
      },
      // '2': (tilePos, worldPos) => {
      //   addFurnitureItem(k, {
      //     itemId: 'home-kitchen-table',
      //     sprite: 'home-kitchen-table',
      //     worldPos,
      //   });
      // },
    },
    exitPoints: [
      {
        currentMapExitIndex: 0,
        spawnOffsetTiles: k.vec2(2, 0),
        destLevel: sceneLevel_1_1.id,
        destLevelExitIndex: 0,
      },
      {
        currentMapExitIndex: 1,
        spawnOffsetTiles: k.vec2(-2, 0),
        destLevel: sceneLevel_1_3.id,
        destLevelExitIndex: 0,
      },
    ],
  });

  await k.loadSprite('bg-home-day', 'sprites/backgrounds/home-day.png');
  addBackground(k, 'bg-home-day', player, {offsetY: 40});

  bgMusicManager.playMusic('start-location');
  gsm.update({
    persistent: {
      currentLevel: sceneLevel_1_2.id,
    },
  });

  player.setCamFollowPlayer(level, {
    leftTilesPadding: 2, // to hide wall on the left and exit collision box
    rightTilesPadding: 2, // to hide wall on the right
    topTilesPadding: -5, // so we can see more on top
  });
};

sceneLevel_1_2.id = 'level-1-2';
