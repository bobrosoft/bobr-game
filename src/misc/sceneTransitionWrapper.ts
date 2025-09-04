import {KCtx} from '../kaplay';
import {fadeManager, gsm, hudManager} from '../main';
import {Helpers} from './Helpers';

/**
 * A wrapper for scene functions to add a fade in effect when the scene starts.
 * You should use changeScene to change scene for it to work properly
 * @param k
 * @param sceneFunc
 * @param options
 */
export function sceneTransitionWrapper(
  k: KCtx,
  sceneFunc: (k: KCtx) => Promise<void>,
  options?: {fadeInDuration?: number},
) {
  return async () => {
    // You should use changeScene to change scene for it to work properly

    gsm.prepareForNewScene();
    await sceneFunc(k);
    await Helpers.setTimeoutAsync(500);
    await fadeManager.hideOverlay(options?.fadeInDuration || 2);
    hudManager.show();
  };
}
