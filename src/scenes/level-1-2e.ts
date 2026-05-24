import {addBackground} from '../components/addBackground';
import {addFlyingLeafs, getLeafsGenerator} from '../components/addFlyingLeafs';
import {addLevel} from '../components/addLevel';
import {BumblebeeEntity} from '../entities/bumblebee';
import {NpcObj} from '../entities/generic/npc';
import {GopherEntity} from '../entities/gopher';
import {MissBobrEntity} from '../entities/miss-bobr';
import {TriggerEntity} from '../entities/trigger';
import {KCtx} from '../kaplay';
import {bgMusicManager, camManager, gsm, shaderManager} from '../main';
import {sceneLevel_1_1} from './level-1-1';
import {sceneLevel_1_3} from './level-1-3';
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
      M: {
        loadResources: MissBobrEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          if (!gsm.state.persistent.level1.isMissBobrCutsceneShown) {
            MissBobrEntity.spawn(k, worldPos, {flipX: true});
          }
        },
      },
      T: {
        loadResources: TriggerEntity.loadResources,
        factory: (k, tilePos, worldPos) => {
          TriggerEntity.spawn(k, worldPos, {
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
          destLevel: sceneLevel_1_1.id,
          destLevelExitIndex: 0,
        }),
      },
      {
        currentMapExitIndex: 1,
        spawnOffsetTiles: k.vec2(-2, 0),
        getDestLevelParamsUponUse: () => ({
          destLevel: sceneLevel_1_3.id,
          destLevelExitIndex: 0,
        }),
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
