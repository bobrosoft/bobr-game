export interface GameState {
  currentLevel: string;
  player: {
    deaths: number;
  };
  oldBobr: {
    isIntroSaid?: boolean;
  };
}

export class GameStateManager {
  protected _state: GameState;
  protected localStorageKey = 'gameState';

  get state() {
    return this._state;
  }

  constructor() {
    // Load state from localStorage or initialize a new one
    const savedState = localStorage.getItem(this.localStorageKey);
    try {
      if (savedState) {
        this._state = JSON.parse(savedState);
      }
    } catch (e) {
      // ignore
    }

    if (!this._state) {
      this.resetState();
    }
  }

  setState(newState: Partial<GameState>, skipSave?: boolean) {
    this._state = {
      ...this._state,
      ...newState,
    };

    if (!skipSave) {
      this.saveState();
    }
  }

  saveState() {
    localStorage.setItem(this.localStorageKey, JSON.stringify(this._state));
  }

  resetState() {
    localStorage.removeItem(this.localStorageKey);

    this._state = {
      currentLevel: undefined,
      player: {
        deaths: 0,
      },
      oldBobr: {
        isIntroSaid: false,
      },
    };

    this.saveState();
  }
}
