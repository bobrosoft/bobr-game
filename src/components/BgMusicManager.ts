import {AudioPlay, AudioPlayOpt} from 'kaplay';
import {KCtx} from '../kaplay';
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
  protected pendingMusic?: {name: string; options?: BgMusicManagerPlayOptions}; // queued music to play after user interaction

  constructor(
    protected k: KCtx,
    config?: Partial<BgMusicManagerConfig>,
  ) {
    this.config = {
      volume: 1,
      fadeOutDuration: 1.5,
      ...config,
    };

    // Setup user interaction listeners to resume audio context on mobile
    this.setupMobileAudioUnlock();
  }

  /**
   * Returns the name of the currently playing music track, or undefined if no music is playing.
   */
  getCurrentMusicName(): string | undefined {
    return this.currentMusicName;
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
      try {
        // Check if the requested music is already playing
        if (this.currentMusic && !this.currentMusic.paused && this.currentMusicName === name) {
          return; // do nothing
        }

        if (this.isFirstPlay) {
          this.isFirstPlay = false;
          await Helpers.setTimeoutAsync(100); // need that hack because on some devices (iOS) audio cannot be played without user interaction
        }

        // Try to resume audio context on mobile
        await this.resumeAudioContext();

        await this.fadeOutCurrentMusic(options?.fadeOutDuration);

        this.currentMusicName = name;
        this.currentMusic = this.k.play(name, {
          loop: true,
          volume: this.config.volume,
          ...options,
        });

        // Check if play was successful
        if (this.currentMusic && this.currentMusic.paused) {
          // Audio might be blocked, queue it for later
          this.pendingMusic = {name, options};
        } else {
          // Successfully started, clear any pending music
          this.pendingMusic = undefined;
        }
      } catch (error) {
        // Queue the music to try again after user interaction
        this.pendingMusic = {name, options};
      }
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

    if (this.currentMusic && !this.currentMusic.paused) {
      await this.k.tween(this.currentMusic.volume, 0, fadeOutDuration, v => {
        if (this.currentMusic) {
          this.currentMusic.volume = v;
        }
      });
      this.currentMusic.stop();
    }
  }

  /**
   * Sets up event listeners to unlock audio on mobile devices after user interaction
   */
  protected setupMobileAudioUnlock() {
    const unlockAudio = async () => {
      try {
        await this.resumeAudioContext();

        // If there's pending music, try to play it now
        if (this.pendingMusic) {
          const {name, options} = this.pendingMusic;
          this.pendingMusic = undefined;
          this.playMusic(name, options);
        }

        // Remove listeners after first successful unlock
        document.removeEventListener('touchstart', unlockAudio);
        document.removeEventListener('touchend', unlockAudio);
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      } catch (error) {
        // Keep listeners if unlock failed
        console.warn('Audio unlock attempt failed:', error);
      }
    };

    // Listen to various user interaction events
    document.addEventListener('touchstart', unlockAudio, {passive: true});
    document.addEventListener('touchend', unlockAudio, {passive: true});
    document.addEventListener('click', unlockAudio);
    document.addEventListener('keydown', unlockAudio);
  }

  /**
   * Tries to resume the audio context (required for mobile browsers)
   */
  protected async resumeAudioContext(): Promise<void> {
    try {
      // Access audio context through the global AudioContext if available
      const audioCtx = (this.k as any).audio?.ctx;
      if (audioCtx && audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
    } catch (error) {
      // Silently fail if audio context is not accessible
      console.debug('Could not resume audio context:', error);
    }
  }
}
