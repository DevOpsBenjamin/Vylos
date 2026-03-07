import type { VylosItem } from '@vylos/core';

/**
 * You can extend VylosItem with custom fields (e.g. price for a shop system).
 * In a real game, pick one approach and stick with it — both are shown here for demonstration.
 */
export interface Item extends VylosItem {
    price: number;
}

export const OLD_KEY: Item = { id: 'old_key', name: 'Old Key', category: 'misc', price: 10 };

// You can also use VylosItem directly if you don't need extra fields.
export const BREAD: VylosItem = { id: 'bread', name: 'Bread', category: 'food' };
export const APPLE: VylosItem = { id: 'apple', name: 'Apple', category: 'food' };

export const ITEMS: VylosItem[] = [OLD_KEY, BREAD, APPLE];
