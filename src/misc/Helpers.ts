export class Helpers {
  static isTouchDevice(userAgent?: string): boolean {
    userAgent = userAgent || window.navigator.userAgent;
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      /ios|iphone|ipad|ipod|android|windows phone/gi.test(userAgent)
    );
  }
}
