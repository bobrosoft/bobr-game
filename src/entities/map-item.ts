import {GameEntity} from './generic/entity';
import {InteractableItemConfig, InteractableItemEntity, InteractableItemGameObj} from './interactable-item';
import {PlayerComp} from './player';

export interface MapItemConfig extends InteractableItemConfig {
  shouldPickupOnInteract?: boolean;
}

export interface MapItemGameObj extends InteractableItemGameObj {
  animatePickupAndDestroy(player: PlayerComp): void;
}

export const MapItemEntity: GameEntity<MapItemConfig, MapItemGameObj> = {
  async loadResources(k): Promise<void> {
    // NOTE: you should load sprite resources in the scene

    k.loadSound('player-take-item', 'sounds/bobr-take-item.mp3');
  },

  spawn(k, posXY, config) {
    if (!config) throw new Error('MapItemEntity.spawn: config is required');

    let mainObj!: MapItemGameObj;

    const baseObj = InteractableItemEntity.spawn(k, posXY, {
      sprite: config.sprite,
      flipX: config.flipX,
      levitate: config.levitate,
      preInteractAction: config.preInteractAction,
      postInteractAction: config.postInteractAction,
      interact: config.interact
        ? async player => {
            await config.interact!(player);

            if (config.shouldPickupOnInteract !== false) {
              k.play('player-take-item');
              mainObj.animatePickupAndDestroy(player);
            }
          }
        : undefined,
    });

    mainObj = baseObj as unknown as MapItemGameObj;
    mainObj.animatePickupAndDestroy = animatePickupAndDestroy;

    function animatePickupAndDestroy(player: PlayerComp): void {
      (async () => {
        const initialPos = mainObj.pos;
        mainObj.unanimate('pos');

        await k.tween(0, 1, 0.3, v => {
          mainObj.scale = k.vec2(k.lerp(1, 0.5, v));

          // Move by arc to the player position
          const midPoint = k.vec2((initialPos.x + player.pos.x) / 2, Math.min(initialPos.y, player.pos.y) - 30);
          const t1 = k.lerp(initialPos, midPoint, v);
          const t2 = k.lerp(midPoint, player.pos, v);
          mainObj.pos = k.lerp(t1, t2, v);
        });

        mainObj.destroy();
      })();
    }

    return mainObj;
  },
};
