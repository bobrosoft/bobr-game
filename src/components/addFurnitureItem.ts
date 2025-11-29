import {Vec2} from 'kaplay';
import {ITEM_ID} from '../entities/generic/item-id';
import {MapItemEntity, MapItemGameObj} from '../entities/map-item';
import {KCtx} from '../kaplay';
import {gsm} from '../main';

/**
 * Helper to add a furniture item to the map
 * @param k
 * @param config
 */
export function addFurnitureItem(
  k: KCtx,
  config: {
    itemId: ITEM_ID;
    sprite: string;
    worldPos: Vec2;
    preInteractAction?: () => Promise<boolean>; // you can return false to prevent interaction
    postInteractAction?: () => Promise<void>;
  },
): MapItemGameObj {
  if (gsm.getIsPlayerHasItem(config.itemId)) {
    return;
  }

  return MapItemEntity.spawn(k, config.worldPos, {
    sprite: config.sprite,
    levitate: true,
    interact: async player => {
      gsm.addToTempInventory(config.itemId);
    },
    shouldPickupOnInteract: true,
    preInteractAction: config.preInteractAction,
    postInteractAction: config.postInteractAction,
  });
}
