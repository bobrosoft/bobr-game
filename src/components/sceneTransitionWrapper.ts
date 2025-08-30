import {KCtx} from '../kaplay';
import {fadeManager, hud} from '../main';
import {Helpers} from '../misc/Helpers';

export function sceneTransitionWrapper(
  k: KCtx,
  sceneFunc: (k: KCtx) => Promise<void>,
  options?: {fadeInDuration?: number; fadeOutDuration?: number},
) {
  return async () => {
    await fadeManager.showOverlay(options?.fadeOutDuration || 0.3);
    await sceneFunc(k);
    await Helpers.setTimeoutAsync(500);
    await fadeManager.hideOverlay(options?.fadeInDuration || 2);
    hud.show();
  };
}
