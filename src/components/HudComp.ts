import {Comp, FixedComp, GameObj, LayerComp, OpacityComp, StayComp} from 'kaplay';
import {k} from '../kaplay';

export type HudComp =
  | Comp
  | OpacityComp
  | LayerComp
  | FixedComp
  | StayComp
  | {
      shouldBeShown: boolean;
      targetOpacity?: number;
    };

const COMPONENT_ID = 'hud-comp';

export function hud(options: {shouldBeShown: boolean; targetOpacity?: number}): HudComp {
  return {
    id: COMPONENT_ID,
    shouldBeShown: options.shouldBeShown,
    targetOpacity: options.targetOpacity ?? 1,

    add(this: GameObj<HudComp>) {
      this.tag('hud');
      this.use(k.layer('hud'));
      this.use(k.fixed());
      this.use(k.stay());
      this.use(k.opacity(options.targetOpacity));
    },
  };
}

hud.id = COMPONENT_ID;
