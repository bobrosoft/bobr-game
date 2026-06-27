# Agent Instructions
A guide for AI agents working on this project.

## Project Overview

**Bobr Quest** is a 2D side-scrolling adventure/platformer game built with [Kaplay](https://kaplayjs.com/) 
(a JavaScript/TypeScript game library), Vite, and TypeScript. The game is deployed as a PWA to GitHub Pages.

Live build: https://bobrosoft.github.io/bobr-game/

## Tech Stack

| Layer       | Tool                                       |
|-------------|--------------------------------------------|
| Game engine | [Kaplay](https://kaplayjs.com/) v4 (alpha) |
| Language    | TypeScript                                 |
| Build tool  | Vite                                       |
| i18n        | i18next + i18next-browser-languagedetector |
| Linting     | ESLint + Prettier                          |
| Deployment  | gh-pages                                   |

## Repository Structure

```
src/
  main.ts                  # Entry point — initialises Kaplay, i18n, scenes, global managers
  kaplay.ts                # Kaplay instance / KCtx type export
  components/              # Reusable Kaplay components and managers/services
  entities/                # Game entities (player, enemies, NPCs, items)
  scenes/                  # Scene and level definitions
    maps/                  # Plain-text tile maps (*.txt)
    tiles/                 # Tile factory functions
  i18n/                    # Translation files
  misc/                    # Misc utilities
  sprites-src/             # Source GIF frames (pre-spritesheet generation)
public/
  sprites/                 # Compiled sprites / spritesheets
  music/                   # MP3 music tracks
  sounds/                  # MP3 sound effects
  fonts/                   # Web fonts
  manifest.json            # PWA manifest
script/                    # Different scripts
```

## Architecture Notes

### Global Managers (singletons exported from `main.ts`)
- `gsm` — `GameStateManager`: holds game state, inventory, visited flags, and other cross-scene state.
- `bgMusicManager` — `BgMusicManager`: handles background music transitions between scenes.
- `hudManager` — `HudManager`: renders the HUD overlay (health, items, etc.).
- `fadeManager` — `FadeManager`: manages screen-fade animations for scene transitions.
- `camManager` — `CamManager`: controls camera follow and bounds.

### Scenes
Each scene is an async function `(k: KCtx) => void` registered in `main.ts` via `sceneWrapper`. 
Scene transitions are done through `changeScene()` from `misc/changeScene.ts`.

### Tile Maps
Levels use plain-text ASCII tile maps (`scenes/maps/*.txt`). The `addLevel()` component in `components/addLevel.ts` 
parses a map and calls tile factory functions (from `scenes/tiles/`) for each character.

### Entities
Each entity typically exposes:
- `static loadResources(k: KCtx)` — preloads sprites/sounds (called during level load).
- `static spawn(k: KCtx, pos: Vec2, ...)` — instantiates the entity in the scene.

### i18n
All user-facing strings must go through `i18next` (`t('key')`). Translation files live in `src/i18n/`.

### Spritesheet Generation
Animated sprites are authored as source GIFs in `src/sprites-src/`.
Run `node script/gen-spritesheet.js` to compile them into spritesheets placed under `public/sprites/`.

## Coding Conventions
- **TypeScript strict mode** is enabled — avoid `any` unless there is a documented reason.
- Use **named exports** (no default exports for components/entities).
- When writing comments to functions, don't describe precise implementation since it may change.
- Keep entity logic inside the entity file; scenes only orchestrate spawning.
- New tile types go in `src/scenes/tiles/` as separate files, following existing naming (`tile<Name>.ts`).
- Audio files go in `public/music/` (background tracks) or `public/sounds/` (sound effects).
- Sprites go in `public/sprites/` (compiled) and `src/sprites-src/` (source GIFs).
- Run `npm run check && npm run lint` before committing changes.
- Use `onClick` event if need to add a click event to the object, not `onMousePress`.

## Testing
There is no automated test suite at this time.
Manual testing is done by running the dev server (`npm run dev`) and playing through the game in a browser.

