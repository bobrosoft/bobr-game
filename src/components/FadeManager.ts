import {t} from 'i18next';
import {
  AnchorComp,
  GameObj,
  FixedComp,
  PosComp,
  ColorComp,
  RectComp,
  OpacityComp,
  LayerComp,
  AnimateComp,
} from 'kaplay';
import {KCtx} from '../kaplay';

export class FadeManager {
  protected fadeOverlay: GameObj<LayerComp | RectComp | ColorComp | OpacityComp | PosComp | FixedComp | AnchorComp>;
  protected letterboxTop: GameObj<LayerComp | RectComp | PosComp | ColorComp | AnchorComp | FixedComp>;
  protected letterboxBottom: GameObj<LayerComp | RectComp | PosComp | ColorComp | AnchorComp | FixedComp>;
  protected loadingLabel: GameObj<LayerComp | PosComp | FixedComp | AnchorComp | OpacityComp | ColorComp | AnimateComp>;
  protected loadingIndicatorTimeout: any;

  get isOverlayVisible(): boolean {
    return this.fadeOverlay.opacity > 0;
  }

  get isLetterboxVisible(): boolean {
    return this.letterboxTop.pos.y > 0.01;
  }

  constructor(
    protected k: KCtx,
    protected layer: string = 'fade',
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

    this.letterboxTop = k.add([
      'fade-letterbox-top',
      k.layer(layer),
      k.rect(k.width(), k.height() / 2),
      k.color(0, 0, 0),
      k.pos(0, 0),
      k.anchor('botleft'),
      k.fixed(),
      k.stay(),
    ]);

    this.letterboxBottom = k.add([
      'fade-letterbox-bottom',
      k.layer(layer),
      k.rect(k.width(), k.height() / 2),
      k.color(0, 0, 0),
      k.pos(0, k.height()),
      k.anchor('topleft'),
      k.fixed(),
      k.stay(),
    ]);

    this.loadingLabel = k.add([
      'fade-overlay-loading-label',
      k.layer(layer),
      k.pos(k.width() - 10, k.height() - 10),
      k.text(t('common.loading'), {size: 8, font: 'pixel'}),
      k.color('white'),
      k.anchor('botright'),
      k.fixed(),
      k.opacity(0),
      k.animate(),
      k.stay(),
    ]);
  }

  async fadeToBlack(duration: number = this.defaultDuration, options?: {showLoadingIfSlow?: boolean}): Promise<void> {
    this.fadeOverlay.opacity = 0;

    // Setup loading indicator timer
    if (options?.showLoadingIfSlow) {
      this.loadingIndicatorTimeout = setTimeout(() => {
        if (this.isOverlayVisible) {
          this.loadingLabel.opacity = 1;
          this.loadingLabel.animate('opacity', [1, 0.5], {
            duration: 1,
            direction: 'forward',
            easings: [this.k.easings['easeInCubic']],
          });
        }
      }, 2000);
    }

    return this.fadeTo(0, 1, duration);
  }

  async fadeFromBlack(duration: number = this.defaultDuration): Promise<void> {
    clearTimeout(this.loadingIndicatorTimeout);
    this.loadingIndicatorTimeout = undefined;
    this.loadingLabel.unanimateAll();
    this.loadingLabel.opacity = 0;

    await this.fadeTo(1, 0, duration);
  }

  async showLetterbox(duration: number = this.defaultDuration * 2): Promise<void> {
    const stripesWidth = 30;

    return this.k.tween(
      0,
      1,
      duration,
      value => {
        this.letterboxTop.pos = this.k.vec2(0, stripesWidth * value);
        this.letterboxBottom.pos = this.k.vec2(0, this.k.height() - stripesWidth * value);
      },
      this.k.easings['easeOutSine'],
    );
  }

  async hideLetterbox(duration: number = this.defaultDuration * 1.5): Promise<void> {
    const initialLetterboxTopY = this.letterboxTop.pos.y;
    const initialLetterboxBottomY = this.letterboxBottom.pos.y;

    return this.k.tween(0, 1, duration, value => {
      this.letterboxTop.pos = this.k.vec2(0, initialLetterboxTopY * (1 - value));
      this.letterboxBottom.pos = this.k.vec2(0, this.k.lerp(initialLetterboxBottomY, this.k.height(), value));
    });
  }

  protected async fadeTo(from: number, to: number, duration: number = 1): Promise<void> {
    return this.k.tween(from, to, duration, value => {
      this.fadeOverlay.opacity = value;
    });
  }
}
