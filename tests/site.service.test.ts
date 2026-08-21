import { RamAdapter } from '@decaf-ts/core/ram';
import { SiteService } from '../src/app/services/site.service';
import { WebApp } from '../src/app/structure/WebApp';
import { Section } from '../src/app/structure/Section';
import { SiteItem } from '../src/app/models/SiteItem';

describe('site.service', () => {
  const user = 'site-service-test';
  let service: SiteService;

  beforeAll(() => {
    new RamAdapter({ user });
    service = new SiteService();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [] as unknown[],
    }) as unknown as typeof fetch;
  });

  it('builds and seeds a locale site and reads it back as models', async () => {
    await service.seed('en_us');

    const site = await service.getSite('en_us');
    expect(site).toBeInstanceOf(WebApp);
    expect(site!.pages).toHaveLength(6);
    expect(site!.nav[0]).toBeInstanceOf(Section);

    const index = await service.getPage('en_us', 'index');
    expect(index).toBeDefined();
    expect(index!.sections).toHaveLength(7);
    expect(index!.sections[1]).toBeInstanceOf(Section);
    expect(index!.header[0].items[0]).toBeInstanceOf(SiteItem);
    expect(index!.footer[0].kind).toBe('footer');
  });

  it('seeds per locale without cross-pollution', async () => {
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

  it('returns empty module list when no modules were seeded', async () => {
    const modules = await service.getModules();
    expect(modules).toEqual([]);
  });
});
