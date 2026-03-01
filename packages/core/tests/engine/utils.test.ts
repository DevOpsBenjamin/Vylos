import { describe, it, expect } from 'vitest';
import { resolveBackground, formatGameTime, interpolate } from '../../src/engine/utils/TimeHelper';
import { deepMerge } from '../../src/engine/utils/deepMerge';

describe('resolveBackground', () => {
  const backgrounds = [
    { path: '/day.jpg', timeRange: [6, 18] as [number, number] },
    { path: '/night.jpg', timeRange: [18, 6] as [number, number] },
    { path: '/default.jpg' },
  ];

  it('returns daytime background during day', () => {
    expect(resolveBackground(backgrounds, 12)).toBe('/day.jpg');
  });

  it('returns night background at night', () => {
    expect(resolveBackground(backgrounds, 22)).toBe('/night.jpg');
  });

  it('returns night background at midnight', () => {
    expect(resolveBackground(backgrounds, 0)).toBe('/night.jpg');
  });

  it('returns default when no time match', () => {
    const bgs = [{ path: '/default.jpg' }];
    expect(resolveBackground(bgs, 12)).toBe('/default.jpg');
  });

  it('returns null for empty array', () => {
    expect(resolveBackground([], 12)).toBeNull();
  });

  it('wraps time past 24 hours', () => {
    expect(resolveBackground(backgrounds, 36)).toBe('/day.jpg');  // 36 % 24 = 12
  });
});

describe('formatGameTime', () => {
  it('formats morning time', () => {
    expect(formatGameTime(8)).toBe('08:00');
  });

  it('formats afternoon time with minutes', () => {
    expect(formatGameTime(14.5)).toBe('14:30');
  });

  it('formats midnight', () => {
    expect(formatGameTime(0)).toBe('00:00');
  });

  it('wraps past 24', () => {
    expect(formatGameTime(25.5)).toBe('01:30');
  });
});

describe('interpolate', () => {
  it('replaces single variable', () => {
    expect(interpolate('Hello {name}!', { name: 'Alice' })).toBe('Hello Alice!');
  });

  it('replaces multiple variables', () => {
    expect(interpolate('{a} and {b}', { a: 'X', b: 'Y' })).toBe('X and Y');
  });

  it('leaves unknown variables untouched', () => {
    expect(interpolate('Hello {name}!', {})).toBe('Hello {name}!');
  });

  it('handles numeric values', () => {
    expect(interpolate('Count: {n}', { n: 42 })).toBe('Count: 42');
  });

  it('handles text without variables', () => {
    expect(interpolate('No vars here', { name: 'Alice' })).toBe('No vars here');
  });
});

describe('deepMerge', () => {
  it('preserves target defaults when source is empty', () => {
    const target = { flags: {}, counters: {}, locationId: 'home' };
    const result = deepMerge(target, {});
    expect(result).toEqual({ flags: {}, counters: {}, locationId: 'home' });
  });

  it('produces fresh empty object for empty flags in source', () => {
    const target = { flags: { old: true } };
    const source = { flags: {} };
    const result = deepMerge(target, source);
    expect(result.flags).toEqual({ old: true });
  });

  it('merges source flags onto target flags', () => {
    const target = { flags: {} as Record<string, boolean> };
    const source = { flags: { done: true } };
    const result = deepMerge(target, source);
    expect(result.flags).toEqual({ done: true });
  });

  it('output objects are fresh copies', () => {
    const target = { flags: { a: 1 } };
    const source = { flags: { b: 2 } };
    const result = deepMerge(target, source);
    expect(result.flags).not.toBe(target.flags);
    expect(result.flags).not.toBe(source.flags);
  });

  it('deep-clones source object at key missing from target', () => {
    const nested = { x: { y: 1 } };
    const target = {} as Record<string, any>;
    const source = { data: nested.x };
    const result = deepMerge(target, source);
    expect(result.data).toEqual({ y: 1 });
    expect(result.data).not.toBe(nested.x);
  });
});
