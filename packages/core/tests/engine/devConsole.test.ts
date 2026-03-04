import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { printBanner } from '../../src/engine/utils/devConsole';
import type { VylosConfig } from '../../src/engine/types/config';

const baseConfig: VylosConfig = {
  name: 'Test Game',
  id: 'test-game',
  version: '1.2.3',
  languages: ['en'],
  defaultLanguage: 'en',
  defaultLocation: 'home',
  resolution: { width: 1920, height: 1080 },
};

describe('printBanner', () => {
  let spy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    spy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    spy.mockRestore();
  });

  it('prints styled title with config.name', () => {
    printBanner(baseConfig);
    const [formatStr, titleStyle, versionStyle] = spy.mock.calls[0];
    expect(formatStr).toContain('Test Game');
    expect(formatStr).toContain('%c');
    expect(titleStyle).toContain('#7c3aed');
    expect(versionStyle).toContain('gray');
  });

  it('prints version in subtitle', () => {
    printBanner(baseConfig);
    expect(spy.mock.calls[0][0]).toContain('1.2.3');
  });

  it('prints cheat guide with Vylos prefix', () => {
    printBanner(baseConfig);
    expect(spy.mock.calls[1][0]).toContain('Vylos.state');
  });
});
