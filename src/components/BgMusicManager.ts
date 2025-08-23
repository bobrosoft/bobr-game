import {AudioPlay, AudioPlayOpt} from 'kaplay';
import {k, KCtx} from '../kaplay';
import {Helpers} from '../misc/Helpers';

export interface BgMusicManagerConfig {
  volume: number;
  fadeOutDuration: number;
}

export interface BgMusicManagerPlayOptions extends AudioPlayOpt {
  fadeOutDuration?: number; // override default fadeInDuration for this play
}

export class BgMusicManager {
  public config: BgMusicManagerConfig; // make config public for runtime changes
  protected currentMusic?: AudioPlay;
  protected currentMusicName?: string;
  protected isFirstPlay: boolean = true;

  constructor(
    protected k: KCtx,
    config?: Partial<BgMusicManagerConfig>,
  ) {
    this.config = {
      volume: 1,
      fadeOutDuration: 1.5,
      ...config,
    };
  }

  /**
   * Defines music track. No preloading happens, just registers the track.
   * @param name
   * @param musicUrl
   */
  loadMusic(name: string, musicUrl: string) {
    this.k.loadMusic(name, musicUrl);
  }

  /**
   * Plays the requested music track, fading out any currently playing track.
   * @param name
   * @param options
   */
  playMusic(name: string, options?: BgMusicManagerPlayOptions) {
    (async () => {
      // Check if the requested music is already playing
      if (this.currentMusic && !this.currentMusic.paused && this.currentMusicName === name) {
        return; // do nothing
      }

      if (this.isFirstPlay) {
        this.isFirstPlay = false;
        await Helpers.setTimeoutAsync(100); // need that hack because on some devices (iOS) audio cannot be played without user interaction
      }

      await this.fadeOutCurrentMusic(options?.fadeOutDuration);

      this.currentMusic = this.k.play(name, {
        loop: true,
        volume: this.config.volume,
        ...options,
      });
      this.currentMusicName = name;
    })();
  }

  /**
   * Sets the volume for background music. If music is currently playing, adjusts its volume immediately.
   * @param volume
   */
  setVolume(volume: number) {
    this.config.volume = volume;
    if (this.currentMusic) {
      this.currentMusic.volume = volume;
    }
  }

  /**
   * Stops any currently playing music, fading it out over the specified duration.
   * @param fadeOutDuration
   */
  stopMusic(fadeOutDuration?: number) {
    this.fadeOutCurrentMusic(fadeOutDuration).then(() => {
      this.currentMusic = undefined;
      this.currentMusicName = undefined;
    });
  }

  /**
   * Pauses or resumes the currently playing music.
   */
  pauseMusic() {
    if (this.currentMusic) {
      this.currentMusic.paused = true;
    }
  }

  /**
   * Resumes the currently paused music.
   */
  resumeMusic() {
    if (this.currentMusic) {
      this.currentMusic.paused = false;
    }
  }

  protected async fadeOutCurrentMusic(fadeOutDuration?: number): Promise<void> {
    fadeOutDuration = fadeOutDuration ?? this.config.fadeOutDuration + 0.000001; // to avoid division by zero

    return new Promise(resolve => {
      if (this.currentMusic && !this.currentMusic.paused) {
        const initialVolume = this.currentMusic.volume;
        let elapsedTime = 0;
        const sub = this.k.onUpdate(() => {
          elapsedTime += this.k.dt();

          this.currentMusic.volume = this.k.lerp(initialVolume, 0, elapsedTime / fadeOutDuration);

          if (this.currentMusic!.volume === 0) {
            this.currentMusic.stop();
            sub.cancel();
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}
