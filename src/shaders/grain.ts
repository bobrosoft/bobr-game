import {KCtx} from '../kaplay';

export function loadGrainShader(k: KCtx) {
  k.loadShader(
    'grain',
    null,
    `
    uniform float randSeed;
    uniform float canvasWidth;
    uniform float canvasHeight;
    uniform float mixLevel;
  
    float rand(vec2 co)
    {
      float a = 12.9898;
      float b = 78.233;
      float c = 43758.5453;
      float dt= dot(co.xy ,vec2(a,b));
      float sn= mod(dt,3.14);
      return fract(sin(sn) * c);
    }
  
    vec4 frag(vec2 pos, vec2 uv, vec4 color, sampler2D tex) {
      vec4 texColor = texture2D(tex, uv);
      
      // Scale UV to canvas size to make grain pixelated
      vec2 scaledUv = vec2(floor(uv.x * (canvasWidth * 0.3)), floor(uv.y * (canvasHeight * 0.3))); 
    
      // Make each pixel different grain
      float grain = rand(scaledUv * randSeed) * 0.5; // Adjust grain intensity here
      
      // Make it also greyscale
      float grey = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      vec4 grayedColor = vec4(grey + grain, grey + grain, grey + grain, texColor.a);
      
      // Mix the original color with the grayed color based on mivLevel
      return mix(texColor, grayedColor, mixLevel);
    }
  `,
  );
}

// k.usePostEffect('grain', () => ({
//   randSeed: Math.random(),
//   canvasWidth: k.width(),
//   canvasHeight: k.height(),
//   mixLevel: 1,
// }));
