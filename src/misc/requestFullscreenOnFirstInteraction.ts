import {Helpers} from './Helpers';

/**
 * Registers a one-time pointer interaction listener that requests fullscreen.
 * Does nothing in dev mode.
 */
export function requestFullscreenOnFirstInteraction(): void {
  if (import.meta.env.DEV) {
    return; // do not request fullscreen in dev mode
  }

  const callback = () => {
    Helpers.requestFullscreen();
    document.documentElement.removeEventListener('pointerup', callback);
  };

  document.documentElement.addEventListener('pointerup', callback);
}

