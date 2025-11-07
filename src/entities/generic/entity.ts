import {GameObj, Vec2} from 'kaplay';
import {KCtx} from '../../kaplay';

export interface GameEntity<C, R = GameObj> {
  /**
   * Load all resources required for this entity
   * @param k
   */
  loadResources(k: KCtx): Promise<any>;

  /**
   * Spawn the entity in the game world
   * @param k
   * @param posXY
   * @param config
   */
  spawn(k: KCtx, posXY: Vec2, config?: Partial<C>): R;
}
