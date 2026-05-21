import {AreaComp, GameObj, PosComp} from 'kaplay';
import {GameEntity} from './generic/entity';

export interface TriggerConfig {
  // Height of trigger element in tiles
  heightTiles?: number;

  // Callback which triggered when player collides/intersect with the trigger
  onPlayerCollide(): void;
}

export interface TriggerGameObj extends GameObj<PosComp | AreaComp> {}

export const TriggerEntity: GameEntity<TriggerConfig, TriggerGameObj> = {
  async loadResources(k): Promise<void> {},

  spawn(k, posXY, c) {
    if (!c) throw new Error('TriggerEntity.spawn: config is required');

    const config: TriggerConfig = {
      heightTiles: 1,
      ...c,
    };

    const mainObj = k.add([
      //
      'trigger',
      k.pos(posXY),
      k.rect(32, config.heightTiles * 32, {fill: false}),
      k.anchor('bot'),
      k.area({isSensor: true}),
      k.offscreen({hide: true}),
    ]);

    mainObj.onCollide('player', () => {
      config.onPlayerCollide();
    });

    return mainObj;
  },
};
