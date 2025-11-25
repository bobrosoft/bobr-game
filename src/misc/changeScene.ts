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
  options: {isGameLevel: boolean; spawnAtExitIndex?: number; quickSwitch?: boolean},
): Promise<void> {
  isUsingQuickSwitch = options?.quickSwitch || false;

  // Remember game level and where to spawn in the new scene
  if (options.isGameLevel) {
    gsm.update({
      persistent: {
        spawnAtExitIndex: options?.spawnAtExitIndex,
        currentLevel: newSceneName,
      },
    });
  }

  // Start transition
  if (!isUsingQuickSwitch) {
    hudManager.hide();
  }
  await fadeManager.fadeToBlack(0.3, {showLoadingIfSlow: true});
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
      await fadeManager.fadeFromBlack(0.5);
    } else {
      await fadeManager.fadeFromBlack(1);
      hudManager.show();
    }
  };
}
