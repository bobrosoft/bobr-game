import {AnimateComp, AreaComp, GameObj, PosComp, ScaleComp} from 'kaplay';
import {interactable, InteractableComp} from '../components/InteractableComp';
import {GameEntity} from './generic/entity';
import {PlayerComp} from './player';

export interface InteractableItemConfig {
  sprite: string;
  flipX?: boolean;
  levitate?: boolean;
  interact: (player: PlayerComp) => Promise<void>;
  preInteractAction?: () => Promise<boolean>; // return false to prevent interaction
  postInteractAction?: () => Promise<void>;
}

export type InteractableItemGameObj = GameObj<PosComp | AnimateComp | AreaComp | ScaleComp | InteractableComp>;

export const InteractableItemEntity: GameEntity<InteractableItemConfig, InteractableItemGameObj> = {
  async loadResources(_k): Promise<void> {
    // NOTE: load sprite resources in the scene
  },

  spawn(k, posXY, config) {
    if (!config) throw new Error('InteractableItemEntity.spawn: config is required');

    const mainObj = k.add([
      //
      'interactable-item',
      k.pos(posXY),
      k.sprite(config.sprite, {flipX: config.flipX || false}),
      k.anchor('bot'),
      k.area({isSensor: true}),
      k.scale(),
      k.animate(),
      k.offscreen({hide: true}),
      interactable(async player => {
        if (config.preInteractAction) {
          const canInteract = await config.preInteractAction();
          if (!canInteract) {
            return;
          }
        }

        await config.interact(player);

        if (config.postInteractAction) {
          await config.postInteractAction();
        }
      }),
    ]);

    if (config.levitate) {
      mainObj.use(k.animate({relative: true}));
      mainObj.animate('pos', [k.vec2(0, -2), k.vec2(0, -6)], {
        duration: 1,
        easings: [k.easings['easeInOutCubic']],
        direction: 'ping-pong',
      });
    }

    return mainObj;
  },
};
