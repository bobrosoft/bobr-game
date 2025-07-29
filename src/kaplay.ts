import kaplay, {KAPLAYCtx} from 'kaplay';

export const k = kaplay({
  global: false,
  width: 600,
  height: 400,
  letterbox: true,
  background: "#74dcf6",
  crisp: true,
  scale: 2,
  debug: true,
  debugKey: '`',
  buttons: {
    left: {
      keyboard: ["left", "a"],
      gamepad: ["west"],
    },
    right: {
      keyboard: ["right", "d"],
      gamepad: ["east"],
    },
    jump: {
      keyboard: ["space", "up", "w"],
      gamepad: ["south"],
    },
  },
}) as  KAPLAYCtx<{}, string>;