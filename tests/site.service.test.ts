import fs from 'node:fs';
import path from 'node:path';
import { RamAdapter } from '@decaf-ts/core/ram';
import { Repository } from '@decaf-ts/core';
import { SiteService } from '../src/app/services/site.service';
import { WebApp } from '../src/app/structure/WebApp';
import { Section } from '../src/app/structure/Section';
import { SiteItem } from '../src/app/models/SiteItem';
import { ShowcaseHighlight } from '../src/app/models/ShowcaseHighlight';
import { DecafApp } from '../src/app/models/DecafApp';
import { CodeExample } from '../src/app/models/CodeExample';

const EXPECTED_PAGES = [
  'index',
  'modules',
  'features',
  'tutorials',
  'examples',
  'documentation',
  'showcase',
  'apps',
  'news',
  'community',
];

const SHOWCASE_IDS = [
  'extensible-decoration',
  'model-centric',
  'backend-route-generation',
  'cross-persistence',
  'cross-ui',
  'graph-workflow-engine',
  'task-engine',
  'authorization',
  'integrations',
  'validation',
  'encryption-at-rest',
  'repository-queries',
];

const APP_IDS = ['flipbored', 'web-page'];

function readAsset(name: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../src/assets/data', name), 'utf-8')
  );
}

/**
 * Stubs `global.fetch` by asset url so `SiteService.seed()` reads the real
 * bundled content pipeline assets instead of a single canned payload. Any url not in
 * `assets` resolves to a 404, which the service treats as an absent asset.
 */
function stubFetch(assets: Record<string, unknown>): void {
  global.fetch = jest.fn(async (input: unknown) => {
    const url = String(input);
    if (Object.prototype.hasOwnProperty.call(assets, url)) {
      return { ok: true, json: async () => assets[url] };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  }) as unknown as typeof fetch;
}

function realAssets(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    'assets/data/modules.json': readAsset('modules.json'),
    'assets/data/modules.auto.json': readAsset('modules.auto.json'),
    'assets/data/module-versions.json': readAsset('module-versions.json'),
    'assets/data/showcase.json': readAsset('showcase.json'),
    'assets/data/apps.json': readAsset('apps.json'),
    ...overrides,
  };
}

describe('site.service', () => {
  const user = 'site-service-test';
  let service: SiteService;

  beforeAll(() => {
    new RamAdapter({ user });
    service = new SiteService();
  });

  it('returns empty content tables before any seed', async () => {
    expect(await service.getModules()).toEqual([]);
    expect(await service.getShowcase()).toEqual([]);
    expect(await service.getApps()).toEqual([]);
    expect(await service.getHighlight('extensible-decoration')).toBeUndefined();
  });

  it('builds and seeds a locale site and reads it back as models', async () => {
    stubFetch(realAssets());
    await service.seed('en_us');

    const site = await service.getSite('en_us');
    expect(site).toBeInstanceOf(WebApp);
    expect(site!.pages).toHaveLength(10);
    expect(site!.pages.map((p) => p.id)).toEqual(EXPECTED_PAGES);
    expect(site!.nav[0]).toBeInstanceOf(Section);
    expect(site!.nav[0].items).toHaveLength(7);

    const index = await service.getPage('en_us', 'index');
    expect(index).toBeDefined();
    expect(index!.sections).toHaveLength(6);
    expect(index!.sections.map((s) => s.kind)).toEqual([
      'logo-cloud',
      'features',
      'cta',
      'showcase-highlights',
      'decaf-apps',
      'faq',
    ]);
    expect(index!.sections[1]).toBeInstanceOf(Section);
    expect(index!.header[0].items[0]).toBeInstanceOf(SiteItem);
    expect(index!.footer[0].kind).toBe('footer');
  });

  it('seeds per locale without cross-pollution', async () => {
    stubFetch(realAssets());
    await service.seed('pt_br');
    await service.seed('en_us');

    const pt = await service.getPage('pt_br', 'index');
    const en = await service.getPage('en_us', 'index');
    expect(pt).toBeDefined();
    expect(en).toBeDefined();
    expect(pt!.id).toBe('index');
    expect(en!.id).toBe('index');
    expect(pt!.sections[0].id).toContain('pt_br');
    expect(en!.sections[0].id).toContain('en_us');
  });

  it('seeds the real showcase highlights and reads them back in order', async () => {
    stubFetch(realAssets());
    await service.seed('en_us');

    const highlights = await service.getShowcase();
    expect(highlights).toHaveLength(12);
    expect(highlights[0]).toBeInstanceOf(ShowcaseHighlight);
    expect(highlights.map((h) => h.id)).toEqual(SHOWCASE_IDS);
    expect(highlights.map((h) => h.order)).toEqual(
      Array.from({ length: 12 }, (_, i) => i + 1)
    );
    const extensible = highlights[0];
    expect(extensible.title).toBe('Extensible Decoration');
    expect(extensible.tagline).not.toBe('');
    expect(extensible.detail).not.toBe('');
    expect(extensible.modules).toContain('decoration');
  });

  it('round-trips a single highlight with its CodeExample child records', async () => {
    stubFetch(realAssets());
    await service.seed('en_us');

    const highlight = await service.getHighlight('extensible-decoration');
    expect(highlight).toBeInstanceOf(ShowcaseHighlight);
    expect(highlight!.id).toBe('extensible-decoration');
    expect(highlight!.codeExamples).toHaveLength(2);
    expect(highlight!.codeExamples[0]).toBeInstanceOf(CodeExample);
    expect(highlight!.codeExamples.map((c) => c.id)).toEqual([
      'extensible-decoration_0',
      'extensible-decoration_1',
    ]);
    expect(highlight!.codeExamples[0].code).not.toBe('');
    expect(highlight!.codeExamples[0].lang).not.toBe('');

    // the same child records round-trip through the raw repository
    const fromRepo = await Repository.forModel(ShowcaseHighlight).read('extensible-decoration');
    expect(fromRepo).toBeInstanceOf(ShowcaseHighlight);
    expect(fromRepo!.codeExamples).toHaveLength(2);
    expect(fromRepo!.codeExamples[0]).toBeInstanceOf(CodeExample);
    expect(fromRepo!.codeExamples[0].id).toBe('extensible-decoration_0');
  });

  it('seeds the real decaf apps and reads them back in order', async () => {
    stubFetch(realAssets());
    await service.seed('en_us');

    const apps = await service.getApps();
    expect(apps).toHaveLength(2);
    expect(apps[0]).toBeInstanceOf(DecafApp);
    expect(apps.map((a) => a.id)).toEqual(APP_IDS);
    const appsAsset = readAsset('apps.json') as { order: number }[];
    expect(apps.map((a) => a.order)).toEqual(appsAsset.map((a) => a.order));

    const flipbored = await Repository.forModel(DecafApp).read('flipbored');
    expect(flipbored).toBeInstanceOf(DecafApp);
    expect(flipbored!.name).toBe('flipbored');
    expect(flipbored!.site).toContain('http');
    expect(flipbored!.modules).toContain('for-angular');
  });

  it('derives showcase highlights from modules when the showcase asset is absent', async () => {
    stubFetch(realAssets({ 'assets/data/showcase.json': [] }));
    await service.seed('en_us');

    const modules = readAsset('modules.json') as { name: string }[];
    const highlights = await service.getShowcase();
    expect(highlights).toHaveLength(modules.length);
    expect(highlights.map((h) => h.id)).toContain('decoration');

    const derived = highlights.find((h) => h.id === 'decoration')!;
    expect(derived).toBeInstanceOf(ShowcaseHighlight);
    expect(derived.demoKind).toBe('modules');
    expect(derived.codeExamples.length).toBeGreaterThan(0);
  });

  it('leaves the apps table empty when the apps asset is absent', async () => {
    stubFetch(realAssets({ 'assets/data/apps.json': [] }));
    await service.seed('en_us');
    expect(await service.getApps()).toEqual([]);
  });
});
