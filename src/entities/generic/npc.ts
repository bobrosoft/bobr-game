import {AreaComp, GameObj, PosComp, SpriteComp} from 'kaplay';
import {InteractableComp} from '../../components/InteractableComp';

// List generic types for the NPC game object

export interface NpcConfig {
  flipX?: boolean;
}

export interface NpcComp extends GameObj<string | SpriteComp | PosComp | AreaComp | InteractableComp> {
  config: NpcConfig;
  shouldShowInfoIcon?: () => boolean;
}
