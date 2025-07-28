// src/entities/player.ts
import type kaplay from "kaplay";

type KCtx = ReturnType<typeof kaplay>;

export interface PlayerConfig {
  maxRunSpeed: number;
  accelGround: number;
  accelAir: number;
  decelGround: number;
  decelAir: number;
  jumpForce: number;
  coyoteTime: number;     // ms
  jumpBuffer: number;     // ms
  minRunAnimSpeed: number;
  maxRunAnimSpeed: number;
}

const DEFAULTS: PlayerConfig = {
  maxRunSpeed: 360,       // px/s
  accelGround: 2200,
  accelAir: 1200,
  decelGround: 2600,
  decelAir: 1400,
  jumpForce: 600,
  coyoteTime: 120,
  jumpBuffer: 120,
  minRunAnimSpeed: 6,     // frames / sec (or engine-specific unit)
  maxRunAnimSpeed: 18,
};

export function createPlayer(k: KCtx, posXY = k.vec2(100, 100), cfg: Partial<PlayerConfig> = {}) {
  const C = { ...DEFAULTS, ...cfg };

  // Track timing for coyote & jump buffer
  let lastOnGroundTime = -9999;
  let lastJumpPressTime = -9999;

  const player = k.add([
    k.sprite("player", { anim: "idle" }),
    k.pos(posXY),
    k.area(),
    k.body(),              // enables gravity + isGrounded()
    k.anchor("center"),
    k.state("idle", ["idle", "run", "jump", "fall"]),
    {
      id: "playerCtrl",
      vx: 0,
      get moveDir() {
        return (k.isKeyDown("right") || k.isKeyDown("d") ? 1 : 0) +
          (k.isKeyDown("left")  || k.isKeyDown("a") ? -1 : 0);
      },
    },
  ]);

  // --- INPUT: remember jump presses for "jump buffer"
  k.onKeyPress(["space", "up", "w"], () => {
    lastJumpPressTime = k.time();
  });

  // --- MAIN UPDATE ---
  player.onUpdate(() => {
    const dt = k.dt();
    const onGround = player.isGrounded();

    // track coyote time
    if (onGround) lastOnGroundTime = k.time();

    // horizontal movement
    const want = player.moveDir;
    const absVx = Math.abs(player.vx);
    const accel = onGround ? C.accelGround : C.accelAir;
    const decel = onGround ? C.decelGround : C.decelAir;

    if (want !== 0) {
      // accelerate toward target
      player.vx = k.moveTowards(player.vx, want * C.maxRunSpeed, accel * dt);
    } else {
      // decelerate toward zero
      const sign = Math.sign(player.vx);
      const mag = Math.max(0, absVx - decel * dt);
      player.vx = mag * sign;
    }

    // apply velocity to pos (Kaplay's body() already applies gravity to vy;
    // vx is usually read by you / set on obj; if your Kaplay build needs a different prop, adapt here)
    player.move(player.vx * dt, 0);

    // facing
    if (player.vx !== 0) player.flipX = player.vx < 0;

    // buffered / coyote jump
    const canCoyote = (k.time() - lastOnGroundTime) <= C.coyoteTime / 1000;
    const canBuffered = (k.time() - lastJumpPressTime) <= C.jumpBuffer / 1000;

    if (canBuffered && canCoyote) {
      doJump();
      // consume jump buffer
      lastJumpPressTime = -9999;
    }

    // animation state switches
    if (!onGround) {
      if (player.vel.y < 0) {
        setAnim("jump");
      } else {
        setAnim("fall");
      }
    } else {
      if (Math.abs(player.vx) > 5) {
        setAnim("run");
      } else {
        setAnim("idle");
      }
    }

    // scale run animation speed by current speed
    if (player.curAnim() === "run") {
      const t = k.clamp(Math.abs(player.vx) / C.maxRunSpeed, 0, 1);
      const animSpeed = k.lerp(C.minRunAnimSpeed, C.maxRunAnimSpeed, t);
      // Different Kaplay builds expose this differently; in most, you can do:
      player.play("run", { speed: animSpeed });
      // If that doesn't work in your build, try:
      // (player.get("sprite") as any).animSpeed = animSpeed;
    }
  });

  function doJump() {
    player.jump(C.jumpForce);
    setAnim("jump");
  }

  function setAnim(name: "idle" | "run" | "jump" | "fall") {
    if (player.curAnim() !== name) player.play(name);
  }

  return player;
}
