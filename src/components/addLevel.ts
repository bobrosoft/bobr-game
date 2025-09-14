import {Comp, CompList, Vec2} from 'kaplay';
import {ExitConfig, ExitEntity} from '../entities/exit';
import {PlayerComp, PlayerEntity} from '../entities/player';
import {k, KCtx} from '../kaplay';
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
  exitPoints: ExitConfig[];
}

/**
 * Wrapper around k.addLevel to properly setup level with player and custom tiles
 * @param k
 * @param map
 * @param config
 */
export async function addLevel(k: KCtx, map: string, config: Config): Promise<AddLevelResult> {
  const exitPointsPositions: {worldPos: Vec2}[] = [];
  let playerSpawnPos: Vec2 | undefined;
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

      // Remember player default spawn point
      if (char === 'P') {
        playerSpawnPos = pos.scale(k.vec2(config.tileWidth, config.tileHeight));
        return undefined;
      }

      // Remember all exit points
      if (char === 'E') {
        exitPointsPositions.push({worldPos: pos.scale(k.vec2(config.tileWidth, config.tileHeight))});
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

  // Sort exit points by their position (left to right)
  exitPointsPositions.sort((a, b) => {
    if (a.worldPos.x === b.worldPos.x) {
      return a.worldPos.y - b.worldPos.y;
    }
    return a.worldPos.x - b.worldPos.x;
  });

  // Create exit entities at the remembered exit points
  exitPointsPositions.forEach((exitPointPos, index) => {
    ExitEntity.spawn(k, exitPointPos.worldPos, config.exitPoints[index]);
  });

  // If we have a remembered exit to spawn at, use it
  if (gsm.state.persistent.spawnAtExitIndex !== undefined) {
    const exitIndex = gsm.state.persistent.spawnAtExitIndex;

    if (!exitPointsPositions[exitIndex]) {
      k.debug.error('Invalid exit index to spawn at:' + exitIndex);
      return;
    }

    playerSpawnPos = exitPointsPositions[exitIndex].worldPos.add(
      config.exitPoints[exitIndex].spawnOffsetTiles.scale(k.vec2(config.tileWidth, config.tileHeight)),
    );
  } else {
    gsm.update({
      persistent: {
        spawnAtExitIndex: undefined,
      },
    });
  }

  // Ensure we have a spawn point
  if (!playerSpawnPos) {
    k.debug.error('No player spawn point found on the map!');
    return;
  }

  // Create player at required position
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
