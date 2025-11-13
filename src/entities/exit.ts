import {AreaComp, GameObj, PosComp, Vec2} from 'kaplay';
import {changeScene} from '../misc/changeScene';
import {GameEntity} from './generic/entity';

export interface ExitConfig {
  /** Index calculated from left to right. Leftmost exit on the map is 0. */
  currentMapExitIndex: number;

  /** Offset to apply to player spawn position on current map */
  spawnOffsetTiles: Vec2;

  /**
   * Returns destination level ID and exit index to use when player uses this exit
   * If undefined, exit will not function. It may be used to check exit conditions before exit.
   */
  getDestLevelParamsUponUse: () => {destLevel: string; destLevelExitIndex: number} | undefined;
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
      // Get dest level params
      const destParams = config.getDestLevelParamsUponUse();
      if (!destParams) {
        return;
      }

      // Switch level
      changeScene(k, destParams.destLevel, {
        isGameLevel: true,
        spawnAtExitIndex: destParams.destLevelExitIndex,
        quickSwitch: true,
      }).then();
    });

    return mainObj;
  },
};
