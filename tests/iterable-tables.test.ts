import fs from 'node:fs';
import path from 'node:path';
import { RamAdapter } from '@decaf-ts/core/ram';
import { Repository } from '@decaf-ts/core';
import { SiteService } from '../src/app/services/site.service';
import { Brand } from '../src/app/models/Brand';
import { HomeCard } from '../src/app/models/HomeCard';
import { Faq } from '../src/app/models/Faq';
import { Tutorial } from '../src/app/models/Tutorial';
import { Example } from '../src/app/models/Example';
import { ModuleFeature } from '../src/app/models/ModuleFeature';
import { resolveMarqueeIcon } from '../src/app/seed/marquee-icons';

function readAsset(name: string): unknown {
  return JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../src/assets/data', name), 'utf-8')
  );
}

/**
 * Stubs `global.fetch` by asset url. Any url not listed resolves to a 404, which the
 * service treats as an absent asset (falling back to the locale seed where applicable).
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

const MODULES_JSON = readAsset('modules.json');
const MARQUEE_JSON = readAsset('marquee.json') as {
  brands: { id: string; name: string; icon: string }[];
};

describe('iterable table seeding reads', () => {
  const user = 'iterable-tables-test';
  let service: SiteService;

  beforeAll(() => {
    new RamAdapter({ user });
    service = new SiteService();
  });

  beforeEach(() => {
    // Default: only the modules asset is present, so the marquee-driven tables fall
    // back to the locale seed. Tests that need the authored marquee override this.
    stubFetch({ 'assets/data/modules.json': MODULES_JSON });
  });

  it('reads seeded Brand rows from the marquee asset with resolved icons in order', async () => {
    stubFetch({
      'assets/data/modules.json': MODULES_JSON,
      'assets/data/marquee.json': MARQUEE_JSON,
    });
    await service.seed('en_us');

    const expected = MARQUEE_JSON.brands;
    expect(expected).toHaveLength(14);
    const ids = expected.map((b) => `en_us_${b.id}`);
    const brands = await Repository.forModel(Brand).readAll(ids);
    expect(brands).toHaveLength(14);
    expect(brands.every((b) => b instanceof Brand)).toBe(true);

    const ordered = brands.slice().sort((a, b) => a.order - b.order);
    expect(ordered.map((b) => b.id)).toEqual(ids);
    expect(ordered.map((b) => b.order)).toEqual(expected.map((_, i) => i));
    for (const [i, brand] of ordered.entries()) {
      expect(brand.name).toBe(expected[i].name);
      expect(brand.icon).toBe(resolveMarqueeIcon(expected[i].icon));
      expect(brand.icon).toContain('<svg');
    }

    const decafTs = ordered.find((b) => b.id === 'en_us_decaf-ts')!;
    expect(decafTs.name).toBe('decaf-ts');
    expect(decafTs.icon).toBe(resolveMarqueeIcon('coffee'));
  });

  it('reads seeded HomeCard rows back through Repository.forModel', async () => {
    await service.seed('en_us');
    const card = await Repository.forModel(HomeCard).read('en_us_seamless_styling');
    expect(card).toBeInstanceOf(HomeCard);
    expect(card!.title).toBe('Seamless Styling');
  });

  it('reads seeded Faq rows back through Repository.forModel', async () => {
    await service.seed('en_us');
    const faq = await Repository.forModel(Faq).read('en_us_what_is_vanilla_cms_');
    expect(faq).toBeInstanceOf(Faq);
    expect(faq!.title).toBe('What is Vanilla CMS?');
  });

  it('reads seeded Tutorial rows back through Repository.forModel', async () => {
    await service.seed('en_us');
    const tutorial = await Repository.forModel(Tutorial).read('tutorial_decoration_0');
    expect(tutorial).toBeInstanceOf(Tutorial);
    expect(tutorial!.module).toBe('decoration');
  });

  it('reads seeded Example rows back through Repository.forModel', async () => {
    await service.seed('en_us');
    const example = await Repository.forModel(Example).read('example_decoration_use_decorators');
    expect(example).toBeInstanceOf(Example);
    expect(example!.module).toBe('decoration');
    expect(example!.lang).not.toBe('');
  });

  it('reads seeded ModuleFeature rows back through Repository.forModel', async () => {
    await service.seed('en_us');
    const feature = await Repository.forModel(ModuleFeature).read(
      'feature_decoration_flavour_aware_decorators'
    );
    expect(feature).toBeInstanceOf(ModuleFeature);
    expect(feature!.module).toBe('decoration');
    expect(feature!.description).not.toBe('');
  });

  it('seeds iterable rows under locale-scoped id namespaces', async () => {
    const { SITE_SEED } = await import('../src/app/seed/i18n-data');
    const ptTitle = SITE_SEED.pt_br.cards![0].title;
    const ptId = `pt_br_${ptTitle.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
    await service.seed('pt_br');
    const ptCard = await Repository.forModel(HomeCard).read(ptId);
    expect(ptCard).toBeInstanceOf(HomeCard);
    expect(ptCard!.title).not.toBe('Seamless Styling');
    expect(ptId.startsWith('pt_br_')).toBe(true);
  });
});
