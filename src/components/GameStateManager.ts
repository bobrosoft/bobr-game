import {Helpers} from '../misc/Helpers';

export interface GameState {
  persistent: {
    currentLevel: string;
    player: {
      deaths: number;
      hasLuckyCharm: boolean;
    };
    oldBobr: {
      isIntroSaid?: boolean;
    };
  };
  temp: {
    player: {
      health: number;
    };
  };
}

export class GameStateManager {
  protected _state: GameState;
  protected localStorageKey = 'gameState';
  protected isUpdating = false;
  protected subscribersOnUpdate: Array<(state: GameState) => void> = [];

  get state() {
    return this._state;
  }

  constructor() {
    // Load state from localStorage or initialize a new one
    const savedState = localStorage.getItem(this.localStorageKey);
    try {
      if (savedState) {
        const persistentState = JSON.parse(savedState) as GameState['persistent'];

        this._state = {
          persistent: persistentState,
          temp: this.getTempStateFromPersistentState(persistentState),
        };
      }
    } catch (e) {
      // ignore
    }

    if (!this._state) {
      this.reset();
    }
  }

  update(newStatePart: PartialDeep<GameState>, skipSave?: boolean) {
    // Prevent recursive updates
    if (this.isUpdating) {
      throw new Error('Cannot call update() inside another update() call');
    }
    this.isUpdating = true;

    // Check if health at zero
    if (newStatePart.temp?.player?.health === 0) {
      newStatePart = Helpers.mergeDeep(newStatePart, {
        persistent: {
          player: {
            deaths: this._state.persistent.player.deaths + 1,
          },
        },
      });
    }

    // Merge new state part into the current state
    this._state = Helpers.mergeDeep(this._state, newStatePart) as GameState;

    // Notify subscribers
    this.subscribersOnUpdate.forEach(cb => cb(this._state));

    // Save only if persistent state changed
    if (newStatePart.persistent && !skipSave) {
      this.save();
    }

    this.isUpdating = false;
  }

  save() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this._state.persistent));
  }

  reset() {
    localStorage.removeItem(this.localStorageKey);

    const initialPersistentState = {
      currentLevel: undefined,
      player: {
        deaths: 0,
        hasLuckyCharm: false,
      },
      oldBobr: {
        isIntroSaid: false,
      },
    };

    this._state = {
      persistent: initialPersistentState,
      temp: this.getTempStateFromPersistentState(initialPersistentState),
    };

    this.update({}); // Trigger update to notify subscribers and save state
  }

  /**
   * Prepare temp state for a new scene (e.g. reset player health, etc.)
   */
  prepareForNewScene() {
    this._state.temp = {
      ...this.getTempStateFromPersistentState(this._state.persistent),
      player: {
        health: this._state.temp.player.health
          ? this._state.temp.player.health
          : this._state.persistent.player.hasLuckyCharm
            ? 2
            : 1,
      },
    };
  }

  /**
   * Subscribe to state updates
   * @param callback
   * @return
   */
  onUpdate(callback: (state: GameState) => void): {cancel: () => void} {
    this.subscribersOnUpdate.push(callback);

    return {
      cancel: () => {
        this.subscribersOnUpdate = this.subscribersOnUpdate.filter(cb => cb !== callback);
      },
    };
  }

  protected getTempStateFromPersistentState(persistentState: GameState['persistent']): GameState['temp'] {
    return {
      player: {
        health: persistentState.player.hasLuckyCharm ? 2 : 1,
      },
    };
  }
}
