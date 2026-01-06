import {EaseFuncs, GameObj, KEventController, LevelComp, PosComp, TweenController} from 'kaplay';
import {PlayerComp} from '../entities/player';
import {KCtx} from '../kaplay';

export class CamManager {
  protected camConstraints: {
    kHeight: number;
    leftLimit?: number;
    rightLimit?: number;
    topLimit?: number;
    bottomLimit?: number;
  };

  protected lastPlayerInstance?: PlayerComp;
  protected playerUpdateListener?: KEventController;

  get isCamFollowingPlayer(): boolean {
    return !!this.playerUpdateListener;
  }

  constructor(protected k: KCtx) {
    this.camConstraints = {kHeight: k.height()};
  }

  /**
   * Set cam constraints based on level params
   * @param level
   * @param options
   */
  setCamConstraintsForLevel(
    level: GameObj<PosComp | LevelComp>,
    options?: {
      leftTilesPadding?: number;
      rightTilesPadding?: number;
      topTilesPadding?: number;
      bottomTilesPadding?: number;
    },
  ) {
    const levelWidth = level.levelWidth() - level.tileWidth() / 2;
    const levelHeight = level.levelHeight() - level.tileHeight() / 2;
    const kHeight = this.k.height();

    const leftPadding = (options.leftTilesPadding ?? 0) * level.tileWidth();
    const rightPadding = (options.rightTilesPadding ?? 0) * level.tileWidth();
    const topPadding = (options.topTilesPadding ?? 0) * level.tileHeight();
    const bottomPadding = (options.bottomTilesPadding ?? 0) * level.tileHeight();

    const leftLimit = level.pos.x + leftPadding + this.k.width() / 2;
    const rightLimit = level.pos.x + levelWidth - rightPadding - this.k.width() / 2;
    const topLimit = level.pos.y + topPadding + this.k.height() / 2;
    const bottomLimit = level.pos.y + levelHeight - bottomPadding - this.k.height() / 2;

    this.camConstraints = {
      kHeight,
      leftLimit,
      rightLimit,
      topLimit,
      bottomLimit,
    };
  }

  /**
   * Make the camera follow the player
   * @param enabled
   * @param player
   */
  setCamFollowPlayer(enabled: boolean, player?: PlayerComp): void {
    if (enabled) {
      this.lastPlayerInstance = player;
      this.playerUpdateListener?.cancel();
      this.playerUpdateListener = player.onUpdate(this.onPlayerUpdate.bind(this));
    } else {
      this.playerUpdateListener?.cancel();
      this.playerUpdateListener = undefined;
    }
  }

  /**
   * Moves cam to obj position
   * @param obj
   * @param options
   */
  moveCamToObj(
    obj: GameObj<PosComp>,
    options: {
      duration: number; // in seconds
      easing?: EaseFuncs;
    },
  ): TweenController {
    this.setCamFollowPlayer(false);

    const initialPos = this.k.getCamPos().clone();

    // Move cam
    return this.k.tween(
      0,
      1,
      options.duration,
      time => {
        this.setNewCamPos(this.k.lerp(initialPos.x, obj.pos.x, time), this.k.lerp(initialPos.y, obj.pos.y, time));
      },
      this.k.easings[options.easing || 'easeInOutCubic'],
    );
  }

  protected onPlayerUpdate(): void {
    if (!this.lastPlayerInstance) {
      return;
    }

    const newX = this.lastPlayerInstance.pos.x;
    const newY = this.lastPlayerInstance.pos.y - this.camConstraints.kHeight / 4; // offset a bit upwards for better view

    this.setNewCamPos(newX, newY);
  }

  protected setNewCamPos(x: number, y: number): void {
    this.k.setCamPos(
      this.k.clamp(x, this.camConstraints.leftLimit ?? -Infinity, this.camConstraints.rightLimit ?? Infinity),
      this.k.clamp(y, this.camConstraints.topLimit ?? -Infinity, this.camConstraints.bottomLimit ?? Infinity),
    );
  }
}
