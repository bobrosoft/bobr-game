import {addBackground} from '../components/addBackground';
import {addFurnitureItem} from '../components/addFurnitureItem';
import {addLevel} from '../components/addLevel';
import {BoarEntity} from '../entities/boar';
import {BumblebeeEntity} from '../entities/bumblebee';
import {GopherEntity} from '../entities/gopher';
import {OldBobrEntity} from '../entities/old-bobr';
import {KCtx} from '../kaplay';
import {bgMusicManager, gsm} from '../main';
import {sceneLevel_1_2} from './level-1-2';
import map from './maps/level-1-3.txt?raw';
import {tileDirectionSignLeft} from './tiles/tileDirectionSignLeft';
import {tileDirectionSignRight} from './tiles/tileDirectionSignRight';
import {tileGrass} from './tiles/tileGrass';
import {tileGround} from './tiles/tileGround';
import {tileGroundGrass} from './tiles/tileGroundGrass';
import {tileGroundGrassAir} from './tiles/tileGroundGrassAir';
import {tileGroundGrassInclinedLeft} from './tiles/tileGroundGrassInclinedLeft';
import {tileGroundGrassInclinedRight} from './tiles/tileGroundGrassInclinedRight';
import {tileRock} from './tiles/tileRock';
import {tileTree} from './tiles/tileTree';

export const sceneLevel_1_3 = async (k: KCtx) => {
  const {player, level} = await addLevel(k, map, {
    preloadResources: async (k: KCtx) => {
      // Define music
      bgMusicManager.loadMusic('start-location', 'music/start-location.mp3');
    },
    tileWidth: 32,
    tileHeight: 32,
    tiles: {
      '>': tileDirectionSignRight,
      '<': tileDirectionSignLeft,
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
      B: {
        loadResources: OldBobrEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          OldBobrEntity.spawn(k, worldPos, {flipX: true});
        },
      },
      H: {
        loadResources: BoarEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          BoarEntity.spawn(k, worldPos, {
            isAlreadyDead: gsm.state.persistent.level1.isBoarDead,
            onDeath: () => {
              gsm.update({
                persistent: {
                  level1: {
                    isBoarDead: true,
                  },
                },
              });
            },
          });
        },
      },
      '1': {
        loadResources: async (k: KCtx) => {
          await k.loadSprite('home-bed', 'sprites/home/home-bed.png');
        },
        factory: (k, tilePos, worldPos) => {
          addFurnitureItem(k, {
            itemId: 'home-bed',
            sprite: 'home-bed',
            worldPos,
          });
        },
      },
    },
    exitPoints: [
      {
        currentMapExitIndex: 0,
        spawnOffsetTiles: k.vec2(2, 0),
        destLevel: sceneLevel_1_2.id,
        destLevelExitIndex: 1,
      },
    ],
  });

  await k.loadSprite('bg-home-day', 'sprites/backgrounds/home-day.png');
  addBackground(k, 'bg-home-day', player, {offsetY: 40});

  bgMusicManager.playMusic('start-location');

  player.setCamFollowPlayer(level, {
    leftTilesPadding: 2, // to hide wall on the left and exit collision box
    rightTilesPadding: 2, // to hide wall on the right
    topTilesPadding: -5, // so we can see more on top
  });
};

sceneLevel_1_3.id = 'level-1-3';
