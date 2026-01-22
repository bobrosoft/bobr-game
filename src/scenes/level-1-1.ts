import {t} from 'i18next';
import {addBackground} from '../components/addBackground';
import {addFurnitureItem} from '../components/addFurnitureItem';
import {addLevel} from '../components/addLevel';
import {BumblebeeEntity} from '../entities/bumblebee';
import {ITEM_ID} from '../entities/generic/item-id';
import {GopherEntity} from '../entities/gopher';
import {HomeEntity} from '../entities/home';
import {MapItemEntity} from '../entities/map-item';
import {OldBobrEntity} from '../entities/old-bobr';
import {getPlayer} from '../entities/player';
import {KCtx} from '../kaplay';
import {bgMusicManager, camManager, fadeManager, gsm} from '../main';
import {sceneLevel_1_2} from './level-1-2';
import map from './maps/level-1-1.txt?raw';
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
            itemId: ITEM_ID.HOME_KITCHEN_CHAIR_LEFT,
            sprite: 'home-kitchen-chair-left',
            worldPos,
          });
        },
      },
      '2': {
        loadResources: MapItemEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          addFurnitureItem(k, {
            itemId: ITEM_ID.HOME_KITCHEN_TABLE,
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
        getDestLevelParamsUponUse: () => {
          const requiredItems = [
            //
            ITEM_ID.HOME_KITCHEN_CHAIR_LEFT,
            ITEM_ID.HOME_KITCHEN_TABLE,
          ];

          // Check if there's any required item missing
          if (requiredItems.some(itemId => !gsm.getIsPlayerHasItem(itemId))) {
            getPlayer(k)
              .showDialogSeries([t('common.notAllItemsFound')])
              .then();
            return;
          }

          return {
            destLevel: sceneLevel_1_2.id,
            destLevelExitIndex: 0,
          };
        },
      },
    ],
  });

  await k.loadSprite('bg-home-day', 'sprites/backgrounds/home-day.png');
  addBackground(k, 'bg-home-day', {offsetY: 40});

  bgMusicManager.playMusic('start-location');

  camManager.setCamConstraintsForLevel(level, {
    rightTilesPadding: 2, // to hide wall on the right and exit collision box
    topTilesPadding: -5, // so we can see more on top
  });
  camManager.enableCamFollowPlayer(player);
};

sceneLevel_1_1.id = 'level-1-1';
