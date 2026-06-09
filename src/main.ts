import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {BgMusicManager} from './components/BgMusicManager';
import {CamManager} from './components/CamManager';
import {FadeManager} from './components/FadeManager';
import {GameStateManager} from './components/GameStateManager';
import {HudManager} from './components/HudManager';
import {ShaderManager} from './components/ShaderManager';
import translationsEN from './i18n/en.json';
import translationsRU from './i18n/ru.json';
import {k} from './kaplay';
import {sceneWrapper} from './misc/changeScene';
import {Helpers} from './misc/Helpers';
import {requestFullscreenOnFirstInteraction} from './misc/requestFullscreenOnFirstInteraction';
import {watchForOrientationChange} from './misc/watchForOrientationChange';
import {sceneLevel_1_1} from './scenes/level-1-1';
import {sceneLevel_1_2} from './scenes/level-1-2';
import {sceneLevel_1_2e} from './scenes/level-1-2e';
import {sceneLevel_1_3} from './scenes/level-1-3';
import {sceneMenu} from './scenes/menu';
import {sceneRotateDevice} from './scenes/rotateDevice';

export const gsm = new GameStateManager();
export const bgMusicManager: BgMusicManager = new BgMusicManager(k);
export let hudManager: HudManager; // need to create it later because layers not yet defined
export let fadeManager: FadeManager;
export let camManager: CamManager;
export let shaderManager: ShaderManager;

(async () => {
  // Init i18n (without await it will not work)
  await i18next.use(LanguageDetector).init({
    supportedLngs: ['en', 'ru'],
    fallbackLng: 'ru', // fallback if detected language is not available
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    resources: {
      ru: {translation: translationsRU},
      en: {translation: translationsEN},
    },
  });

  k.loadFont('pixel', 'fonts/Press_Start_2P/PressStart2P-Regular.ttf');
  k.setLayers(['bg', 'game', 'hud', 'menu', 'fade'], 'game');

  // Add default blue background
  k.add([
    k.layer('bg'),
    k.rect(k.width(), k.height()),
    k.color('#74dcf6'),
    k.pos(0, 0),
    k.anchor('topleft'),
    k.fixed(),
    k.stay(),
  ]);

  k.setVolume(1); // Set default volume for all sounds
  hudManager = new HudManager(k);
  fadeManager = new FadeManager(k);
  camManager = new CamManager(k);
  shaderManager = new ShaderManager(k);

  k.scene('menu', () => sceneMenu(k));
  k.scene('rotate-device', () => sceneRotateDevice(k));
  k.scene(sceneLevel_1_1.id, sceneWrapper(k, sceneLevel_1_1));
  k.scene(sceneLevel_1_2.id, sceneWrapper(k, sceneLevel_1_2));
  k.scene(sceneLevel_1_3.id, sceneWrapper(k, sceneLevel_1_3));
  k.scene(sceneLevel_1_2e.id, sceneWrapper(k, sceneLevel_1_2e));

  const isInitialOrientationLandscape = Helpers.isLandscapeMode();

  // Check device orientation and show warning if not landscape
  if (!isInitialOrientationLandscape) {
    k.go('rotate-device');
  } else {
    k.go('menu');
  }

  watchForOrientationChange(isInitialOrientationLandscape);
  requestFullscreenOnFirstInteraction();

  // setInterval(() => {
  //   k.debug.log('numObjects: ', k.debug.numObjects(), ' | fps: ', k.debug.fps());
  // }, 1000);
  // k.debug.inspect = true;
})();
