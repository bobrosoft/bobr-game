import {EaseFuncs, TweenController} from 'kaplay';
import {KCtx} from '../kaplay';
import {gsm} from '../main';
import {loadBloomShader} from '../shaders/bloom';
import {loadCrtShader} from '../shaders/crt';

export class ShaderManager {
  // That variable used to smoothly apply shader. 0 - shader not applied. 1 - shader applied to it's full force
  protected shaderMixLevel: number = 0;
  protected currentShaderName: ShaderName = null;
  protected currentTween: TweenController = null;

  constructor(protected k: KCtx) {
    // Load existing shaders
    loadCrtShader(k);
    loadBloomShader(k);
  }

  enableDefaultShader(): TweenController {
    if (!gsm.state.persistent.settings.isDefaultShaderEnabled) {
      return this.k.tween(0, 1, 0, () => {
        // noop
      });
    }

    return this.enableShader('default', {duration: 1});
  }

  enableShader(name: ShaderName = 'default', options?: {duration?: number; easing?: EaseFuncs}): TweenController {
    const k = this.k;

    // Exit if shader already applied
    if (this.currentShaderName === name) {
      return;
    }

    // Need to finish previous shader animation if it exists
    if (this.currentTween) {
      this.currentTween.finish();
    }

    this.useShader(name);
    this.currentTween = k.tween(
      this.shaderMixLevel,
      1,
      options?.duration ?? 0.1,
      v => {
        this.shaderMixLevel = v;
      },
      options?.easing ? k.easings[options?.easing] : undefined,
    );
    this.currentTween.then(() => {
      this.currentTween = undefined;
    });

    return this.currentTween;
  }

  disableShader(options?: {duration?: number; easing?: EaseFuncs}): TweenController {
    const k = this.k;

    // Need to finish previous shader animation if it exists
    if (this.currentTween) {
      this.currentTween.finish();
    }

    this.currentTween = k.tween(
      this.shaderMixLevel,
      0,
      options?.duration ?? 0.1,
      v => {
        this.shaderMixLevel = v;
      },
      options?.easing ? k.easings[options?.easing] : undefined,
    );
    this.currentTween.then(() => {
      this.currentTween = undefined;
      this.useShader(null);
    });

    return this.currentTween;
  }

  protected useShader(name: ShaderName) {
    const k = this.k;

    switch (name) {
      case null:
        k.usePostEffect(null);
        break;

      case 'bloom':
        k.usePostEffect('bloom', () => ({
          bloomStrength: this.shaderMixLevel,
          canvasWidth: k.width(),
          canvasHeight: k.height(),
        }));
        break;

      default:
        k.usePostEffect('crt', () => ({
          time: k.time(),
          canvasWidth: k.width(),
          canvasHeight: k.height(),
          mixLevel: 0.5 * this.shaderMixLevel,
          curvature: 0.3 * this.shaderMixLevel, // 0.0 = flat, higher = more curved
        }));
    }

    this.currentShaderName = name;
  }
}

type ShaderName = 'default' | 'bloom';
