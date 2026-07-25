import {t} from 'i18next';
import {addBackground} from '../components/addBackground';
import {addCollectableItem} from '../components/addCollectableItem';
import {addFlyingLeafs} from '../components/addFlyingLeafs';
import {addLevel} from '../components/addLevel';
import {showDialogSeries} from '../components/showDialog';
import {BumblebeeEntity} from '../entities/bumblebee';
import {ITEM_ID} from '../entities/generic/item-id';
import {GopherEntity} from '../entities/gopher';
import {HomeEntity} from '../entities/home';
import {MapItemEntity} from '../entities/map-item';
import {OldBobrEntity} from '../entities/old-bobr';
import {KCtx} from '../kaplay';
import {bgMusicManager, camManager, gsm, shaderManager} from '../main';
import {sceneLevel_1_2e} from './level-1-2e';
import map from './maps/level-1-1e.txt?raw';
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

export const sceneLevel_1_1e = async (k: KCtx) => {
  const {player, level} = await addLevel(k, map, {
    preloadResources: async (k: KCtx) => {
      // Define music
      bgMusicManager.loadMusic('home', 'music/home.mp3');
      bgMusicManager.loadMusic('start-location', 'music/start-location.mp3');

      k.loadSprite('item-firewood', 'sprites/items/firewood.png');
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
        factory: ({k, worldPosTileCentered}) => {
          GopherEntity.spawn(k, worldPosTileCentered, {});
        },
      },
      F: {
        loadResources: BumblebeeEntity.loadResources,
        factory: ({k, worldPosTileCentered}) => {
          BumblebeeEntity.spawn(k, worldPosTileCentered, {});
        },
      },
      H: {
        loadResources: HomeEntity.loadResources,
        factory: ({k, worldPos}) => {
          HomeEntity.spawn(k, worldPos, {
            onEnter: () => {
              // Need to reset spawn point when entering home
              gsm.update({
                persistent: {
                  spawnAtExitIndex: undefined,
                },
              });
            },
          });
        },
      },
      B: {
        loadResources: OldBobrEntity.loadResources,
        factory: ({k, worldPosTileCentered}) => {
          enum InteractionType {
            SAY_GATHER_FIREWOOD = 'SAY_GATHER_FIREWOOD',
            SAY_GATHER_FIREWOOD_REPEAT = 'SAY_GATHER_FIREWOOD_REPEAT',
            SAY_FIREWOOD_GATHERED = 'SAY_FIREWOOD_GATHERED',
            SAY_FIREWOOD_GATHERED_REPEAT = 'SAY_FIREWOOD_GATHERED_REPEAT',
          }

          const mainObj = OldBobrEntity.spawn(k, worldPosTileCentered, {
            getAvailableInteractionType: (): InteractionType => {
              if (!gsm.state.persistent.level1.isFirewoodInfoSaid) {
                return InteractionType.SAY_GATHER_FIREWOOD;
              } else if (!gsm.lvl1.hasAllFirewood) {
                return InteractionType.SAY_GATHER_FIREWOOD_REPEAT;
              } else if (!gsm.state.persistent.level1.isFirewoodGatheredSaid) {
                return InteractionType.SAY_FIREWOOD_GATHERED;
              } else {
                return InteractionType.SAY_FIREWOOD_GATHERED_REPEAT;
              }
            },
            performInteraction: async (type: InteractionType): Promise<void> => {
              switch (type) {
                case InteractionType.SAY_GATHER_FIREWOOD:
                  await showDialogSeries(
                    k,
                    mainObj,
                    player,
                    [
                      //
                      t('level1.oldBobr.gatherFirewood1'),
                      t('level1.oldBobr.gatherFirewood2'),
                    ],
                    {unskippable: true},
                  );

                  // Mark that the firewood info has been said
                  gsm.update({
                    persistent: {
                      level1: {
                        isFirewoodInfoSaid: true,
                      },
                    },
                  });

                  // Show firewood on the map
                  k.get('item-firewood').forEach(item => {
                    item.hidden = false;
                  });
                  break;

                case InteractionType.SAY_GATHER_FIREWOOD_REPEAT:
                  await showDialogSeries(k, mainObj, player, [
                    t(
                      k.choose([
                        //
                        'level1.oldBobr.gatherFirewoodRepeat1',
                        'level1.oldBobr.gatherFirewoodRepeat2',
                      ]),
                    ),
                  ]);
                  break;

                case InteractionType.SAY_FIREWOOD_GATHERED:
                  await showDialogSeries(
                    k,
                    mainObj,
                    player,
                    [
                      //
                      t('level1.oldBobr.firewoodGathered1'),
                      t('level1.oldBobr.firewoodGathered2'),
                    ],
                    {unskippable: true},
                  );

                  // Mark that the firewood info has been said
                  gsm.update({
                    persistent: {
                      level1: {
                        isFirewoodGatheredSaid: true,
                      },
                    },
                  });
                  break;

                case InteractionType.SAY_FIREWOOD_GATHERED_REPEAT:
                  await showDialogSeries(k, mainObj, player, [
                    t(
                      k.choose([
                        //
                        'level1.oldBobr.firewoodGatheredRepeat1',
                        'level1.oldBobr.firewoodGatheredRepeat2',
                      ]),
                    ),
                  ]);
                  break;
              }
            },
          });
        },
      },
      '1': {
        loadResources: MapItemEntity.loadResources,
        factory: ({k, worldPosTileCentered}) => {
          addCollectableItem(k, {
            itemId: ITEM_ID.LEVEL1_FIREWOOD_1,
            sprite: 'item-firewood',
            worldPos: worldPosTileCentered,
            postInteractAction: async () => {
              await checkIfAllFirewoodCollected();
            },
          });
        },
      },
      '2': {
        loadResources: MapItemEntity.loadResources,
        factory: ({k, worldPosTileCentered}) => {
          addCollectableItem(k, {
            itemId: ITEM_ID.LEVEL1_FIREWOOD_2,
            sprite: 'item-firewood',
            worldPos: worldPosTileCentered,
            postInteractAction: async () => {
              await checkIfAllFirewoodCollected();
            },
          });
        },
      },
      '3': {
        loadResources: MapItemEntity.loadResources,
        factory: ({k, worldPosTileCentered}) => {
          addCollectableItem(k, {
            itemId: ITEM_ID.LEVEL1_FIREWOOD_3,
            sprite: 'item-firewood',
            worldPos: worldPosTileCentered,
            postInteractAction: async () => {
              await checkIfAllFirewoodCollected();
            },
          });
        },
      },
    },
    exitPoints: [
      {
        currentMapExitIndex: 0,
        spawnOffsetTiles: k.vec2(-2, 0),
        getDestLevelParamsUponUse: () => ({
          destLevel: sceneLevel_1_2e.id,
          destLevelExitIndex: 0,
        }),
      },
    ],
  });

  await k.loadSprite('bg-home-evening', 'sprites/backgrounds/home-evening.png');
  addBackground(k, 'bg-home-evening', {offsetY: 40});
  addFlyingLeafs(k, {intensity: 2});
  shaderManager.enableDefaultShader();

  bgMusicManager.playMusic('start-location');

  camManager.setCamConstraintsForLevel(level, {
    rightTilesPadding: 2, // to hide wall on the right and exit collision box
    topTilesPadding: -5, // so we can see more on top
  });
  camManager.enableCamFollowPlayer(player);

  if (!gsm.state.persistent.level1.isFirewoodInfoSaid) {
    // Hide all firewood
    k.get('item-firewood').forEach(item => {
      item.unuse('offscreen'); // need that, otherwise "offscreen" component will show it when entering the screen
      item.hidden = true;
    });
  }

  async function checkIfAllFirewoodCollected() {
    if (gsm.lvl1.hasAllFirewood) {
      await player.showDialogSeries([t('level1.bobr.allFirewoodCollected')]);
    }
  }
};

sceneLevel_1_1e.id = 'level-1-1e';
