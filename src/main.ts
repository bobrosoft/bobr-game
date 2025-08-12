import i18next, {t} from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import {addJoystick} from './components/addJoystick';
import translationsRU from './i18n/ru.json';
import translationsEN from './i18n/en.json';
import {k} from './kaplay';
import {Helpers} from './misc/Helpers';
import {sceneLevelHome} from './scenes/levelHome';

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
  k.setLayers(['game', 'hud', 'menu'], 'game');

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
    k.loadSprite('rotate-device', 'sprites/icons/rotate-device.gif');
    const rotateWarning = k.add([
      //
      'rotate-device',
      k.sprite('rotate-device', {width: 100}),
      k.anchor('bot'),
      k.pos(k.width() / 2, k.height() / 2 - 10),
      k.scale(k.vec2(-1, 1)),
      k.fixed(),
      k.stay(),
    ]);

    k.add([
      //
      'rotate-warning-text',
      k.text(t('common.rotateDevice'), {
        font: 'pixel',
        size: 24,
        width: k.width() * 0.8,
        align: 'center',
        lineSpacing: 10,
      }),
      k.color('white'),
      k.anchor('top'),
      k.pos(k.width() / 2, k.height() / 2 + 20),
      k.fixed(),
      k.stay(),
    ]);

    return;
  }

  k.scene('level-home', () => sceneLevelHome(k));
  k.go('level-home');

  // Add mobile joystick and buttons if on a touch device
  if (Helpers.isTouchDevice()) {
    addJoystick(k, {size: Math.min(window.innerWidth / 15, 60)});
  }

  // Add reload button to the top right corner
  k.loadSprite('reload-button', 'sprites/icons/reload.png');
  const reloadButton = k.add([
    'reload-button',
    k.layer('hud'),
    k.sprite('reload-button'),
    k.area(),
    k.pos(k.width() - 10, 10),
    k.anchor('topright'),
    k.fixed(),
    k.stay(),
  ]);
  reloadButton.onClick(() => {
    window.location.reload();
  });
})();
