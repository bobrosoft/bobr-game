import kaplay, {KAPLAYCtx} from 'kaplay';

const dimensions = determineWidthAndHeight();

export const k = kaplay({
  global: false,
  width: dimensions.width,
  height: dimensions.height,
  background: '#74dcf6',
  crisp: true,
  letterbox: true,
  pixelDensity: 2, // needed to remove artifacts with pixels
  scale: 2, // makes text look better because picture rendered at 2x size then scaled down
  debug: true,
  debugKey: '`',
  buttons: {
    left: {
      keyboard: ['left', 'a'],
      gamepad: ['dpad-left'],
    },
    right: {
      keyboard: ['right', 'd'],
      gamepad: ['dpad-right'],
    },
    jump: {
      keyboard: ['space', 'up', 'w', 'k'],
      gamepad: ['south'],
    },
    action: {
      keyboard: ['j', 'z'],
      gamepad: ['east'],
    }
  },
}) as  KAPLAYCtx<{}, string>;

function determineWidthAndHeight() {
  // Calculate responsive width and height based on window size
  let width = Math.min(window.innerWidth, 400);
  
  // Make width even for better pixel alignment
  if (width % 2 !== 0) {
    width -= 1;
  }
  
  let height = Math.floor(width / (window.innerWidth / window.innerHeight));
  
  // Make height even as well
  if (height % 2 !== 0) {
    height -= 1;
  }
  
  return {width, height};
}

export type KCtx = typeof k;