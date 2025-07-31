import kaplay, {KAPLAYCtx} from 'kaplay';

// Calculate responsive width and height based on window size
const width = Math.min(window.innerWidth, 400);
const height = Math.floor(width / (window.innerWidth / window.innerHeight));

export const k = kaplay({
  global: false,
  width: width,
  height: height,
  letterbox: true,
  background: '#74dcf6',
  crisp: true,
  scale: 2,
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

export type KCtx = typeof k;