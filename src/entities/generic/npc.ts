import {AreaComp, GameObj, PosComp, SpriteComp} from 'kaplay';
import {Interactable} from './interactable';

// List generic types for the NPC game object

export interface NpcConfig {}

export interface NpcComp extends GameObj<string | SpriteComp | PosComp | AreaComp>, Interactable {
  config: NpcConfig;
  shouldShowInfoIcon?: () => boolean;
}
