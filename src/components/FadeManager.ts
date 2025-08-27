import {AnchorComp, GameObj, FixedComp, PosComp, ColorComp, RectComp, OpacityComp, LayerComp} from 'kaplay';
import {KCtx} from '../kaplay';

export class FadeManager {
  protected fadeOverlay: GameObj<LayerComp | RectComp | ColorComp | OpacityComp | PosComp | FixedComp | AnchorComp>;

  constructor(
    protected k: KCtx,
    layer: string = 'fade',
    protected defaultDuration: number = 0.6,
  ) {
    this.fadeOverlay = k.add([
      'fade-overlay',
      k.layer(layer),
      k.rect(k.width(), k.height()),
      k.color(0, 0, 0),
      k.pos(0, 0),
      k.fixed(),
      k.anchor('topleft'),
      k.opacity(0),
      k.stay(),
    ]);
  }

  async showOverlay(duration: number = this.defaultDuration): Promise<void> {
    this.fadeOverlay.opacity = 0;
    this.fadeOverlay.hidden = false;

    return this.fadeTo(0, 1, duration);
  }

  async hideOverlay(duration: number = this.defaultDuration): Promise<void> {
    await this.fadeTo(1, 0, duration);
    this.fadeOverlay.hidden = false;
  }

  protected async fadeTo(from: number, to: number, duration: number = 1): Promise<void> {
    return new Promise(resolve => {
      let elapsedTime = 0;
      const sub = this.fadeOverlay.onUpdate(() => {
        elapsedTime += this.k.dt();

        this.fadeOverlay.opacity = this.k.lerp(from, to, elapsedTime / duration);

        if (elapsedTime >= duration) {
          this.fadeOverlay.opacity = to;
          sub.cancel();
          resolve();
        }
      });
    });
  }
}
