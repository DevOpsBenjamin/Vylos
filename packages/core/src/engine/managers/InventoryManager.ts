import type { VylosCategory, VylosItem, InventoryData } from '../types';

/**
 * Manages item/category definitions and inventory operations.
 *
 * No constructor args — compatible with tsyringe `{ useClass }` DI resolution.
 * Projects can extend this class and override any method via the plugin system.
 */
export class InventoryManager {
  private categories = new Map<string, VylosCategory>();
  private items = new Map<string, VylosItem>();

  // --- Category registry ---

  registerCategory(cat: VylosCategory): void {
    this.categories.set(cat.id, cat);
  }

  registerCategories(cats: VylosCategory[]): void {
    for (const cat of cats) {
      this.registerCategory(cat);
    }
  }

  getCategory(id: string): VylosCategory | undefined {
    return this.categories.get(id);
  }

  /** Returns all categories sorted by sortOrder (ascending, undefined last) */
  getCategories(): VylosCategory[] {
    return [...this.categories.values()].sort((a, b) => {
      const sa = a.sortOrder ?? Infinity;
      const sb = b.sortOrder ?? Infinity;
      return sa - sb;
    });
  }

  // --- Item registry ---

  registerItem(item: VylosItem): void {
    this.items.set(item.id, item);
  }

  registerItems(items: VylosItem[]): void {
    for (const item of items) {
      this.registerItem(item);
    }
  }

  getItem(id: string): VylosItem | undefined {
    return this.items.get(id);
  }

  getItemsByCategory(categoryId: string): VylosItem[] {
    return [...this.items.values()].filter((i) => i.category === categoryId);
  }

  // --- Inventory operations (on state.inventories) ---

  /**
   * Add items to a bag. Auto-creates bag if missing.
   * Respects maxStack from the item definition.
   * @returns actual quantity added
   */
  add(inv: InventoryData, bag: string, itemId: string, qty = 1): number {
    if (qty <= 0) return 0;

    if (!inv[bag]) inv[bag] = {};

    const current = inv[bag][itemId] ?? 0;
    const item = this.items.get(itemId);
    const maxStack = item?.maxStack ?? Infinity;

    // Check maxSlots: if the item isn't already in the bag and we'd exceed slot count
    if (current === 0 && item) {
      const category = this.categories.get(item.category);
      if (category?.maxSlots !== undefined) {
        const slotCount = Object.keys(inv[bag]).length;
        if (slotCount >= category.maxSlots) return 0;
      }
    }

    const actual = Math.min(qty, maxStack - current);
    if (actual <= 0) return 0;

    inv[bag][itemId] = current + actual;
    return actual;
  }

  /**
   * Remove items from a bag. Cleans up zero entries.
   * @returns actual quantity removed
   */
  remove(inv: InventoryData, bag: string, itemId: string, qty = 1): number {
    if (qty <= 0) return 0;
    if (!inv[bag]) return 0;

    const current = inv[bag][itemId] ?? 0;
    if (current <= 0) return 0;

    const actual = Math.min(qty, current);
    const remaining = current - actual;

    if (remaining <= 0) {
      delete inv[bag][itemId];
    } else {
      inv[bag][itemId] = remaining;
    }

    return actual;
  }

  /** Get the quantity of an item in a bag */
  count(inv: InventoryData, bag: string, itemId: string): number {
    return inv[bag]?.[itemId] ?? 0;
  }

  /** Check if a bag has at least `qty` of an item */
  has(inv: InventoryData, bag: string, itemId: string, qty = 1): boolean {
    return this.count(inv, bag, itemId) >= qty;
  }

  /** Check if a bag has all the specified items in required quantities */
  hasAll(inv: InventoryData, bag: string, items: Record<string, number>): boolean {
    for (const [itemId, qty] of Object.entries(items)) {
      if (!this.has(inv, bag, itemId, qty)) return false;
    }
    return true;
  }

  /** List all items in a bag as [itemId, quantity] pairs */
  list(inv: InventoryData, bag: string): Array<[string, number]> {
    if (!inv[bag]) return [];
    return Object.entries(inv[bag]);
  }

  /** Clear all items from a bag */
  clearBag(inv: InventoryData, bag: string): void {
    delete inv[bag];
  }

  // --- Cleanup ---

  /** Clear all registered categories and items */
  clear(): void {
    this.categories.clear();
    this.items.clear();
  }
}
