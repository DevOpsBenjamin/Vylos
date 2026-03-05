import type { InventoryData } from '@vylos/core';

export { CATEGORIES } from './categories';
export { ITEMS } from './items';

/** Create starting inventory — empty for the advanced demo. */
export function createInventory(): InventoryData {
  return {};
}
