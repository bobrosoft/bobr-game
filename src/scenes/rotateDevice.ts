import i18next, {t} from 'i18next';
import {KCtx} from '../kaplay';

export const sceneRotateDevice = (k: KCtx) => {
  k.loadSprite('rotate-device', 'sprites/icons/rotate-device.gif');
  k.add([
    //
    'rotate-device',
    k.sprite('rotate-device', {width: 100}),
    k.anchor('bot'),
    k.pos(k.width() / 2, k.height() / 2 - 10),
    k.scale(k.vec2(-1, 1)),
    k.fixed(),
  ]);

  k.add([
    //
    'rotate-device-text',
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
  ]);

  // Add instructions to install PWA
  const instructionButton = k.add([
    //
    'rotate-device-instructions',
    k.rect(k.width() * 0.9, 56, {radius: 8, fill: false}),
    k.outline(2, new k.Color(255, 255, 255)),
    k.anchor('center'),
    k.area(),
    k.pos(k.width() / 2, k.height() * 0.85),
    k.fixed(),
  ]);

  instructionButton.add([
    //
    k.text(t('common.howToInstall'), {
      font: 'pixel',
      size: 14,
      width: k.width() * 0.8,
      align: 'center',
      lineSpacing: 10,
    }),
    k.color('white'),
    k.anchor('center'),
  ]);

  instructionButton.onClick(() => {
    setTimeout(() => {
      let url = 'https://www.cdc.gov/niosh/mining/tools/installpwa.html#cdc_generic_section_2-installing-a-pwa-on-ios';
      switch (i18next.language) {
        case 'ru':
          url = 'https://darkshaurma.com/about/pwa/';
          break;
      }
      window.open(url, '_blank');
    }, 100); // need timeout or browser may block opening the new tab
  });
};
