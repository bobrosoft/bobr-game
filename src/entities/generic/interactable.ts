import {PlayerComp} from '../player';

export interface Interactable {
  interact: (player: PlayerComp) => Promise<void>;
}
