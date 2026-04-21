import {Vec2} from 'kaplay';
import {addBackground} from '../components/addBackground';
import {addLevel} from '../components/addLevel';
import {BumblebeeEntity} from '../entities/bumblebee';
import {NpcObj} from '../entities/generic/npc';
import {GopherEntity} from '../entities/gopher';
import {MissBobrEntity} from '../entities/miss-bobr';
import {OldBobrEntity} from '../entities/old-bobr';
import {TriggerEntity} from '../entities/trigger';
import {KCtx} from '../kaplay';
import {bgMusicManager, camManager, gsm} from '../main';
import {loadBloomShader} from '../shaders/bloom';
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

      loadBloomShader(k);
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

              bgMusicManager.playMusic('love-theme-short');
              player.beginCutscene().then();
              camManager.moveCamToObj(missBobr, {
                duration: 4,
              });

              // Wait before applying bloom
              await k.wait(2);

              // Apply bloom gradually
              let bloomStrength = 0;
              k.usePostEffect('bloom', () => ({
                bloomStrength,
                canvasWidth: k.width(),
                canvasHeight: k.height(),
              }));
              k.tween(0, 1, 2, v => {
                bloomStrength = v;
              });

              await k.wait(4.5);
              missBobr.walkToPosition(new k.Vec2(missBobr.pos.x - 300, missBobr.pos.y));

              await k.wait(4);

              // Remove bloom gradually
              k.tween(1, 0, 1, v => {
                bloomStrength = v;
              }).then(() => {
                k.usePostEffect(null);
              });

              await player.endCutscene({moveCamToPlayer: true});
              missBobr.destroy();
              bgMusicManager.playMusic('start-location');
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

  bgMusicManager.playMusic('start-location');

  camManager.setCamConstraintsForLevel(level, {
    leftTilesPadding: 2, // to hide wall on the left and exit collision box
    rightTilesPadding: 2, // to hide wall on the right
    topTilesPadding: -5, // so we can see more on top
  });
  camManager.enableCamFollowPlayer(player);
};

sceneLevel_1_2e.id = 'level-1-2e';
