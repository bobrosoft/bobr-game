import {KCtx} from '../kaplay';
import {fadeManager, hud} from '../main';
import {Helpers} from '../misc/Helpers';

export async function changeScene(k: KCtx, newSceneName: string) {
  await fadeManager.showOverlay(0.3);
  k.go(newSceneName);
  await Helpers.setTimeoutAsync(500);
  await fadeManager.hideOverlay(2);
  hud.show();
}
