export class Helpers {
  static isMobilePlatform(userAgent?: string): boolean {
    userAgent = userAgent || window.navigator.userAgent;
    return /ios|iphone|ipad|ipod|android|windows phone/gi.test(userAgent);
  }
}