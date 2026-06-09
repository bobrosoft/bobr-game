import {Helpers} from './Helpers';

/**
 * Watches for device orientation changes and reloads the page when the orientation
 * switches from the initial one.
 *
 * We listen to both 'resize' and 'orientationchange' because:
 * - 'resize' works in Safari browser but NOT reliably in iOS PWA (standalone) mode.
 * - 'orientationchange' fires in iOS PWA mode but window.innerWidth/Height may not
 *   have updated yet, so we use screen.orientation / window.orientation to determine
 *   the new orientation instead of comparing dimensions immediately.
 */
export function watchForOrientationChange(isInitialOrientationLandscape: boolean): void {
  let reloadScheduled = false;

  const scheduleReloadIfOrientationChanged = (isNowLandscape: boolean) => {
    if (isInitialOrientationLandscape) {
      return; // Started landscape — game supports it natively, no reload needed
    }
    if (isNowLandscape === isInitialOrientationLandscape) {
      return; // Orientation did not change, nothing to do
    }
    if (reloadScheduled) {
      return; // Avoid double-scheduling
    }
    reloadScheduled = true;
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  window.addEventListener('resize', () => {
    scheduleReloadIfOrientationChanged(Helpers.isLandscapeMode());
  });

  // 'orientationchange' fires in iOS PWA standalone mode where 'resize' is unreliable.
  // Dimensions are stale at this point, so derive landscape from the orientation angle.
  window.addEventListener('orientationchange', () => {
    let isNowLandscape: boolean;
    if (screen.orientation) {
      // Modern API: angle 90/270 = landscape
      isNowLandscape =
        screen.orientation.type === 'landscape-primary' || screen.orientation.type === 'landscape-secondary';
    } else {
      // Legacy iOS fallback: window.orientation 90/-90 = landscape
      isNowLandscape = Math.abs((window as any).orientation) === 90;
    }
    scheduleReloadIfOrientationChanged(isNowLandscape);
  });
}

