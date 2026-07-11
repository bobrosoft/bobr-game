import {t} from 'i18next';
import {addBackground} from '../components/addBackground';
import {addFlyingLeafs} from '../components/addFlyingLeafs';
import {addFurnitureItem} from '../components/addFurnitureItem';
import {addLevel} from '../components/addLevel';
import {showDialogSeries} from '../components/showDialog';
import {BumblebeeEntity} from '../entities/bumblebee';
import {ITEM_ID} from '../entities/generic/item-id';
import {GopherEntity} from '../entities/gopher';
import {MapItemEntity} from '../entities/map-item';
import {OldBobrEntity} from '../entities/old-bobr';
import {getPlayer} from '../entities/player';
import {KCtx} from '../kaplay';
import {bgMusicManager, camManager, gsm, hudManager, shaderManager} from '../main';
import {sceneLevel_1_1} from './level-1-1';
import {sceneLevel_1_3} from './level-1-3';
import map from './maps/level-1-2.txt?raw';
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

export const sceneLevel_1_2 = async (k: KCtx) => {
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
          GopherEntity.spawn(k, worldPos, {});
        },
      },
      F: {
        loadResources: BumblebeeEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          BumblebeeEntity.spawn(k, worldPos, {});
        },
      },
      B: {
        loadResources: OldBobrEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          enum InteractionType {
            SAY_INTRO_REPEAT = 'SAY_INTRO_REPEAT',
            GIVE_LUCKY_CHARM = 'GIVE_LUCKY_CHARM',
            SAY_RESPAWN_INFO = 'SAY_RESPAWN_INFO',
          }

          const mainObj = OldBobrEntity.spawn(k, worldPos, {
            flipX: true,
            getAvailableInteractionType: (): InteractionType => {
              if (gsm.state.persistent.player.deaths >= 1 && !gsm.state.persistent.player.hasLuckyCharm) {
                return InteractionType.GIVE_LUCKY_CHARM;
              } else if (!gsm.state.persistent.level1.isRespawnInfoSaid) {
                return InteractionType.SAY_RESPAWN_INFO;
              } else {
                return InteractionType.SAY_INTRO_REPEAT;
              }
            },
            performInteraction: async (type: InteractionType): Promise<void> => {
              switch (type) {
                case InteractionType.SAY_INTRO_REPEAT:
                  await showDialogSeries(k, mainObj, player, [
                    //
                    t(
                      k.choose([
                        'level1.oldBobr.introRepeat1',
                        'level1.oldBobr.introRepeat2',
                        'level1.oldBobr.introRepeat3',
                      ]),
                    ),
                  ]);
                  break;

                case InteractionType.GIVE_LUCKY_CHARM:
                  await showDialogSeries(
                    k,
                    mainObj,
                    player,
                    [
                      //
                      t('level1.oldBobr.giveLuckyCharm1'),
                      t('level1.oldBobr.giveLuckyCharm2'),
                    ],
                    {unskippable: true},
                  );

                  gsm.update({
                    persistent: {
                      player: {
                        hasLuckyCharm: true,
                      },
                    },
                    temp: {
                      player: {
                        health: 2,
                      },
                    },
                  });
                  await hudManager.showLuckyCharmAnimation();

                  await showDialogSeries(
                    k,
                    mainObj,
                    player,
                    [
                      //
                      t('level1.oldBobr.giveLuckyCharm3'),
                    ],
                    {unskippable: true},
                  );

                  break;

                case InteractionType.SAY_RESPAWN_INFO:
                  await showDialogSeries(k, mainObj, player, [
                    //
                    t('level1.oldBobr.respawnInfo1'),
                    t('level1.oldBobr.respawnInfo2'),
                  ]);

                  gsm.update({
                    persistent: {
                      level1: {
                        isRespawnInfoSaid: true,
                      },
                    },
                  });
                  break;
              }
            },
          });
        },
      },
      '1': {
        loadResources: async k => {
          await MapItemEntity.loadResources(k);
          await k.loadSprite('home-kitchen-chair-right', 'sprites/home/home-kitchen-chair-right.png');
        },
        factory: (k, tilePos, worldPos) => {
          addFurnitureItem(k, {
            itemId: ITEM_ID.HOME_KITCHEN_CHAIR_RIGHT,
            sprite: 'home-kitchen-chair-right',
            worldPos,
          });
        },
      },
      '2': {
        loadResources: async k => {
          await MapItemEntity.loadResources(k);
          await k.loadSprite('home-stove', 'sprites/home/home-stove.gif', {
            sliceX: 6,
            sliceY: 2,
            anims: {
              idle: {from: 0, to: 0},
              burn: {from: 6, to: 11},
            },
          });
        },
        factory: (k, tilePos, worldPos) => {
          addFurnitureItem(k, {
            itemId: ITEM_ID.HOME_STOVE,
            sprite: 'home-stove',
            worldPos,
          });
        },
      },
    },
    exitPoints: [
      {
        currentMapExitIndex: 0,
        spawnOffsetTiles: k.vec2(2, 0),
        getDestLevelParamsUponUse: () => ({
          destLevel: sceneLevel_1_1.id,
          destLevelExitIndex: 0,
        }),
      },
      {
        currentMapExitIndex: 1,
        spawnOffsetTiles: k.vec2(-2, 0),
        getDestLevelParamsUponUse: () => {
          const requiredItems = [
            //
            ITEM_ID.HOME_KITCHEN_CHAIR_RIGHT,
            ITEM_ID.HOME_STOVE,
          ];

          // Check if there's any required item missing
          if (requiredItems.some(itemId => !gsm.getIsPlayerHasItem(itemId))) {
            getPlayer(k)
              .showDialogSeries([t('common.notAllItemsFound')])
              .then();
            return;
          }

          return {
            destLevel: sceneLevel_1_3.id,
            destLevelExitIndex: 0,
          };
        },
      },
    ],
  });

  await k.loadSprite('bg-home-day', 'sprites/backgrounds/home-day.png');
  addBackground(k, 'bg-home-day', {offsetY: 40});
  addFlyingLeafs(k, {intensity: 2});
  shaderManager.enableDefaultShader();

  bgMusicManager.playMusic('start-location');

  camManager.setCamConstraintsForLevel(level, {
    leftTilesPadding: 2, // to hide wall on the left and exit collision box
    rightTilesPadding: 2, // to hide wall on the right
    topTilesPadding: -5, // so we can see more on top
  });
  camManager.enableCamFollowPlayer(player);
};

sceneLevel_1_2.id = 'level-1-2';
