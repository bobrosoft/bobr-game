import {k} from './kaplay';
import {sceneLevel1} from './scenes/level-1';

k.scene('level-1', () => sceneLevel1(k));

k.go('level-1');

// Watch for orientation changes to adjust canvas size
window.addEventListener('resize', () => {
  window.location.reload();
});
