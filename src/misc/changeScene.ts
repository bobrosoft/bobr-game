import {KCtx} from '../kaplay';
import {fadeManager, gsm, hudManager} from '../main';

/**
 * Change to a new scene with a fade out and fade in effect.
 * NOTE: That function assumes that the target scene is wrapped with sceneTransitionWrapper
 * @param k
 * @param newSceneName
 * @param spawnAtExitIndex - optional exit index to spawn at. If not provided, will use the default spawn point of the new scene
 */
export async function changeScene(k: KCtx, newSceneName: string, spawnAtExitIndex?: number): Promise<void> {
  // Remember where to spawn in the new scene
  gsm.update({
    persistent: {
      spawnAtExitIndex,
    },
  });

  // Start transition
  hudManager.hide();
  await fadeManager.showOverlay(0.3);
  k.go(newSceneName);

  // The rest happens in sceneTransitionWrapper
}
