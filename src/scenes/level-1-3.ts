import {t} from 'i18next';
import {OffScreenComp} from 'kaplay';
import {addBackground} from '../components/addBackground';
import {addCollectableItem} from '../components/addCollectableItem';
import {addLevel} from '../components/addLevel';
import {showDialogSeries} from '../components/showDialog';
import {BoarEntity} from '../entities/boar';
import {BumblebeeEntity} from '../entities/bumblebee';
import {ITEM_ID} from '../entities/generic/item-id';
import {GopherEntity} from '../entities/gopher';
import {OldBobrEntity} from '../entities/old-bobr';
import {getPlayer} from '../entities/player';
import {KCtx} from '../kaplay';
import {bgMusicManager, camManager, gsm, hudManager, shaderManager} from '../main';
import {sceneLevel_1_2} from './level-1-2';
import {sceneLevel_1_2e} from './level-1-2e';
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
          }

          const mainObj = OldBobrEntity.spawn(k, worldPos, {
            flipX: true,
            getAvailableInteractionType: (): InteractionType => {
              if (gsm.state.persistent.player.deaths >= 1 && !gsm.state.persistent.player.hasLuckyCharm) {
                return InteractionType.GIVE_LUCKY_CHARM;
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
              }
            },
          });
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
          addCollectableItem(k, {
            itemId: ITEM_ID.HOME_BED,
            sprite: 'home-bed',
            worldPos,
            postInteractAction: () => {
              return showDialogSeries(k, player, getPlayer(k), [t('level1.bobr.afterBedPickup')], {unskippable: true});
            },
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

            return {
              destLevel: sceneLevel_1_2e.id,
              destLevelExitIndex: 1,
            };
          } else {
            return {
              destLevel: sceneLevel_1_2.id,
              destLevelExitIndex: 1,
            };
          }
        },
      },
    ],
  });

  await k.loadSprite('bg-home-day', 'sprites/backgrounds/home-day.png');
  addBackground(k, 'bg-home-day', {offsetY: 40});
  shaderManager.enableDefaultShader();

  camManager.setCamConstraintsForLevel(level, {
    leftTilesPadding: 2, // to hide wall on the left and exit collision box
    rightTilesPadding: 2, // to hide wall on the right
    topTilesPadding: -5, // so we can see more on top
  });
  camManager.enableCamFollowPlayer(player);

  // Handle boar boss music
  if (!gsm.state.persistent.level1.isBoarDead) {
    if (bgMusicManager.getCurrentMusicName() !== 'boar-boss-fight') {
      bgMusicManager.stopMusic(1.5);
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
