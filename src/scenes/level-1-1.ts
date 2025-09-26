import {addBackground} from '../components/addBackground';
import {addFurnitureItem} from '../components/addFurnitureItem';
import {addLevel} from '../components/addLevel';
import {BumblebeeEntity} from '../entities/bumblebee';
import {GopherEntity} from '../entities/gopher';
import {HomeEntity} from '../entities/home';
import {MapItemEntity} from '../entities/map-item';
import {OldBobrEntity} from '../entities/old-bobr';
import {KCtx} from '../kaplay';
import {bgMusicManager} from '../main';
import {sceneLevel_1_2} from './level-1-2';
import map from './maps/level-1-1.txt?raw';
import {tileGrass} from './tiles/tileGrass';
import {tileGround} from './tiles/tileGround';
import {tileGroundGrass} from './tiles/tileGroundGrass';
import {tileGroundGrassAir} from './tiles/tileGroundGrassAir';
import {tileGroundGrassInclinedLeft} from './tiles/tileGroundGrassInclinedLeft';
import {tileGroundGrassInclinedRight} from './tiles/tileGroundGrassInclinedRight';
import {tileRock} from './tiles/tileRock';
import {tileTree} from './tiles/tileTree';

export const sceneLevel_1_1 = async (k: KCtx) => {
  const {player, level} = await addLevel(k, map, {
    preloadResources: async (k: KCtx) => {
      // Define music
      bgMusicManager.loadMusic('home', 'music/home.mp3');
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
      G: {
        loadResources: GopherEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          GopherEntity.spawn(k, worldPos);
        },
      },
      F: {
        loadResources: BumblebeeEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          BumblebeeEntity.spawn(k, worldPos);
        },
      },
      H: {
        loadResources: HomeEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          HomeEntity.spawn(k, worldPos);
        },
      },
      B: {
        loadResources: OldBobrEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          OldBobrEntity.spawn(k, worldPos);
        },
      },
      '1': {
        loadResources: MapItemEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          addFurnitureItem(k, {
            itemId: 'home-kitchen-chair-left',
            sprite: 'home-kitchen-chair-left',
            worldPos,
          });
        },
      },
      '2': {
        loadResources: MapItemEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          addFurnitureItem(k, {
            itemId: 'home-kitchen-table',
            sprite: 'home-kitchen-table',
            worldPos,
          });
        },
      },
    },
    exitPoints: [
      {
        currentMapExitIndex: 0,
        spawnOffsetTiles: k.vec2(-2, 0),
        destLevel: sceneLevel_1_2.id,
        destLevelExitIndex: 0,
      },
    ],
  });

  await k.loadSprite('bg-home-day', 'sprites/backgrounds/home-day.png');
  addBackground(k, 'bg-home-day', player, {offsetY: 40});

  bgMusicManager.playMusic('start-location');

  player.setCamFollowPlayer(level, {
    rightTilesPadding: 2, // to hide wall on the right and exit collision box
    topTilesPadding: -5, // so we can see more on top
  });
};

sceneLevel_1_1.id = 'level-1-1';
