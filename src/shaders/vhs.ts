import {KCtx} from '../kaplay';

export function loadVhsShader(k: KCtx) {
  k.loadShader(
    'vhs',
    null,
    `
    uniform float time;
    uniform float randSeed;
    uniform float canvasWidth;
    uniform float canvasHeight;
    uniform float mixLevel;

    float rand(vec2 co) {
      float a = 12.9898;
      float b = 78.233;
      float c = 43758.5453;
      float dt = dot(co.xy, vec2(a, b));
      float sn = mod(dt, 3.14);
      return fract(sin(sn) * c);
    }

    // Horizontal distortion (tape wobble)
    float tapeWobble(float y, float t) {
      float wobble = sin(y * 8.0 + t * 3.0) * 0.0015;
      wobble += sin(y * 23.0 - t * 7.0) * 0.0008;
      return wobble;
    }

    // Occasional glitch band
    float glitchBand(float y, float t) {
      float bandPos = mod(t * 0.3, 1.0);
      float bandSize = 0.04;
      float inBand = step(bandPos, y) * step(y, bandPos + bandSize);
      return inBand * (rand(vec2(floor(t * 10.0), 0.0)) - 0.5) * 0.04;
    }

    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
      float t = time;

      // Tape wobble + glitch horizontal shift
      float shiftX = tapeWobble(uv.y, t) + glitchBand(uv.y, t);

      // Chromatic aberration — shift R and B channels slightly
      float aberration = 0.003 * mixLevel;
      vec2 uvR = vec2(uv.x + shiftX + aberration, uv.y);
      vec2 uvG = vec2(uv.x + shiftX,               uv.y);
      vec2 uvB = vec2(uv.x + shiftX - aberration,  uv.y);

      float r = texture2D(tex, uvR).r;
      float g = texture2D(tex, uvG).g;
      float b = texture2D(tex, uvB).b;
      float a = texture2D(tex, uvG).a;
      vec4 vhsColor = vec4(r, g, b, a);

      // Scanlines
      float scanline = sin(uv.y * canvasHeight * 1.5) * 0.04 + 0.96;
      vhsColor.rgb *= scanline;

      // VHS noise grain
      vec2 scaledUv = vec2(floor(uv.x * canvasWidth * 0.25), floor(uv.y * canvasHeight * 0.25));
      float grain = (rand(scaledUv + randSeed) - 0.5) * 0.12;
      vhsColor.rgb += grain;

      // Slight colour desaturation towards luma
      float luma = dot(vhsColor.rgb, vec3(0.299, 0.587, 0.114));
      vhsColor.rgb = mix(vhsColor.rgb, vec3(luma), 0.25 * mixLevel);

      // Vignette
      vec2 vig = uv * (1.0 - uv.yx);
      float vignette = pow(vig.x * vig.y * 15.0, 0.25);
      vhsColor.rgb *= mix(1.0, vignette, 0.5 * mixLevel);

      vec4 original = texture2D(tex, vec2(uv.x + shiftX, uv.y));
      return mix(original, vhsColor, mixLevel);
    }
  `,
  );
}

// Usage example:
// k.usePostEffect('vhs', () => ({
//   time: k.time(),
//   randSeed: Math.random(),
//   canvasWidth: k.width(),
//   canvasHeight: k.height(),
//   mixLevel: 1.0,
// }));
