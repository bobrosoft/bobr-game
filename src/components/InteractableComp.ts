import {Comp, GameObj} from 'kaplay';
import {PlayerComp} from '../entities/player';

export interface InteractableComp extends Comp {
  interact: (player: PlayerComp) => Promise<void>;
}

const COMPONENT_ID = 'interactable-comp';

export function interactable(interact: (player: PlayerComp) => Promise<void>): InteractableComp {
  return {
    id: COMPONENT_ID,

    interact,

    add(this: GameObj<InteractableComp>) {
      this.tag('interactable');
    },

    destroy(this: GameObj<InteractableComp>) {
      this.untag('interactable');
    },
  };
}

interactable.id = COMPONENT_ID;
