import {AreaComp, BodyComp, GameObj, HealthComp, PosComp, SpriteComp, Vec2} from 'kaplay';
import {PlayerComp} from '../player';

// List generic types for the enemy game object

export interface EnemyConfig {
  health: number; // hit points
  speedX?: number; // px/s
  attackPower?: number; // power of the attack
  knockbackPower?: Vec2; // power of the knockback
}

export interface EnemyComp extends GameObj<string | HealthComp | SpriteComp | PosComp | AreaComp> {
  config: EnemyConfig;
  registerHit: (player: PlayerComp) => void;
}
