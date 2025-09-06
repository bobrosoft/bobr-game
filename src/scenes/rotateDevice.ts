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

  // Add instructions on how to install to home screen
  let url = 'https://www.cdc.gov/niosh/mining/tools/installpwa.html#cdc_generic_section_2-installing-a-pwa-on-ios';
  switch (i18next.language) {
    case 'ru':
      url = 'https://darkshaurma.com/about/pwa/';
      break;
  }

  const a = document.createElement('a');
  a.href = url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.innerHTML = t('common.howToInstall');
  a.style.position = 'absolute';
  a.style.bottom = '10%';
  a.style.left = '0';
  a.style.display = 'block';
  a.style.padding = '20px';
  a.style.color = 'white';
  a.style.fontFamily = 'pixel, monospace';
  a.style.textAlign = 'center';
  a.style.lineHeight = '1.5em';

  document.querySelector('body').appendChild(a);

  k.onSceneLeave(() => {
    document.querySelector('body').removeChild(a);
  });
};
