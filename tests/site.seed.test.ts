import { SITE_LOCALES } from '../src/app/seed/i18n-data';
import {
  buildSite,
  SeedSiteData,
  SeedSection,
  SeedPage,
} from '../src/app/seed/site.seed';

describe('site.seed', () => {
  describe.each(SITE_LOCALES)('locale %s', (locale) => {
    let site: SeedSiteData;

    beforeAll(() => {
      site = buildSite(locale);
    });

    it('returns the expected site identity and nav', () => {
      expect(site.id).toBe(locale);
      expect(site.locale).toBe(locale);
      expect(site.logo).toBe('assets/logo_contrast.svg');
      expect(site.pages.map((p) => p.id)).toEqual([
        'index',
        'modules',
        'features',
        'tutorials',
        'examples',
        'community',
      ]);
      expect(site.nav.length).toBeGreaterThanOrEqual(4);
    });

    it('builds the index page with hero, sections and full footer', () => {
      const index = site.pages.find((p) => p.id === 'index')!;
      expect(index.header.kind).toBe('hero');
      expect((index.header.items ?? []).some((i) => i.kind === 'nav')).toBe(true);
      const kinds = index.sections.map((s: SeedSection) => s.kind);
      expect(kinds).toContain('logo-cloud');
      expect(kinds).toContain('features');
      expect(kinds).toContain('cta');
      expect(kinds).toContain('showcase');
      expect(kinds).toContain('faq');
      expect(index.footer.kind).toBe('footer');
      const faq = index.sections.find((s) => s.kind === 'faq')!;
      expect(faq.kind).toBe('faq');
      // iterable faq/brand/card data lives in the RamAdapter tables, not the section items
      expect(faq.items ?? []).toEqual([]);
    });

    it('gives every sub page a slim footer', () => {
      for (const id of ['modules', 'features', 'tutorials', 'examples', 'community']) {
        const page = site.pages.find((p) => p.id === id) as SeedPage;
        expect(page.footer.kind).toBe('footer-slim');
      }
    });

    it('seeds list-bearing body sections between hero and footer for every sub page', () => {
      const expected: Record<string, string> = {
        modules: 'modules',
        features: 'features-page',
        tutorials: 'tutorials',
        examples: 'examples',
        community: 'community',
      };
      for (const [id, kind] of Object.entries(expected)) {
        const page = site.pages.find((p) => p.id === id) as SeedPage;
        const sectionKinds = page.sections.map((s) => s.kind);
        expect(sectionKinds).toContain(kind);
      }
    });
  });
});
