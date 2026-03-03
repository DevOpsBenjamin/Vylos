import type { VylosCategory, VylosItem } from '@vylos/core';

export const CATEGORIES: VylosCategory[] = [
  { id: 'gifts', name: 'Gifts', sortOrder: 1 },
  { id: 'consumables', name: 'Consumables', sortOrder: 2 },
];

export const ITEMS: VylosItem[] = [
  { id: 'coffee', name: 'Coffee', category: 'consumables' },
  { id: 'poem', name: 'Poem', category: 'gifts' },
  { id: 'flowers', name: 'Flowers', category: 'gifts' },
  { id: 'letter', name: "Lena's Letter", category: 'gifts' },
];
