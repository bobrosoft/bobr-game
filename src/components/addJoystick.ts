import {KCtx} from '../kaplay';

/**
 * Adds a joystick and buttons for left/right movement, jump, and action.
 * The joystick is on the left side of the screen, and buttons are on the right.
 * @param k - Kaplay context
 * @param options - Optional configuration for joystick size and dead zone
 */
export function addJoystick(
  k: KCtx,
  options?: {
    size?: number;
    deadZone?: number;
  },
) {
  const size = options?.size ?? 100;
  const deadZone = options?.deadZone ?? 0.1;

  k.loadSprite('joystick.jump', 'sprites/icons/jump.gif');
  k.loadSprite('joystick.attack', 'sprites/icons/attack.gif');

  let isDragging = false;
  let origin = k.vec2(0, 0);
  let delta = k.vec2(0, 0);

  const base = k.add([
    'joystickBase',
    'hud',
    k.layer('hud'),
    k.fixed(),
    k.stay(),
    k.pos(-9999, -9999),
    k.circle(size / 2),
    k.color(0, 0, 0),
    // k.outline(1, k.rgb(255, 255, 255), 0.5),
    k.opacity(0.2),
    k.anchor('center'),
  ]);

  const knob = k.add([
    'joystickKnob',
    'hud',
    k.layer('hud'),
    k.fixed(),
    k.stay(),
    k.pos(-9999, -9999),
    k.circle(size / 4),
    k.color(255, 255, 255),
    k.opacity(0.7),
    k.anchor('center'),
  ]);

  // Add jump button on the right side
  const jumpButton = k.add([
    'jumpButton',
    'hud',
    k.layer('hud'),
    k.fixed(),
    k.stay(),
    k.pos(k.width() - size * 0.5, k.height() - size * 0.5),
    k.area(),
    k.circle(size / 3),
    k.color(0, 0, 0),
    k.opacity(0.2),
    k.anchor('center'),
  ]);
  jumpButton.add([k.sprite('joystick.jump'), k.anchor('center')]);

  jumpButton.onClick(() => {
    k.pressButton('jump');
    k.releaseButton('jump');
  });

  // Add attack button on the right side
  const attackButton = k.add([
    'attackButton',
    'hud',
    k.layer('hud'),
    k.fixed(),
    k.stay(),
    k.pos(k.width() - size * 1.1, k.height() - size * 1.1),
    k.area(),
    k.circle(size / 2.5),
    k.color(0, 0, 0),
    k.opacity(0.2),
    k.anchor('center'),
  ]);
  attackButton.add([k.sprite('joystick.attack'), k.anchor('center'), k.scale(1.2)]);

  attackButton.onClick(() => {
    k.pressButton('action');
    k.releaseButton('action');
  });

  base.onTouchStart(pos => {
    if (pos.x > k.width() * 0.6) return; // Need to react only to the left half of screen

    origin = pos;
    isDragging = true;

    base.pos = origin;
    knob.pos = origin;
    base.hidden = false;
    knob.hidden = false;
  });

  base.onTouchMove(pos => {
    if (!isDragging) return;
    if (pos.x > k.width() * 0.6) return; // Need to react only to the left half of screen

    delta = pos.sub(origin);
    const max = size / 2;
    const clamped = k.vec2(k.clamp(delta.x, -max, max), k.clamp(delta.y, -max, max));
    knob.pos = origin.add(clamped);
  });

  base.onTouchEnd(pos => {
    if (pos.x > k.width() * 0.6) return; // Need to react only to the left half of screen

    isDragging = false;
    delta = k.vec2(0, 0);
    base.pos = k.vec2(-9999, -9999);
    knob.pos = k.vec2(-9999, -9999);

    k.releaseButton('left');
    k.releaseButton('right');
  });

  base.onUpdate(() => {
    if (!isDragging) return;

    const norm = delta.scale(1 / (size / 2));
    const dirX = norm.x;

    if (dirX < -deadZone) {
      k.pressButton('left');
      k.releaseButton('right');
    } else if (dirX > deadZone) {
      k.pressButton('right');
      k.releaseButton('left');
    } else {
      k.releaseButton('left');
      k.releaseButton('right');
    }
  });
}
