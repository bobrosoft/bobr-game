import deepmerge from 'deepmerge';

export class Helpers {
  /**
   * Check if the device is a touch device based on user agent or touch capabilities.
   * @param userAgent
   * @returns True if the device is a touch device, false otherwise.
   */
  static isTouchDevice(userAgent?: string): boolean {
    userAgent = userAgent || window.navigator.userAgent;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /ios|iphone|ipad|ipod|android|windows phone/gi.test(userAgent)
    );
  }

  /**
   * Check if the device is in landscape mode based on window dimensions.
   * @returns True if the device is in landscape mode, false otherwise.
   */
  static isLandscapeMode(): boolean {
    return window.innerWidth > window.innerHeight;
  }

  /**
   * Check if the device has a notch (currently only checks for iPhones).
   * @returns True if the device has a notch, false otherwise.
   */
  static hasNotch(): boolean {
    return !!navigator.userAgent.match(/iPhone/);
  }

  /**
   * Returns a promise that resolves after a specified number of milliseconds.
   * @param ms
   */
  static setTimeoutAsync(ms: number): Promise<void> {
    return new Promise<void>(resolve => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  /**
   * Merges any number of objects into a single result object, returning a new merged object.
   * @param target
   * @param sources
   */
  static mergeDeep<T>(target: T, ...sources: T[]): T {
    return deepmerge.all([target, ...sources], {arrayMerge: (_, source) => source});
  }
}
