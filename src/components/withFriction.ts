import {Comp} from 'kaplay';
import {k} from '../kaplay';

type KCtx = typeof k;

/**
 * Component to apply friction to a game object when it is on the ground.
 * @param k
 * @param config
 */
export function withFriction(k: KCtx, config?: { // this: GameObj<WithFrictionComp>,  is not working
  friction?: number, // Friction force per second
  maxSpeed?: number, // Optional max horizontal speed
}): Comp {
  const friction = config?.friction ?? 100;
  const maxSpeed = config?.maxSpeed ?? Infinity;

  return {
    id: 'withFriction',
    require: ['pos', 'body'],

    update() {
      const grounded = this.isGrounded();
      
      // Limit horizontal speed
      this.vel.x = Math.sign(this.vel.x) * Math.min(Math.abs(this.vel.x), maxSpeed);

      // Apply friction only on ground
      if (grounded && Math.abs(this.vel.x) > 0.1) {
        const frictionForce = friction * k.dt();
        if (this.vel.x > 0) {
          this.vel.x = Math.max(0, this.vel.x - frictionForce);
        } else {
          this.vel.x = Math.min(0, this.vel.x + frictionForce);
        }
      }
    },
  };
}
