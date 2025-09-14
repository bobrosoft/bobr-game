import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {BgMusicManager} from './components/BgMusicManager';
import {FadeManager} from './components/FadeManager';
import {GameStateManager} from './components/GameStateManager';
import {HudManager} from './components/HudManager';
import {sceneTransitionWrapper} from './misc/sceneTransitionWrapper';
import translationsEN from './i18n/en.json';
import translationsRU from './i18n/ru.json';
import {k} from './kaplay';
import {Helpers} from './misc/Helpers';
import {sceneLevel_1_1} from './scenes/level-1-1';
import {sceneLevel_1_2} from './scenes/level-1-2';
import {sceneMenu} from './scenes/menu';
import {sceneRotateDevice} from './scenes/rotateDevice';

export const gsm = new GameStateManager();
export const bgMusicManager: BgMusicManager = new BgMusicManager(k);
export let hudManager: HudManager; // need to create it later because layers not yet defined
export let fadeManager: FadeManager;

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
    k.color('#74dcf6' as any),
    k.pos(0, 0),
    k.anchor('topleft'),
    k.fixed(),
    k.stay(),
  ]);

  k.setVolume(0.5); // Set default volume for all sounds
  hudManager = new HudManager(k);
  fadeManager = new FadeManager(k);

  k.scene('menu', () => sceneMenu(k));
  k.scene('rotate-device', () => sceneRotateDevice(k));
  k.scene(sceneLevel_1_1.id, sceneTransitionWrapper(k, sceneLevel_1_1));
  k.scene(sceneLevel_1_2.id, sceneTransitionWrapper(k, sceneLevel_1_2));

  const isInitialOrientationLandscape = Helpers.isLandscapeMode();

  // Watch for orientation changes to adjust canvas size
  window.addEventListener('resize', () => {
    // If initial orientation was landscape, no need to reload on orientation change
    if (isInitialOrientationLandscape) {
      return;
    }

    if (Helpers.isLandscapeMode() === isInitialOrientationLandscape) {
      return; // No change in orientation, no need to reload
    }

    setTimeout(() => {
      window.location.reload();
    }, 1000);
  });

  // Check device orientation and show warning if not landscape
  if (!isInitialOrientationLandscape) {
    k.go('rotate-device');
  } else {
    k.go('menu');
  }
})();
