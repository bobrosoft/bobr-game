import {addJoystick} from './components/addJoystick';
import {k} from './kaplay';
import {Helpers} from './misc/helpers';
import {sceneLevelHome} from './scenes/levelHome';

k.setLayers(['game', 'hud', 'menu'], 'game');

k.scene('level-home', () => sceneLevelHome(k));
k.go('level-home');

// Add mobile joystick and buttons if on a touch device
if (Helpers.isTouchDevice()) {
  addJoystick(k, {size: Math.min(window.innerWidth / 15, 60)});
}

// Watch for orientation changes to adjust canvas size
window.addEventListener('resize', () => {
  setTimeout(() => {
    window.location.reload();
  }, 1000);
});
