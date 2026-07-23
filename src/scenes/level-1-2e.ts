import {t} from 'i18next';
import {addBackground} from '../components/addBackground';
import {addFlyingLeafs, getLeafsGenerator} from '../components/addFlyingLeafs';
import {addLevel} from '../components/addLevel';
import {BumblebeeEntity} from '../entities/bumblebee';
import {NpcObj} from '../entities/generic/npc';
import {GopherEntity} from '../entities/gopher';
import {InteractableItemEntity} from '../entities/interactable-item';
import {MissBobrEntity} from '../entities/miss-bobr';
import {TriggerEntity} from '../entities/trigger';
import {KCtx} from '../kaplay';
import {bgMusicManager, camManager, gsm, shaderManager} from '../main';
import {sceneLevel_1_1e} from './level-1-1e';
import map from './maps/level-1-2e.txt?raw';
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

export const sceneLevel_1_2e = async (k: KCtx) => {
  const {player, level} = await addLevel(k, map, {
    preloadResources: async (k: KCtx) => {
      // Define music
      bgMusicManager.loadMusic('start-location', 'music/start-location.mp3');
      bgMusicManager.loadMusic('love-theme-short', 'music/love-theme-short.mp3');
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
      M: {
        loadResources: MissBobrEntity.loadResources,
        factory: ({k, worldPosTileCentered}) => {
          if (!gsm.state.persistent.level1.isMissBobrCutsceneShown) {
            MissBobrEntity.spawn(k, worldPosTileCentered, {
              flipX: true,
              getAvailableInteractionType: (): string => {
                return null;
              },
              performInteraction: async interactionType => {},
            });
          }
        },
      },
      f: {
        loadResources: async k => {
          k.loadSprite('flower-1', 'sprites/items/flower-1.png');
        },
        factory: ({k, worldPosTileCentered}) => {
          const obj = InteractableItemEntity.spawn(k, worldPosTileCentered, {
            sprite: 'flower-1',
            interact: async player => {
              await player.showDialogSeries([
                //
                t('level1.bobr.flowerDialog'),
              ]);
            },
          });
          obj.use(k.z(1));
        },
      },
      T: {
        loadResources: TriggerEntity.loadResources,
        factory: ({k, worldPosTileCentered}) => {
          TriggerEntity.spawn(k, worldPosTileCentered, {
            heightTiles: 4,
            onPlayerCollide: async () => {
              // Check if we have already shown cutscene
              if (gsm.state.persistent.level1.isMissBobrCutsceneShown) {
                return;
              }
              gsm.update({
                persistent: {
                  level1: {
                    isMissBobrCutsceneShown: true,
                  },
                },
              });

              const missBobr = k.get<NpcObj>('miss-bobr').at(0);
              const leafsGenerator = getLeafsGenerator(k);

              bgMusicManager.playMusic('love-theme-short');
              leafsGenerator?.pause();

              player.beginCutscene().then();
              camManager.moveCamToObj(missBobr, {
                duration: 4,
              });

              // Wait before applying bloom
              shaderManager.disableShader({duration: 1});
              await k.wait(2);

              // Apply bloom shader
              shaderManager.enableShader('bloom', {duration: 2});

              // Wait before leafs spray
              await k.wait(2.5);

              // Spawn some leafs for cinematic effect
              leafsGenerator?.spawnLeaf();
              k.wait(0.1).then(() => leafsGenerator?.spawnLeaf());
              k.wait(0.4).then(() => leafsGenerator?.spawnLeaf());
              k.wait(0.6).then(() => leafsGenerator?.spawnLeaf());
              k.wait(0.9).then(() => leafsGenerator?.spawnLeaf());

              // Wait before walk
              await k.wait(2);
              missBobr.walkToPosition(new k.Vec2(missBobr.pos.x - 300, missBobr.pos.y));

              // Wait before cutscene end
              await k.wait(4);

              // Remove bloom shader
              shaderManager.disableShader({duration: 1}).then(() => shaderManager.enableDefaultShader());

              await player.endCutscene({moveCamToPlayer: true});
              missBobr.destroy();

              bgMusicManager.playMusic('start-location');
              leafsGenerator?.unpause();
            },
          });
        },
      },
    },
    exitPoints: [
      {
        currentMapExitIndex: 0,
        spawnOffsetTiles: k.vec2(2, 0),
        getDestLevelParamsUponUse: () => ({
          destLevel: sceneLevel_1_1e.id,
          destLevelExitIndex: 0,
        }),
      },
      {
        currentMapExitIndex: 1,
        spawnOffsetTiles: k.vec2(-2, 0),
        getDestLevelParamsUponUse: () => {
          player.showDialogSeries([t('common.noNeedToGoThereAnymore')]);
          return undefined;
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

sceneLevel_1_2e.id = 'level-1-2e';
