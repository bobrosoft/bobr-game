import {Comp, FixedComp, GameObj, LayerComp, OpacityComp, StayComp} from 'kaplay';
import {k} from '../kaplay';

export interface HudComp extends Comp, OpacityComp, LayerComp, FixedComp, StayComp {
  shouldBeShown: boolean;
  targetOpacity?: number;
}

const COMPONENT_ID = 'hud-comp';

export function hud(options: {shouldBeShown: boolean; targetOpacity?: number}): HudComp {
  return {
    id: COMPONENT_ID,
    shouldBeShown: options.shouldBeShown,
    targetOpacity: options.targetOpacity || 1,

    add(this: GameObj<HudComp | LayerComp>) {
      this.tag('hud');
      this.use(k.layer('hud'));
      this.use(k.fixed());
      this.use(k.stay());
      this.use(k.opacity(options.targetOpacity));
    },
  } as HudComp; // need that because of typings issues
}

hud.id = COMPONENT_ID;
