import fs from 'node:fs';
import path from 'node:path';

jest.mock('@angular/core', () => ({
  Injectable: () => (target: unknown) => target,
}));

import { SloganService } from '../src/app/services/slogans.service';

const CATALOG: Record<string, { Slogan?: string; text?: string }[]> = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, '../src/assets/data/slogans.json'), 'utf-8')
);

function stubFetch(catalog: unknown): void {
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => catalog,
  }) as unknown as typeof fetch;
}

describe('SloganService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('exposes a 0.7 module bias', () => {
    const service = new SloganService();
    expect(service.moduleBias).toBe(0.7);
  });

  it('returns null when there is no catalog', async () => {
    stubFetch({});
    const service = new SloganService();
    expect(await service.slogan('decoration')).toBeNull();
    expect(await service.slogan()).toBeNull();
  });

  it('picks a slogan from any module for global pages', async () => {
    stubFetch(CATALOG);
    const service = new SloganService();
    const all = Object.values(CATALOG)
      .flat()
      .map((e) => e.Slogan || e.text)
      .filter(Boolean);
    for (let i = 0; i < 20; i++) {
      const slogan = await service.slogan();
      expect(slogan).not.toBeNull();
      expect(all).toContain(slogan);
    }
  });

  it('is module-biased: when Math.random is under the bias it picks the module pool', async () => {
    stubFetch(CATALOG);
    const modulePool = (CATALOG.decoration ?? []).map((e) => e.Slogan || e.text);
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const service = new SloganService();
    const slogan = await service.slogan('decoration');
    expect(modulePool).toContain(slogan);
  });

  it('falls back to the random pool when Math.random exceeds the bias', async () => {
    stubFetch(CATALOG);
    jest.spyOn(Math, 'random').mockReturnValue(0.999);
    const service = new SloganService();
    const slogan = await service.slogan('decoration');
    const all = Object.values(CATALOG)
      .flat()
      .map((e) => e.Slogan || e.text)
      .filter(Boolean);
    expect(all).toContain(slogan);
  });

  it('falls back to a random module when the requested module has no slogans', async () => {
    stubFetch({ decoration: [], utils: CATALOG.utils });
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const service = new SloganService();
    const slogan = await service.slogan('decoration');
    expect(slogan).not.toBeNull();
    expect((CATALOG.utils ?? []).map((e) => e.Slogan || e.text)).toContain(slogan);
  });

  it('normalizes entries exposing the text property instead of Slogan', async () => {
    stubFetch({ a: [{ text: 'fallback text field' }], b: [{ Slogan: 'canonical' }] });
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const service = new SloganService();
    expect(await service.slogan('a')).toBe('fallback text field');
    expect(await service.slogan('b')).toBe('canonical');
  });
});
