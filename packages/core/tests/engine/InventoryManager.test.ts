import { describe, it, expect, beforeEach } from 'vitest';
import { InventoryManager } from '../../src/engine/managers/InventoryManager';
import type { VylosCategory, VylosItem, InventoryData } from '../../src/engine/types';

function makeInv(): InventoryData {
  return {};
}

describe('InventoryManager', () => {
  let im: InventoryManager;

  beforeEach(() => {
    im = new InventoryManager();
  });

  // --- Category registry ---

  describe('categories', () => {
    const reagents: VylosCategory = { id: 'reagents', name: 'Reagents', icon: '🧪', sortOrder: 1 };
    const potions: VylosCategory = { id: 'potions', name: 'Potions', icon: '🧫', sortOrder: 2 };
    const misc: VylosCategory = { id: 'misc', name: 'Misc' }; // no sortOrder

    it('registers and retrieves a category', () => {
      im.registerCategory(reagents);
      expect(im.getCategory('reagents')).toEqual(reagents);
    });

    it('returns undefined for unknown category', () => {
      expect(im.getCategory('nope')).toBeUndefined();
    });

    it('registerCategories registers multiple', () => {
      im.registerCategories([reagents, potions, misc]);
      expect(im.getCategories()).toHaveLength(3);
    });

    it('getCategories sorts by sortOrder (undefined last)', () => {
      im.registerCategories([misc, potions, reagents]);
      const sorted = im.getCategories();
      expect(sorted.map((c) => c.id)).toEqual(['reagents', 'potions', 'misc']);
    });
  });

  // --- Item registry ---

  describe('items', () => {
    const moonflower: VylosItem = { id: 'moonflower', name: 'Moonflower', category: 'reagents' };
    const sunpetal: VylosItem = { id: 'sunpetal', name: 'Sun Petal', category: 'reagents' };
    const healPotion: VylosItem = { id: 'heal_potion', name: 'Heal Potion', category: 'potions' };

    it('registers and retrieves an item', () => {
      im.registerItem(moonflower);
      expect(im.getItem('moonflower')).toEqual(moonflower);
    });

    it('returns undefined for unknown item', () => {
      expect(im.getItem('nope')).toBeUndefined();
    });

    it('registerItems registers multiple', () => {
      im.registerItems([moonflower, sunpetal, healPotion]);
      expect(im.getItem('moonflower')).toBeDefined();
      expect(im.getItem('sunpetal')).toBeDefined();
      expect(im.getItem('heal_potion')).toBeDefined();
    });

    it('getItemsByCategory filters correctly', () => {
      im.registerItems([moonflower, sunpetal, healPotion]);
      const reagentItems = im.getItemsByCategory('reagents');
      expect(reagentItems.map((i) => i.id)).toEqual(['moonflower', 'sunpetal']);
    });
  });

  // --- Inventory operations ---

  describe('add', () => {
    it('adds items to a bag, auto-creates bag', () => {
      const inv = makeInv();
      const added = im.add(inv, 'reagents', 'moonflower', 3);
      expect(added).toBe(3);
      expect(inv.reagents.moonflower).toBe(3);
    });

    it('defaults to qty 1', () => {
      const inv = makeInv();
      im.add(inv, 'bag', 'item');
      expect(inv.bag.item).toBe(1);
    });

    it('stacks with existing quantity', () => {
      const inv = makeInv();
      im.add(inv, 'bag', 'item', 5);
      im.add(inv, 'bag', 'item', 3);
      expect(inv.bag.item).toBe(8);
    });

    it('returns 0 for qty <= 0', () => {
      const inv = makeInv();
      expect(im.add(inv, 'bag', 'item', 0)).toBe(0);
      expect(im.add(inv, 'bag', 'item', -1)).toBe(0);
    });

    it('respects maxStack from item definition', () => {
      im.registerItem({ id: 'potion', name: 'Potion', category: 'potions', maxStack: 5 });
      const inv = makeInv();
      im.add(inv, 'potions', 'potion', 3);
      const added = im.add(inv, 'potions', 'potion', 10);
      expect(added).toBe(2); // 5 - 3 = 2 remaining capacity
      expect(inv.potions.potion).toBe(5);
    });

    it('returns 0 when already at maxStack', () => {
      im.registerItem({ id: 'potion', name: 'Potion', category: 'potions', maxStack: 5 });
      const inv = makeInv();
      im.add(inv, 'potions', 'potion', 5);
      expect(im.add(inv, 'potions', 'potion', 1)).toBe(0);
    });

    it('respects maxSlots from category definition', () => {
      im.registerCategory({ id: 'reagents', name: 'Reagents', maxSlots: 2 });
      im.registerItem({ id: 'a', name: 'A', category: 'reagents' });
      im.registerItem({ id: 'b', name: 'B', category: 'reagents' });
      im.registerItem({ id: 'c', name: 'C', category: 'reagents' });

      const inv = makeInv();
      im.add(inv, 'reagents', 'a', 1);
      im.add(inv, 'reagents', 'b', 1);
      // Bag now has 2 slots, adding a 3rd should fail
      const added = im.add(inv, 'reagents', 'c', 1);
      expect(added).toBe(0);
      expect(inv.reagents.c).toBeUndefined();
    });

    it('allows stacking existing item even when at maxSlots', () => {
      im.registerCategory({ id: 'reagents', name: 'Reagents', maxSlots: 2 });
      im.registerItem({ id: 'a', name: 'A', category: 'reagents' });
      im.registerItem({ id: 'b', name: 'B', category: 'reagents' });

      const inv = makeInv();
      im.add(inv, 'reagents', 'a', 1);
      im.add(inv, 'reagents', 'b', 1);
      // Stacking existing item should work even though 2 slots are full
      const added = im.add(inv, 'reagents', 'a', 3);
      expect(added).toBe(3);
      expect(inv.reagents.a).toBe(4);
    });

    it('allows unregistered items (no maxStack enforcement)', () => {
      const inv = makeInv();
      im.add(inv, 'bag', 'unknown_item', 999);
      expect(inv.bag.unknown_item).toBe(999);
    });
  });

  describe('remove', () => {
    it('removes items from a bag', () => {
      const inv: InventoryData = { bag: { item: 5 } };
      const removed = im.remove(inv, 'bag', 'item', 3);
      expect(removed).toBe(3);
      expect(inv.bag.item).toBe(2);
    });

    it('defaults to qty 1', () => {
      const inv: InventoryData = { bag: { item: 5 } };
      im.remove(inv, 'bag', 'item');
      expect(inv.bag.item).toBe(4);
    });

    it('clamps to available quantity', () => {
      const inv: InventoryData = { bag: { item: 2 } };
      const removed = im.remove(inv, 'bag', 'item', 10);
      expect(removed).toBe(2);
      expect(inv.bag.item).toBeUndefined(); // cleaned up
    });

    it('cleans up zero entries', () => {
      const inv: InventoryData = { bag: { item: 3 } };
      im.remove(inv, 'bag', 'item', 3);
      expect(inv.bag.item).toBeUndefined();
      expect('item' in inv.bag).toBe(false);
    });

    it('returns 0 for missing bag', () => {
      const inv = makeInv();
      expect(im.remove(inv, 'bag', 'item', 1)).toBe(0);
    });

    it('returns 0 for missing item', () => {
      const inv: InventoryData = { bag: {} };
      expect(im.remove(inv, 'bag', 'item', 1)).toBe(0);
    });

    it('returns 0 for qty <= 0', () => {
      const inv: InventoryData = { bag: { item: 5 } };
      expect(im.remove(inv, 'bag', 'item', 0)).toBe(0);
      expect(im.remove(inv, 'bag', 'item', -1)).toBe(0);
    });
  });

  describe('count', () => {
    it('returns quantity', () => {
      const inv: InventoryData = { bag: { item: 7 } };
      expect(im.count(inv, 'bag', 'item')).toBe(7);
    });

    it('returns 0 for missing bag', () => {
      expect(im.count(makeInv(), 'bag', 'item')).toBe(0);
    });

    it('returns 0 for missing item', () => {
      const inv: InventoryData = { bag: {} };
      expect(im.count(inv, 'bag', 'item')).toBe(0);
    });
  });

  describe('has', () => {
    it('returns true when sufficient quantity', () => {
      const inv: InventoryData = { bag: { item: 5 } };
      expect(im.has(inv, 'bag', 'item', 5)).toBe(true);
      expect(im.has(inv, 'bag', 'item', 3)).toBe(true);
    });

    it('returns false when insufficient', () => {
      const inv: InventoryData = { bag: { item: 2 } };
      expect(im.has(inv, 'bag', 'item', 3)).toBe(false);
    });

    it('defaults to qty 1', () => {
      const inv: InventoryData = { bag: { item: 1 } };
      expect(im.has(inv, 'bag', 'item')).toBe(true);
    });

    it('returns false for missing bag/item', () => {
      expect(im.has(makeInv(), 'bag', 'item')).toBe(false);
    });
  });

  describe('hasAll', () => {
    it('returns true when all items present', () => {
      const inv: InventoryData = { bag: { a: 3, b: 5, c: 1 } };
      expect(im.hasAll(inv, 'bag', { a: 2, b: 5 })).toBe(true);
    });

    it('returns false when any item is missing', () => {
      const inv: InventoryData = { bag: { a: 3 } };
      expect(im.hasAll(inv, 'bag', { a: 2, b: 1 })).toBe(false);
    });

    it('returns true for empty requirements', () => {
      expect(im.hasAll(makeInv(), 'bag', {})).toBe(true);
    });
  });

  describe('list', () => {
    it('lists all items in a bag', () => {
      const inv: InventoryData = { bag: { a: 1, b: 3 } };
      const items = im.list(inv, 'bag');
      expect(items).toEqual([['a', 1], ['b', 3]]);
    });

    it('returns empty array for missing bag', () => {
      expect(im.list(makeInv(), 'bag')).toEqual([]);
    });
  });

  describe('clearBag', () => {
    it('removes entire bag', () => {
      const inv: InventoryData = { bag: { a: 1, b: 2 } };
      im.clearBag(inv, 'bag');
      expect(inv.bag).toBeUndefined();
    });

    it('no-ops for missing bag', () => {
      const inv = makeInv();
      im.clearBag(inv, 'bag'); // should not throw
    });
  });

  describe('clear', () => {
    it('clears all registered categories and items', () => {
      im.registerCategory({ id: 'cat', name: 'Cat' });
      im.registerItem({ id: 'item', name: 'Item', category: 'cat' });
      im.clear();
      expect(im.getCategory('cat')).toBeUndefined();
      expect(im.getItem('item')).toBeUndefined();
      expect(im.getCategories()).toHaveLength(0);
    });
  });
});
