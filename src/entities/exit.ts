import {AreaComp, GameObj, PosComp, Vec2} from 'kaplay';
import {changeScene} from '../misc/changeScene';
import {GameEntity} from './generic/entity';

export interface ExitConfig {
  currentMapExitIndex: number; // index calculated from left to right. Leftmost exit on the map is 0.
  spawnOffsetTiles: Vec2; // offset to apply to player spawn position
  destLevel: string; // level name to go to
  destLevelExitIndex: number; // index calculated from left to right. Leftmost exit on the map is 0.
}

export interface ExitGameObj extends GameObj<PosComp | AreaComp> {}

export const ExitEntity: GameEntity<ExitConfig, ExitGameObj> = {
  async loadResources(k): Promise<void> {},

  spawn(k, posXY, config) {
    const mainObj = k.add([
      //
      'exit',
      k.pos(posXY),
      k.rect(32, 64, {fill: false}),
      k.anchor('bot'),
      k.area(),
      k.offscreen({hide: true}),
    ]);

    mainObj.onCollide('player', () => {
      // Switch level
      changeScene(k, config.destLevel, config.destLevelExitIndex).then();
    });

    return mainObj;
  },
};
