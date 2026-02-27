import type { TextEntry } from './events';

/** Category definition for organizing inventory items */
export interface VylosCategory {
  id: string;
  name: string | TextEntry;
  icon?: string;
  sortOrder?: number;
  /** Max distinct item types in this category (default: unlimited) */
  maxSlots?: number;
}

/** Item definition with metadata */
export interface VylosItem {
  id: string;
  name: string | TextEntry;
  /** Category ID this item belongs to */
  category: string;
  /** Max stack size per slot (default: Infinity) */
  maxStack?: number;
  description?: string | TextEntry;
  icon?: string;
}

/** Inventory data: bag/category ID -> item ID -> quantity */
export type InventoryData = Record<string, Record<string, number>>;
