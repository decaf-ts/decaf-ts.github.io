import { SITE_LOCALES } from '../src/app/seed/i18n-data';
import {
  buildSite,
  SeedSiteData,
  SeedSection,
  SeedPage,
} from '../src/app/seed/site.seed';

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

const EXPECTED_NAV = [
  { title: 'nav.modules', href: '/modules' },
  { title: 'nav.features', href: '/features' },
  { title: 'nav.documentation', href: '/documentation' },
  { title: 'nav.showcase', href: '/showcase' },
  { title: 'nav.apps', href: '/apps' },
  { title: 'nav.community', href: '/community' },
];

describe('site.seed', () => {
  describe.each(SITE_LOCALES)('locale %s', (locale) => {
    let site: SeedSiteData;

    beforeAll(() => {
      site = buildSite(locale);
    });

    it('returns the round-2 site identity and navigation', () => {
      expect(site.id).toBe(locale);
      expect(site.locale).toBe(locale);
      expect(site.logo).toBe('assets/logo_contrast.svg');
      expect(site.pages.map((p) => p.id)).toEqual(EXPECTED_PAGES);
      expect(site.nav.map((n) => ({ title: n.title, href: n.href }))).toEqual(EXPECTED_NAV);
    });

    it('builds the index page with the round-2 sections and full footer', () => {
      const index = site.pages.find((p) => p.id === 'index')!;
      expect(index.header.kind).toBe('hero');
      expect((index.header.items ?? []).some((i) => i.kind === 'nav')).toBe(true);
      const kinds = index.sections.map((s: SeedSection) => s.kind);
      expect(kinds).toEqual([
        'logo-cloud',
        'features',
        'cta',
        'showcase-highlights',
        'decaf-apps',
        'faq',
      ]);
      // the round-1 `showcase` section was replaced by the two round-2 kinds
      expect(kinds).not.toContain('showcase');
      expect(index.footer.kind).toBe('footer');

      const highlights = index.sections.find((s) => s.kind === 'showcase-highlights')!;
      expect(highlights.href).toBe('/showcase');
      expect(highlights.titleKey).toBe('showcase.title');

      const apps = index.sections.find((s) => s.kind === 'decaf-apps')!;
      expect(apps.href).toBe('/apps');
      expect(apps.titleKey).toBe('apps.title');

      const faq = index.sections.find((s) => s.kind === 'faq')!;
      // iterable faq/brand/card data lives in the RamAdapter tables, not the section items
      expect(faq.items ?? []).toEqual([]);
    });

    it('gives every sub page a slim footer', () => {
      for (const id of EXPECTED_PAGES.filter((p) => p !== 'index')) {
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
        documentation: 'documentation',
        showcase: 'showcase-highlights',
        apps: 'decaf-apps',
        news: 'news',
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
