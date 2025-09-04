import {Comp, CompList, Vec2} from 'kaplay';
import {PlayerComp, PlayerEntity} from '../entities/player';
import {KCtx} from '../kaplay';
import {gsm} from '../main';

interface Config {
  preloadResources: (k: KCtx) => Promise<void>;
  tileWidth: number;
  tileHeight: number;
  tiles: Record<
    string,
    (
      tilePos: Vec2,
      worldPos: Vec2,
      getSiblings: () => SiblingTiles,
      charAt: (x: number, y: number) => string,
    ) => CompList<Comp> | void
  >;
}

/**
 * Wrapper around k.addLevel to properly setup level with player and custom tiles
 * @param k
 * @param map
 * @param config
 */
export async function addLevel(k: KCtx, map: string, config: Config): Promise<AddLevelResult> {
  let playerSpawnPos: Vec2;
  let parsedMap = map.split('\n');

  // Preload resources
  await PlayerEntity.loadResources(k);
  await config.preloadResources(k);

  k.setGravity(0);
  const level = k.addLevel(parsedMap, {
    pos: k.vec2(0, 0),
    tileWidth: config.tileWidth,
    tileHeight: config.tileHeight,
    tiles: {},
    wildcardTile: (char: string, pos: Vec2) => {
      if (!char.trim()) {
        // Empty space, ignore
        return undefined;
      }

      if (char === 'P') {
        playerSpawnPos = pos.scale(k.vec2(config.tileWidth, config.tileHeight));
        return undefined;
      }

      if (config.tiles[char]) {
        return (
          config.tiles[char](
            pos,
            pos.scale(k.vec2(config.tileWidth, config.tileHeight)),
            () => getSiblingsAt(pos.x, pos.y),
            charAt,
          ) || undefined
        );
      }
    },
  });

  // Create player at the remembered entry point
  const player = PlayerEntity.spawn(k, playerSpawnPos);

  k.setGravity(1000);

  /**
   * Returns the character at the given map coordinates, or ' ' if out of bounds
   * @param x
   * @param y
   */
  function charAt(x: number, y: number): string {
    if (y < 0 || y >= parsedMap.length) return ' ';
    if (x < 0 || x >= parsedMap[y].length) return ' ';
    return parsedMap[y][x];
  }

  /**
   * Returns the characters of the 8 neighboring tiles around the given map coordinates
   * @param x
   * @param y
   */
  function getSiblingsAt(x: number, y: number): SiblingTiles {
    return {
      top: charAt(x, y - 1),
      bottom: charAt(x, y + 1),
      left: charAt(x - 1, y),
      right: charAt(x + 1, y),
      topLeft: charAt(x - 1, y - 1),
      topRight: charAt(x + 1, y - 1),
      bottomLeft: charAt(x - 1, y + 1),
      bottomRight: charAt(x + 1, y + 1),
    };
  }

  return {
    level,
    player,
  };
}

interface AddLevelResult {
  level: ReturnType<KCtx['addLevel']>;
  player: PlayerComp | undefined;
}

interface SiblingTiles {
  top: string;
  bottom: string;
  left: string;
  right: string;
  topLeft: string;
  topRight: string;
  bottomLeft: string;
  bottomRight: string;
}
