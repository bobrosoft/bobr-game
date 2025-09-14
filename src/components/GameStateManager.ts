import {Helpers} from '../misc/Helpers';

export interface GameState {
  version: number; // for future state migrations
  persistent: {
    currentLevel: string;
    spawnAtExitIndex?: number; // index of the exit to spawn at when loading the level
    player: {
      deaths: number;
      hasLuckyCharm: boolean;
      inventory: string[]; // list of item IDs
    };
    oldBobr: {
      isIntroSaid?: boolean;
      isRespawnInfoSaid?: boolean;
    };
  };
  temp: {
    player: {
      health: number;
      tempInventory: string[];
    };
  };
}

export class GameStateManager {
  protected _state: GameState;
  protected localStorageKey = 'gameState';
  protected isUpdating = false;
  protected subscribersOnUpdate: Array<(state: GameState) => void> = [];
  protected subscribersOnDeath: Array<() => void> = [];

  get state() {
    return this._state;
  }

  constructor() {
    // Load state from localStorage or initialize a new one
    const savedState = localStorage.getItem(this.localStorageKey);
    try {
      if (savedState) {
        const clearState = this.getClearState();
        const persistentState = JSON.parse(savedState) as GameState['persistent'];

        this._state = Helpers.mergeDeep(this.getClearState(), {
          version: clearState.version, // use current version
          persistent: persistentState,
          temp: this.getTempStateFromPersistentState(persistentState),
        });
      }
    } catch (e) {
      // ignore
    }

    if (!this._state) {
      this.reset();
    }
  }

  update(newStatePart: PartialDeep<GameState>, skipSave?: boolean) {
    let shouldTriggerDeath = false;

    // Prevent recursive updates
    if (this.isUpdating) {
      throw new Error('Cannot call update() inside another update() call');
    }
    this.isUpdating = true;

    // Check if player just died
    if (this._state.temp.player.health && newStatePart.temp?.player?.health === 0) {
      newStatePart = Helpers.mergeDeep(newStatePart, {
        persistent: {
          player: {
            deaths: this._state.persistent.player.deaths + 1,
          },
        },
        temp: {
          player: {
            tempInventory: [], // drop all temp items on death
          },
        },
      });

      shouldTriggerDeath = true;
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

    // Trigger death callbacks if needed
    if (shouldTriggerDeath) {
      this.subscribersOnDeath.forEach(cb => cb());
    }
  }

  save() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this._state.persistent));
  }

  reset() {
    localStorage.removeItem(this.localStorageKey);
    this._state = this.getClearState();
    this.update({}); // Trigger update to notify subscribers and save state
  }

  /**
   * Prepare temp state for a new scene (e.g. reset player health, etc.)
   */
  prepareForNewScene() {
    // If player has picked up items in the current scene, we keep them
    this.update({
      persistent: {
        player: {
          inventory: [
            ...this._state.persistent.player.inventory,
            ...this._state.temp.player.tempInventory.filter(
              itemId => !this._state.persistent.player.inventory.includes(itemId),
            ),
          ],
        },
      },
      temp: {
        ...this.getTempStateFromPersistentState(this._state.persistent),
      },
    });
  }

  getIsPlayerHasItem(itemId: string): boolean {
    return (
      this._state.persistent.player.inventory.includes(itemId) || this._state.temp.player.tempInventory.includes(itemId)
    );
  }

  addToPersistentInventory(itemId: string): void {
    if (this.getIsPlayerHasItem(itemId)) {
      return;
    }

    this.update({
      persistent: {
        player: {
          inventory: [...this._state.persistent.player.inventory, itemId],
        },
      },
    });
  }

  addToTempInventory(itemId: string): void {
    if (this.getIsPlayerHasItem(itemId)) {
      return;
    }

    this.update({
      temp: {
        player: {
          tempInventory: [...this._state.temp.player.tempInventory, itemId],
        },
      },
    });
  }

  moveTempItemsToPersistentInventory(): void {
    const newItems = this._state.temp.player.tempInventory.filter(
      itemId => !this._state.persistent.player.inventory.includes(itemId),
    );

    if (newItems.length === 0) {
      return;
    }

    this.update({
      persistent: {
        player: {
          inventory: [...this._state.persistent.player.inventory, ...newItems],
        },
      },
      temp: {
        player: {
          tempInventory: [],
        },
      },
    });
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

  onDeath(callback: () => void): {cancel: () => void} {
    this.subscribersOnDeath.push(callback);

    return {
      cancel: () => {
        this.subscribersOnDeath = this.subscribersOnDeath.filter(cb => cb !== callback);
      },
    };
  }

  protected getTempStateFromPersistentState(persistentState: GameState['persistent']): GameState['temp'] {
    return {
      player: {
        health: persistentState.player.hasLuckyCharm ? 2 : 1,
        tempInventory: [],
      },
    };
  }

  protected getClearState(): GameState {
    const initialPersistentState = {
      currentLevel: undefined,
      player: {
        deaths: 0,
        hasLuckyCharm: false,
        inventory: [],
      },
      oldBobr: {
        isIntroSaid: false,
      },
    };

    return {
      version: 1,
      persistent: initialPersistentState,
      temp: this.getTempStateFromPersistentState(initialPersistentState),
    };
  }
}
