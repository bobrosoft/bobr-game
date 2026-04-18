import {AreaComp, GameObj, PosComp, SpriteComp, Vec2} from 'kaplay';
import {InteractableComp} from '../../components/InteractableComp';

// List generic types for the NPC game object

export interface NpcConfig {
  flipX?: boolean;
  speedX?: number;
}

export interface NpcObj extends GameObj<string | SpriteComp | PosComp | AreaComp | InteractableComp> {
  config: NpcConfig;
  shouldShowInfoIcon?: () => boolean;
  walkToPosition?: (pos: Vec2) => void;
}
