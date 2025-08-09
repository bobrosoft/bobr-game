import {addJoystick} from './components/addJoystick';
import {k} from './kaplay';
import {Helpers} from './misc/Helpers';
import {sceneLevelHome} from './scenes/levelHome';

k.setLayers(['game', 'hud', 'menu'], 'game');

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

// Watch for orientation changes to adjust canvas size
window.addEventListener('resize', () => {
  setTimeout(() => {
    window.location.reload();
  }, 1000);
});
