import {KCtx} from '../kaplay';

export function loadCrtShader(k: KCtx) {
  k.loadShader(
    'crt',
    null,
    `
    uniform float time;
    uniform float canvasWidth;
    uniform float canvasHeight;
    uniform float mixLevel;
    uniform float curvature;

    // Apply barrel/pincushion distortion to simulate curved CRT glass
    vec2 curveUV(vec2 uv, float curve) {
      vec2 c = uv - 0.5;
      float dist = dot(c, c);
      c *= 1.0 + dist * curve;
      return c + 0.5;
    }

    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
      // Curved screen distortion
      vec2 curvedUV = curveUV(uv, curvature * 0.3);

      // Black outside the curved screen edges (curvature always applied)
      if (curvedUV.x < 0.0 || curvedUV.x > 1.0 || curvedUV.y < 0.0 || curvedUV.y > 1.0) {
        return vec4(0.0, 0.0, 0.0, 1.0);
      }

      // Base color sampled at curved UV — curvature always applied regardless of mixLevel
      vec4 curvedColor = texture2D(tex, curvedUV);

      // --- CRT visual effects, blended by mixLevel ---
      vec4 crtColor = curvedColor;

      // RGB phosphor mask — simulate the sub-pixel triad pattern
      float px = mod(pos.x, 3.0);
      float maskR = step(px, 1.0);
      float maskG = step(1.0, px) * step(px, 2.0);
      float maskB = step(2.0, px);
      vec3 mask = vec3(maskR, maskG, maskB) * 0.25 + 0.75;
      crtColor.rgb *= mask;

      // Horizontal scanlines
      float scanline = sin(curvedUV.y * canvasHeight * 3.14159) * 0.08 + 0.92;
      crtColor.rgb *= scanline;

      // Subtle rolling scanline band
      float rollSpeed = -0.15;
      float rollBand = mod(curvedUV.y - time * rollSpeed, 1.0);
      float rollEffect = smoothstep(0.0, 0.05, rollBand) * (1.0 - smoothstep(0.75, 1.0, rollBand));
      crtColor.rgb *= mix(1.0, rollEffect * 0.15 + 0.85, 0.8);

      // Slight green phosphor tint
      crtColor.rgb *= vec3(0.95, 1.02, 0.95);

      // Vignette
      vec2 vig = curvedUV * (1.0 - curvedUV.yx);
      float vignette = pow(vig.x * vig.y * 16.0, 0.3);
      crtColor.rgb *= mix(1.0, vignette, 0.6);

      // Subtle brightness boost to compensate for darkening effects
      crtColor.rgb *= 1.08;

      // mixLevel blends CRT effects on top of the (always-curved) base image
      return mix(curvedColor, crtColor, mixLevel);
    }
  `,
  );
}

// Usage example:
// k.usePostEffect('crt', () => ({
//   time: k.time(),
//   canvasWidth: k.width(),
//   canvasHeight: k.height(),
//   mixLevel: 0.5,
//   curvature: 0.3, // 0.0 = flat, higher = more curved
// }));
