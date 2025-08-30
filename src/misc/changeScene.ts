import {KCtx} from '../kaplay';
import {fadeManager, hudManager} from '../main';

/**
 * Change to a new scene with a fade out and fade in effect.
 * NOTE: That function assumes that the target scene is wrapped with sceneTransitionWrapper
 * @param k
 * @param newSceneName
 */
export async function changeScene(k: KCtx, newSceneName: string) {
  hudManager.hide();
  await fadeManager.showOverlay(0.3);
  k.go(newSceneName);

  // The rest happens in sceneTransitionWrapper
}
