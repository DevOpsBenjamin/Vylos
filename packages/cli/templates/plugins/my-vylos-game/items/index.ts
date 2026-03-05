import type { InventoryData } from '@vylos/core';

export { CATEGORIES } from './categories';
export { ITEMS, OLD_KEY, BREAD, APPLE } from './items';

/** Create starting inventory. Players begin with one apple. */
export function createInventory(): InventoryData {
    return {
        food: {
            apple: 1,
        },
    };
}