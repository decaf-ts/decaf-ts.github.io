import { SITE_LOCALES, SITE_SEED, SiteLocale } from '../src/app/seed/i18n-data';
import { buildSite, SeedSiteData } from '../src/app/seed/site.seed';
import { RamAdapter } from '@decaf-ts/core/ram';
import { SiteService } from '../src/app/services/site.service';

describe('locale page-structure', () => {
  describe.each(SITE_LOCALES)('locale %s', (locale) => {
    let site: SeedSiteData;

    beforeAll(() => {
      site = buildSite(locale);
    });

    it('keeps slogans out of seed templates (they live in the SloganService asset)', () => {
      const footer = site.pages.find((p) => p.id === 'index')!.footer;
      const sloganItems = (footer.items ?? []).filter((i) => i.kind === 'slogan');
      expect(sloganItems).toEqual([]);
    });

    it('derives nav structure from shared keys and the page list from locale structure', () => {
      expect(site.nav.length).toBe(4);
      expect(site.nav.map((n) => n.title)).toEqual([
        'nav.modules',
        'nav.features',
        'nav.documentation',
        'nav.community',
      ]);
      expect(site.pages.map((p) => p.id)).toEqual([
        'index',
        'modules',
        'features',
        'tutorials',
        'examples',
        'community',
      ]);
    });

    it('couples every page hero to its own nav chrome and a trailing footer', () => {
      for (const page of site.pages) {
        expect(page.header.kind).toBe(page.id === 'index' ? 'hero' : 'page-hero');
        expect((page.header.items ?? []).some((i) => i.kind === 'nav')).toBe(true);
        expect(page.footer.kind).toMatch(/^footer/);
      }
    });

    it('keys every visible string through locale keys (titleKey/subtitleKey/kickerKey)', () => {
      for (const page of site.pages) {
        for (const section of [page.header, ...page.sections, page.footer]) {
          if (section.kind !== 'footer' && section.kind !== 'footer-slim') {
            if (section.titleKey) {
              expect(section.titleKey.startsWith('site.')).toBe(false);
              expect(section.titleKey.includes('.')).toBe(true);
            }
          }
        }
      }
    });

    it('has no raw english literals leaked into pt/en intended-keys-only structures', () => {
      const hero = site.pages.find((p) => p.id === 'index')!.header;
      expect(hero.titleKey).toBe('hero.title');
      expect(hero.subtitleKey).toBe('hero.subtitle');
      const cta = site.pages.find((p) => p.id === 'index')!.sections.find((s) => s.kind === 'cta')!;
      expect(cta.titleKey).toBe('cta2.title');
    });
  });

  it('the RamAdapter-backed service seeds the full page graph per locale', async () => {
    const user = 'page-structure-test';
    new RamAdapter({ user });
    const service = new SiteService();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [],
    }) as unknown as typeof fetch;

    await service.seed('en_us');
    const site = await service.getSite('en_us');
    expect(site!.pages.map((p) => p.id)).toEqual([
      'index',
      'modules',
      'features',
      'tutorials',
      'examples',
      'community',
    ]);
    for (const page of site!.pages) {
      expect(page.header[0].kind).toBe(page.id === 'index' ? 'hero' : 'page-hero');
      expect(page.footer[0].kind).toMatch(/^footer/);
    }
  });

  it('localized iterable content differs across locales where provided', () => {
    const pt = SITE_SEED.pt_br.cards![0].title;
    const en = SITE_SEED.en_us.cards![0].title;
    expect(pt).not.toBe(en);
  });
});

describe('isSiteLocale / SITE_LOCALES surface', () => {
  it('accepts only the four supported locales', () => {
    const { isSiteLocale } = require('../src/app/services/site.service');
    for (const locale of SITE_LOCALES) {
      expect(isSiteLocale(locale)).toBe(true);
    }
    expect(isSiteLocale('en')).toBe(false);
    expect(isSiteLocale('fr_fr')).toBe(false);
    expect(isSiteLocale(undefined)).toBe(false);
  });

  it('types every locale as a valid SiteLocale', () => {
    for (const locale of SITE_LOCALES) {
      expect(SITE_SEED[locale as SiteLocale]).toBeDefined();
    }
  });
});
