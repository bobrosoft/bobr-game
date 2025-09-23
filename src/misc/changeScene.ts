import {KCtx} from '../kaplay';
import {fadeManager, gsm, hudManager} from '../main';
import {Helpers} from './Helpers';

let isUsingQuickSwitch = false;

/**
 * Change to a new scene with a fade out and fade in effect.
 * NOTE: That function assumes that the target scene is wrapped with sceneTransitionWrapper
 * @param k
 * @param newSceneName
 * @param options
 */
export async function changeScene(
  k: KCtx,
  newSceneName: string,
  options?: {spawnAtExitIndex?: number; quickSwitch?: boolean},
): Promise<void> {
  isUsingQuickSwitch = options?.quickSwitch || false;

  // Remember where to spawn in the new scene
  gsm.update({
    persistent: {
      spawnAtExitIndex: options?.spawnAtExitIndex,
    },
  });

  // Start transition
  if (!isUsingQuickSwitch) {
    hudManager.hide();
  }
  await fadeManager.showOverlay(0.3);
  k.go(newSceneName);

  // The rest happens in sceneWrapper
}

/**
 * A wrapper for scene functions to add a fade in effect when the scene starts, and other things.
 * You should use changeScene to change scene for it to work properly
 * @param k
 * @param sceneFunc
 */
export function sceneWrapper(k: KCtx, sceneFunc: (k: KCtx) => Promise<void>) {
  return async () => {
    // You should use changeScene to change scene for it to work properly

    gsm.prepareForNewScene();
    await sceneFunc(k);
    await Helpers.setTimeoutAsync(500);

    if (isUsingQuickSwitch) {
      hudManager.show();
      await fadeManager.hideOverlay(1);
    } else {
      await fadeManager.hideOverlay(1);
      hudManager.show();
    }
  };
}
