// Bloom shader
// bloomStrength: 0.0 = no bloom, 1.0 = full bloom
import {KCtx} from '../kaplay';

export function loadBloomShader(k: KCtx) {
  k.loadShader(
    'bloom',
    null,
    `
    uniform float bloomStrength;   // 0.0 – 1.0
    uniform float canvasWidth;
    uniform float canvasHeight;

    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
      // Early-out when bloom is disabled
      if (bloomStrength <= 0.0) {
        return texture2D(tex, uv);
      }

      vec2 texel = vec2(1.0 / canvasWidth, 1.0 / canvasHeight) * 1.5; // per-step spread

      // Two-scale sampling: tight pass (texel * 1) + wide pass (texel * 3)
      // blended together to approximate a wider Gaussian without extra passes.

      // --- Pass A: 5x5 Gaussian kernel (GLSL ES 1.0 – fully unrolled, sum=256) ---
      // Row -2
      vec4 blurA =
        texture2D(tex, uv + vec2(-2.0, -2.0) * texel) * (1.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0, -2.0) * texel) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2( 0.0, -2.0) * texel) * (6.0  / 256.0) +
        texture2D(tex, uv + vec2( 1.0, -2.0) * texel) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2( 2.0, -2.0) * texel) * (1.0  / 256.0) +
      // Row -1
        texture2D(tex, uv + vec2(-2.0, -1.0) * texel) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0, -1.0) * texel) * (16.0 / 256.0) +
        texture2D(tex, uv + vec2( 0.0, -1.0) * texel) * (24.0 / 256.0) +
        texture2D(tex, uv + vec2( 1.0, -1.0) * texel) * (16.0 / 256.0) +
        texture2D(tex, uv + vec2( 2.0, -1.0) * texel) * (4.0  / 256.0) +
      // Row  0
        texture2D(tex, uv + vec2(-2.0,  0.0) * texel) * (6.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0,  0.0) * texel) * (24.0 / 256.0) +
        texture2D(tex, uv + vec2( 0.0,  0.0) * texel) * (36.0 / 256.0) +
        texture2D(tex, uv + vec2( 1.0,  0.0) * texel) * (24.0 / 256.0) +
        texture2D(tex, uv + vec2( 2.0,  0.0) * texel) * (6.0  / 256.0) +
      // Row +1
        texture2D(tex, uv + vec2(-2.0,  1.0) * texel) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0,  1.0) * texel) * (16.0 / 256.0) +
        texture2D(tex, uv + vec2( 0.0,  1.0) * texel) * (24.0 / 256.0) +
        texture2D(tex, uv + vec2( 1.0,  1.0) * texel) * (16.0 / 256.0) +
        texture2D(tex, uv + vec2( 2.0,  1.0) * texel) * (4.0  / 256.0) +
      // Row +2
        texture2D(tex, uv + vec2(-2.0,  2.0) * texel) * (1.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0,  2.0) * texel) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2( 0.0,  2.0) * texel) * (6.0  / 256.0) +
        texture2D(tex, uv + vec2( 1.0,  2.0) * texel) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2( 2.0,  2.0) * texel) * (1.0  / 256.0);

      // --- Pass B: same 5x5 kernel at 3x the spread for a wide soft halo ---
      vec2 texelWide = texel * 3.0;
      vec4 blurB =
        texture2D(tex, uv + vec2(-2.0, -2.0) * texelWide) * (1.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0, -2.0) * texelWide) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2( 0.0, -2.0) * texelWide) * (6.0  / 256.0) +
        texture2D(tex, uv + vec2( 1.0, -2.0) * texelWide) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2( 2.0, -2.0) * texelWide) * (1.0  / 256.0) +
        texture2D(tex, uv + vec2(-2.0, -1.0) * texelWide) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0, -1.0) * texelWide) * (16.0 / 256.0) +
        texture2D(tex, uv + vec2( 0.0, -1.0) * texelWide) * (24.0 / 256.0) +
        texture2D(tex, uv + vec2( 1.0, -1.0) * texelWide) * (16.0 / 256.0) +
        texture2D(tex, uv + vec2( 2.0, -1.0) * texelWide) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2(-2.0,  0.0) * texelWide) * (6.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0,  0.0) * texelWide) * (24.0 / 256.0) +
        texture2D(tex, uv + vec2( 0.0,  0.0) * texelWide) * (36.0 / 256.0) +
        texture2D(tex, uv + vec2( 1.0,  0.0) * texelWide) * (24.0 / 256.0) +
        texture2D(tex, uv + vec2( 2.0,  0.0) * texelWide) * (6.0  / 256.0) +
        texture2D(tex, uv + vec2(-2.0,  1.0) * texelWide) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0,  1.0) * texelWide) * (16.0 / 256.0) +
        texture2D(tex, uv + vec2( 0.0,  1.0) * texelWide) * (24.0 / 256.0) +
        texture2D(tex, uv + vec2( 1.0,  1.0) * texelWide) * (16.0 / 256.0) +
        texture2D(tex, uv + vec2( 2.0,  1.0) * texelWide) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2(-2.0,  2.0) * texelWide) * (1.0  / 256.0) +
        texture2D(tex, uv + vec2(-1.0,  2.0) * texelWide) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2( 0.0,  2.0) * texelWide) * (6.0  / 256.0) +
        texture2D(tex, uv + vec2( 1.0,  2.0) * texelWide) * (4.0  / 256.0) +
        texture2D(tex, uv + vec2( 2.0,  2.0) * texelWide) * (1.0  / 256.0);

      // Combine: tight pass for sharp core glow, wide pass for dreamy halo
      vec4 blurred = blurA * 0.4 + blurB * 0.6;

      vec4 original = texture2D(tex, uv);

      // Use per-channel brightness so colors are preserved (no grayscale collapse)
      vec3 channelBrightness = blurred.rgb;
      float threshold = 0.2;
      
      // Per-channel bloom mask preserves hue
      vec3 bloomMask = smoothstep(threshold, 1.0, channelBrightness);
      vec4 bloomLayer = vec4(blurred.rgb * bloomMask, blurred.a);

      // Additive blend: original + coloured bloom
      vec4 result = original + bloomLayer * bloomStrength * 3.5;

      // Soft exposure boost for the dreamy brightness — lifted shadows, no tone-map darkening
      result.rgb = result.rgb * 1.25 + vec3(0.06);

      // Gentle Reinhard tone-map only for highlight control (keeps mid-tones bright)
      result.rgb = result.rgb / (result.rgb * 0.5 + vec3(1.0));
      result.a = original.a;

      return mix(original, result, bloomStrength);
    }
  `,
  );
}

// k.usePostEffect('bloom', () => ({
//   bloomStrength: k.wave(0, 1, k.time()), // change to 0.0 to disable, 1.0 for full
//   canvasWidth: k.width(),
//   canvasHeight: k.height(),
// }));
