import {t} from 'i18next';
import {OffScreenComp} from 'kaplay';
import {addBackground} from '../components/addBackground';
import {addFurnitureItem} from '../components/addFurnitureItem';
import {addLevel} from '../components/addLevel';
import {BoarEntity} from '../entities/boar';
import {BumblebeeEntity} from '../entities/bumblebee';
import {ITEM_ID} from '../entities/generic/item-id';
import {GopherEntity} from '../entities/gopher';
import {OldBobrEntity} from '../entities/old-bobr';
import {getPlayer} from '../entities/player';
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
      bgMusicManager.loadMusic('boar-boss-fight', 'music/boar-boss-fight.mp3');
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
              onBoarDeath();
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
            itemId: ITEM_ID.HOME_BED,
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
        getDestLevelParamsUponUse: () => {
          if (gsm.state.persistent.level1.isBoarDead) {
            const requiredItems = [
              //
              ITEM_ID.HOME_BED,
            ];

            // Check if there's any required item missing
            if (requiredItems.some(itemId => !gsm.getIsPlayerHasItem(itemId))) {
              getPlayer(k)
                .showDialogSeries([t('common.notAllItemsFound')])
                .then();
              return;
            }
          }

          return {
            destLevel: sceneLevel_1_2.id,
            destLevelExitIndex: 1,
          };
        },
      },
    ],
  });

  await k.loadSprite('bg-home-day', 'sprites/backgrounds/home-day.png');
  addBackground(k, 'bg-home-day', player, {offsetY: 40});

  player.setCamFollowPlayer(level, {
    leftTilesPadding: 2, // to hide wall on the left and exit collision box
    rightTilesPadding: 2, // to hide wall on the right
    topTilesPadding: -5, // so we can see more on top
  });

  // Handle boar boss music
  if (!gsm.state.persistent.level1.isBoarDead) {
    if (bgMusicManager.getCurrentMusicName() !== 'boar-boss-fight') {
      bgMusicManager.stopMusic();
    }

    k.get<OffScreenComp>('boar')[0].onEnterScreen(() => {
      if (!gsm.state.persistent.level1.isBoarDead) {
        bgMusicManager.playMusic('boar-boss-fight');
      }
    });
  } else {
    bgMusicManager.playMusic('start-location');
  }

  function onBoarDeath() {
    gsm.update({
      persistent: {
        level1: {
          isBoarDead: true,
        },
      },
    });

    // Switch back to normal music
    bgMusicManager.playMusic('start-location');
  }
};

sceneLevel_1_3.id = 'level-1-3';
