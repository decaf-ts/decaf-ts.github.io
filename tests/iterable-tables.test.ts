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

describe('iterable table seeding reads', () => {
  const user = 'iterable-tables-test';
  let service: SiteService;

  beforeAll(() => {
    new RamAdapter({ user });
    service = new SiteService();
    const modulesJson = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, '../src/assets/data/modules.json'), 'utf-8')
    );
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => modulesJson,
    }) as unknown as typeof fetch;
  });

  it('reads seeded Brand rows back through Repository.forModel', async () => {
    await service.seed('en_us');
    const brand = await Repository.forModel(Brand).read('en_us_Transistor');
    expect(brand).toBeInstanceOf(Brand);
    expect(brand!.name).toBe('Transistor');
    expect(brand!.src).toContain('http');
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
      'feature_decoration_composable_decorators'
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
