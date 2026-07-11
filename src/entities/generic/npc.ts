import {AreaComp, GameObj, PosComp, SpriteComp, Vec2} from 'kaplay';
import {InteractableComp} from '../../components/InteractableComp';

// List generic types for the NPC game object

export interface NpcConfig {
  flipX?: boolean;
  speedX?: number;
  getAvailableInteractionType: () => string | null;
  performInteraction: (interactionType: string) => Promise<void>;
}

export interface NpcObj extends GameObj<string | SpriteComp | PosComp | AreaComp | InteractableComp> {
  config: NpcConfig;
  shouldShowInfoIcon?: () => boolean;
  walkToPosition?: (pos: Vec2) => void;
}
