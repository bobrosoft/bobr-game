import {Vec2} from 'kaplay';
import {MapItemEntity, MapItemGameObj} from '../entities/map-item';
import {KCtx} from '../kaplay';
import {gsm} from '../main';

/**
 * Helper to add a furniture item to the map
 * @param k
 * @param options
 */
export function addFurnitureItem(k: KCtx, options: {itemId: string; sprite: string; worldPos: Vec2}): MapItemGameObj {
  if (gsm.getIsPlayerHasItem(options.itemId)) {
    return;
  }

  return MapItemEntity.spawn(k, options.worldPos, {
    sprite: options.sprite,
    levitate: true,
    interact: async player => {
      gsm.addToTempInventory(options.itemId);
    },
    shouldPickupOnInteract: true,
  });
}
