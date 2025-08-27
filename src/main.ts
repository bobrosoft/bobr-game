import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {BgMusicManager} from './components/BgMusicManager';
import {createHud} from './components/hud';
import translationsEN from './i18n/en.json';
import translationsRU from './i18n/ru.json';
import {k} from './kaplay';
import {Helpers} from './misc/Helpers';
import {sceneLevelHome} from './scenes/levelHome';
import {sceneMenu} from './scenes/menu';
import {sceneRotateDevice} from './scenes/rotateDevice';

export const bgMusicManager: BgMusicManager = new BgMusicManager(k);
export let hud: ReturnType<typeof createHud>; // need to create it later because layers not yet defined

(async () => {
  // Init i18n (without await it will not work)
  await i18next.use(LanguageDetector).init({
    fallbackLng: 'ru', // fallback if detected language is not available
    resources: {
      ru: {translation: translationsRU},
      en: {translation: translationsEN},
    },
  });

  k.loadFont('pixel', 'fonts/Press_Start_2P/PressStart2P-Regular.ttf');
  k.setLayers(['bg', 'game', 'hud', 'menu', 'fade'], 'game');

  k.setVolume(0.5); // Set default volume for all sounds
  hud = createHud(k);

  k.scene('menu', () => sceneMenu(k));
  k.scene('rotate-device', () => sceneRotateDevice(k));
  k.scene('level-home', () => sceneLevelHome(k));

  const isInitialOrientationLandscape = Helpers.isLandscapeMode();

  // Watch for orientation changes to adjust canvas size
  window.addEventListener('resize', () => {
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
