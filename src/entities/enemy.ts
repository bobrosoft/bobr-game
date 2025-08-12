import {AreaComp, BodyComp, GameObj, HealthComp, PosComp, SpriteComp} from 'kaplay';
import {PlayerComp} from './player';

// List generic types for the enemy game object

export interface EnemyConfig {
  health: number; // hit points
  speedX?: number; // px/s
  attackPower?: number; // power of the attack
}

export interface EnemyComp extends GameObj<string | HealthComp | SpriteComp | PosComp | AreaComp | BodyComp> {
  config: EnemyConfig;
  registerHit: (player: PlayerComp) => void;
}
