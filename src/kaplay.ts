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
      gamepad: ["dpad-left"],
    },
    right: {
      keyboard: ["right", "d"],
      gamepad: ["dpad-right"],
    },
    jump: {
      keyboard: ["space", "up", "w"],
      gamepad: ["south"],
    },
    action: {
      keyboard: ["j", "z"],
      gamepad: ["east"],
    }
  },
}) as  KAPLAYCtx<{}, string>;