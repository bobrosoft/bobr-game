import {AnimateComp, AreaComp, GameObj, PosComp, ScaleComp} from 'kaplay';
import {interactable, InteractableComp} from '../components/InteractableComp';
import {GameEntity} from './generic/entity';
import {PlayerComp} from './player';

export interface MapItemConfig {
  sprite: string;
  flipX?: boolean;
  levitate?: boolean;
  interact?: (player: PlayerComp) => Promise<void>;
  shouldPickupOnInteract?: boolean;
}

export interface MapItemGameObj extends GameObj<PosComp | AnimateComp | AreaComp | ScaleComp | InteractableComp> {
  animatePickupAndDestroy(player: PlayerComp): void;
}

export const MapItemEntity: GameEntity<MapItemConfig, MapItemGameObj> = {
  async loadResources(k): Promise<void> {
    // NOTE: you should load sprite resources in the scene

    k.loadSound('player-take-item', 'sounds/bobr-take-item.mp3');
  },

  spawn(k, posXY, config) {
    const mainObj = k.add([
      //
      'map-item',
      k.pos(posXY),
      k.sprite(config.sprite, {flipX: config.flipX || false}),
      k.anchor('bot'),
      k.area(),
      k.scale(),
      k.animate(),
      k.offscreen({hide: true}),
      ...(config?.interact
        ? [
            interactable(async player => {
              await config.interact?.(player);

              if (config.shouldPickupOnInteract !== false) {
                k.play('player-take-item');
                mainObj.animatePickupAndDestroy(player);
              }
            }),
          ]
        : []),
      {
        animatePickupAndDestroy,
      },
    ]);

    if (config.levitate) {
      mainObj.use(k.animate({relative: true}));
      mainObj.animate('pos', [k.vec2(0, -2), k.vec2(0, -6)], {
        duration: 1,
        easings: [k.easings['easeInOutCubic']],
        direction: 'ping-pong',
      });
    }

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
