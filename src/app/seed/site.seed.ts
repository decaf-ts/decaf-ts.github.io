import { SiteLocale } from './i18n-data';

/**
 * @module app/seed/site.seed
 * @description Plain-data builder for the {@link WebApp} site graph per locale.
 * Mirrors the www-mock DOM structure. i18n strings are referenced by locale key
 * and resolved at render time by ngx-translate (a.i. `hero.title`).
 * @summary Exposes the `SeedSiteData`/`SeedPage`/`SeedSection`/`SeedItem` data shapes
 * describing the marketing site per locale, and the {@link buildSite} function that
 * composes the routed pages (index, modules, features, tutorials, examples, community)
 * from the static locale content, the navigation and the footer chrome. Iterable page
 * content (brands, cards, faq, tutorials, examples, module features) is preloaded into
 * RamAdapter tables by the {@link SiteService} and rendered by decaf list components, so
 * the sections below only carry the structural chrome (hero, ctas, showcase visuals).
 */

/**
 * @description The complete seed graph for one locale: identity, logo, nav and pages.
 * @interface SeedSiteData
 * @memberOf module:app/seed/site.seed
 */
export interface SeedSiteData {
  /**
   * @description Site identifier, equal to the locale code.
   */
  id: string;
  /**
   * @description The locale the site is seeded for.
   */
  locale: string;
  /**
   * @description Logo asset path rendered by the layout chrome.
   */
  logo: string;
  /**
   * @description Shared navigation links (title i18n keys + hrefs).
   */
  nav: {
    title: string;
    href: string;
    kind?: string;
  }[];
  /**
   * @description The routed pages (index, modules, features, tutorials, examples, community).
   */
  pages: SeedPage[];
}

/**
 * @description A single routed page of the seed graph.
 * @interface SeedPage
 * @memberOf module:app/seed/site.seed
 */
export interface SeedPage {
  /**
   * @description Page identifier matched by the routed page data (`index`, `modules`, ...).
   */
  id: string;
  /**
   * @description i18n key for the document/page title.
   */
  titleKey: string;
  /**
   * @description Hero (header) section definition.
   */
  header: SeedSection;
  /**
   * @description Body sections rendered between the hero and the footer.
   */
  sections: SeedSection[];
  /**
   * @description Footer section definition (full or slim).
   */
  footer: SeedSection;
}

/**
 * @description A section definition of the seed graph.
 * @interface SeedSection
 * @memberOf module:app/seed/site.seed
 */
export interface SeedSection {
  /**
   * @description Section layout kind (`hero`, `faq`, `footer`, ...).
   */
  kind?: string;
  /**
   * @description Section identifier, usually built from locale + kind.
   */
  id?: string;
  /**
   * @description i18n key for the section heading.
   */
  titleKey?: string;
  /**
   * @description Plain (non-keyed) heading override.
   */
  title?: string;
  /**
   * @description i18n key for the section subtitle.
   */
  subtitleKey?: string;
  /**
   * @description Plain (non-keyed) subtitle override.
   */
  subtitle?: string;
  /**
   * @description i18n key for the small kicker label above the heading.
   */
  kickerKey?: string;
  /**
   * @description Optional external or router link associated with the section.
   */
  href?: string;
  /**
   * @description Optional section name hint.
   */
  name?: string;
  /**
   * @description Optional module name hint consumed by list sections.
   */
  module?: string;
  /**
   * @description Flips showcase visual placement when true.
   */
  flip?: boolean;
  /**
   * @description Content items rendered inside the section.
   */
  items?: SeedItem[];
}

/**
 * @description A leaf content item definition of the seed graph.
 * @interface SeedItem
 * @memberOf module:app/seed/site.seed
 */
export interface SeedItem {
  /**
   * @description Item identifier, usually built from locale, tag and kind.
   */
  id?: string;
  /**
   * @description Item rendering discriminator (`nav`, `link`, `inline`, `social`, ...).
   */
  kind?: string;
  /**
   * @description i18n key for the display title.
   */
  titleKey?: string;
  /**
   * @description Plain (non-keyed) display title.
   */
  title?: string;
  /**
   * @description Longer descriptive text.
   */
  description?: string;
  /**
   * @description i18n key for the display description.
   */
  descriptionKey?: string;
  /**
   * @description Short summary text.
   */
  summary?: string;
  /**
   * @description Raw code snippet.
   */
  code?: string;
  /**
   * @description Plain text content.
   */
  text?: string;
  /**
   * @description Optional router link or external href.
   */
  href?: string;
  /**
   * @description Image asset url.
   */
  src?: string;
  /**
   * @description Inline SVG markup.
   */
  icon?: string;
  /**
   * @description Auxiliary item name (module or social network name).
   */
  name?: string;
  /**
   * @description Language code for code samples.
   */
  lang?: string;
  /**
   * @description Tag discriminator used to select items inside a section.
   */
  tag?: string;
  /**
   * @description Alternate text for image content.
   */
  alt?: string;
  /**
   * @description Nested items (e.g. footer column links).
   */
  children?: SeedItem[];
}

const NAV_ITEMS: { title: string; href: string }[] = [
  { title: 'nav.modules', href: '/modules' },
  { title: 'nav.features', href: '/features' },
  { title: 'nav.documentation', href: '#' },
  { title: 'nav.community', href: '/community' },
];

const SOCIAL_ITEMS: { name: string; icon: string; href: string }[] = [
  {
    name: 'Facebook',
    href: '#',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 16.9706 7.02944 21 12 21Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M15.75 8.25H14.25C13.6533 8.25 13.081 8.48705 12.659 8.90901C12.2371 9.33097 12 9.90326 12 10.5V21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M9 13.5H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    name: 'Instagram',
    href: '#',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M12 15.75C14.0711 15.75 15.75 14.0711 15.75 12C15.75 9.92893 14.0711 8.25 12 8.25C9.92893 8.25 8.25 9.92893 8.25 12C8.25 14.0711 9.92893 15.75 12 15.75Z" stroke="currentColor" stroke-width="1.5"/><path d="M16.5 3H7.5C5.01472 3 3 5.01472 3 7.5V16.5C3 18.9853 5.01472 21 7.5 21H16.5C18.9853 21 21 18.9853 21 16.5V7.5C21 5.01472 18.9853 3 16.5 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="16.875" cy="7.125" r="1.125" fill="currentColor"/></svg>',
  },
  {
    name: 'X (Twitter)',
    href: '#',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M4.5 3.75H9L19.5 20.25H15L4.5 3.75Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M10.6762 13.4559L4.5 20.25" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M19.5005 3.75L13.3242 10.5441" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
  {
    name: 'LinkedIn',
    href: '#',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M20.25 3H3.75C3.33579 3 3 3.33579 3 3.75V20.25C3 20.6642 3.33579 21 3.75 21H20.25C20.6642 21 21 20.6642 21 20.25V3.75C21 3.33579 20.6642 3 20.25 3Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11.25 10.5V16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M8.25 10.5V16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M11.25 13.125C11.25 12.4288 11.5266 11.7611 12.0188 11.2688C12.5111 10.7766 13.1788 10.5 13.875 10.5C14.5712 10.5 15.2389 10.7766 15.7312 11.2688C16.2234 11.7611 16.5 12.4288 16.5 13.125V16.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8.25" cy="7.875" r="1.125" fill="currentColor"/></svg>',
  },
  {
    name: 'YouTube',
    href: '#',
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" class="w-6 h-6"><path d="M15 12L10.5 9V15L15 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><path d="M2.25 12C2.25 14.8041 2.53781 16.4484 2.75719 17.2941C2.8152 17.5241 2.92694 17.737 3.08322 17.9155C3.23951 18.094 3.43589 18.2328 3.65625 18.3206C6.79875 19.5328 12 19.5 12 19.5C12 19.5 17.2012 19.5328 20.3438 18.3206C20.5648 18.2333 20.7619 18.0947 20.9189 17.9162C21.0759 17.7377 21.1882 17.5245 21.2466 17.2941C21.4659 16.4503 21.7537 14.8041 21.7537 12C21.7537 9.19594 21.4659 7.55156 21.2466 6.70594C21.1888 6.47468 21.0768 6.26051 20.9198 6.08117C20.7628 5.90183 20.5653 5.76249 20.3438 5.67469C17.2012 4.46719 12 4.5 12 4.5C12 4.5 6.79875 4.46719 3.65625 5.67938C3.43466 5.76717 3.23718 5.90652 3.08017 6.08586C2.92317 6.26537 2.81116 6.47937 2.75344 6.71063C2.53781 7.55063 2.25 9.19594 2.25 12Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  },
];

const FOOTER_COLS: { tag: string; titleKey: string; links: { titleKey: string; href: string }[] }[] = [
  {
    tag: 'product',
    titleKey: 'footer.col.product',
    links: [
      { titleKey: 'footer.product.documentation', href: '#' },
      { titleKey: 'footer.product.api', href: '#' },
      { titleKey: 'footer.product.blog', href: '#' },
      { titleKey: 'footer.product.support', href: '#' },
    ],
  },
  {
    tag: 'contact',
    titleKey: 'footer.col.contact',
    links: [
      { titleKey: 'footer.contact.email', href: '#' },
      { titleKey: 'footer.contact.chat', href: '#' },
      { titleKey: 'footer.contact.feedback', href: '#' },
      { titleKey: 'footer.contact.help', href: '#' },
    ],
  },
  {
    tag: 'legal',
    titleKey: 'footer.col.legal',
    links: [
      { titleKey: 'footer.legal.terms', href: '#' },
      { titleKey: 'footer.legal.privacy', href: '#' },
      { titleKey: 'footer.legal.cookie', href: '#' },
      { titleKey: 'footer.legal.gdpr', href: '#' },
    ],
  },
];

const HERO_MOCKUP_LAYERS =
  '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-gray-400"><path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const SHOWCASE_CHECK =
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-red-300"><path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/></svg>';

const SHOWCASE_STAR =
  '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" class="text-gray-400"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

const NEWS_BANNER_SPARK =
  '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" class="text-white"><path d="M4.5 2.4925V13.5075C4.50163 13.5954 4.52641 13.6813 4.57184 13.7566C4.61727 13.8318 4.68174 13.8938 4.75875 13.9362C4.83576 13.9786 4.92259 14 5.01048 13.9981C5.09837 13.9962 5.18422 13.9712 5.25938 13.9256L14.2644 8.41812C14.3363 8.37459 14.3958 8.31323 14.4371 8.23998C14.4784 8.16674 14.5 8.08408 14.5 8C14.5 7.91592 14.4784 7.83326 14.4371 7.76002C14.3958 7.68677 14.3363 7.62541 14.2644 7.58187L5.25938 2.07437C5.18422 2.02875 5.09837 2.00376 5.01048 2.0019C4.92259 2.00004 4.83576 2.02139 4.75875 2.06379C4.68174 2.1062 4.61727 2.16815 4.57184 2.24342C4.52641 2.31869 4.50163 2.4046 4.5 2.4925Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>';

/**
 * @description Builds the navigation {@link SeedItem}s mirrored into every page hero.
 * @summary Mirrors the www-mock nav row (logo, four links and the primary CTA) so the
 * hero chrome can render it inside the same gradient as the page header.
 * @function buildNavItems
 * @param {SiteLocale} locale - The locale code used for ids.
 * @returns {SeedItem[]} The nav seed items.
 */
function buildNavItems(locale: SiteLocale): SeedItem[] {
  return [
    ...NAV_ITEMS.map((link, i) => ({
      kind: 'nav' as const,
      id: `${locale}_nav_${i}`,
      titleKey: link.title,
      href: link.href,
    })),
    {
      kind: 'link' as const,
      id: `${locale}_nav_cta`,
      tag: 'cta-primary',
      titleKey: 'cta.get_started',
      href: '/modules',
    },
  ];
}

/**
 * @description Builds the footer {@link SeedSection} for a locale.
 * @function buildFooter
 * @param {SiteLocale} locale - The locale code used for ids and content lookup.
 * @param {boolean} [slim] - Whether to build the compact sub-page footer.
 * @returns {SeedSection} The footer section definition.
 */
function buildFooter(locale: SiteLocale, slim: boolean = false): SeedSection {
  const items: SeedItem[] = [];
  for (let c = 0; c < FOOTER_COLS.length; c++) {
    const col = FOOTER_COLS[c];
    items.push({
      kind: 'link',
      id: `${locale}_footer_${col.tag}`,
      tag: col.tag,
      titleKey: col.titleKey,
      children: col.links.map((l, li) => ({
        kind: 'link',
        id: `${locale}_footer_${col.tag}_${li}`,
        titleKey: l.titleKey,
        href: l.href,
      })),
    });
  }
  for (let s = 0; s < SOCIAL_ITEMS.length; s++) {
    const social = SOCIAL_ITEMS[s];
    items.push({
      kind: 'social',
      id: `${locale}_footer_social_${s}`,
      tag: 'social',
      name: social.name,
      href: social.href,
      icon: social.icon,
    });
  }
  return {
    kind: slim ? 'footer-slim' : 'footer',
    id: `${locale}_footer_${slim ? 'slim' : 'full'}`,
    titleKey: 'footer.description',
    subtitleKey: 'footer.copyright',
    items,
  };
}

/**
 * @description Builds the index page {@link SeedPage} for a locale.
 * @function buildIndex
 * @param {SiteLocale} locale - The locale code used for ids and content lookup.
 * @returns {SeedPage} The index page definition.
 */
function buildIndex(locale: SiteLocale): SeedPage {
  return {
    id: 'index',
    titleKey: 'document.title',
    header: {
      kind: 'hero',
      id: `${locale}_index_hero`,
      titleKey: 'hero.title',
      subtitleKey: 'hero.subtitle',
      items: [
        ...buildNavItems(locale),
        {
          kind: 'inline',
          tag: 'news',
          titleKey: 'banner.latest_news',
          icon: NEWS_BANNER_SPARK,
        },
        {
          kind: 'link',
          tag: 'cta-primary',
          titleKey: 'hero.cta.explore_modules',
          href: '/modules',
        },
        { kind: 'link', tag: 'cta-secondary', titleKey: 'hero.cta.documentation', href: '#' },
        {
          kind: 'inline',
          tag: 'preview',
          titleKey: 'hero.preview_label',
          icon: HERO_MOCKUP_LAYERS,
        },
      ],
    },
    sections: [
      {
        kind: 'logo-cloud',
        id: `${locale}_logo_cloud`,
        titleKey: 'logo_cloud.title',
        subtitleKey: 'logo_cloud.description',
      },
      {
        kind: 'features',
        id: `${locale}_features`,
        kickerKey: 'features.kicker',
        titleKey: 'features.title',
        subtitleKey: 'features.description',
      },
      {
        kind: 'cta',
        id: `${locale}_cta`,
        titleKey: 'cta2.title',
        subtitleKey: 'cta2.description',
        items: [
          { kind: 'link', tag: 'cta-primary', titleKey: 'cta2.get_started', href: '/modules' },
          { kind: 'link', tag: 'cta-secondary', titleKey: 'cta2.see_docs', href: '#' },
        ],
      },
      {
        kind: 'showcase',
        id: `${locale}_showcase_task`,
        kickerKey: 'showcase.kicker',
        titleKey: 'showcase.task.title',
        subtitleKey: 'showcase.task.description',
        href: '#',
        items: [
          { kind: 'inline', tag: 'visual', titleKey: 'showcase.task.demo_label', icon: SHOWCASE_CHECK },
          { kind: 'link', tag: 'cta-primary', titleKey: 'showcase.see_how', href: '#' },
        ],
      },
      {
        kind: 'showcase',
        id: `${locale}_showcase_grade`,
        flip: true,
        kickerKey: 'showcase.kicker',
        titleKey: 'showcase.grade.title',
        subtitleKey: 'showcase.task.description',
        href: '#',
        items: [
          { kind: 'inline', tag: 'visual', titleKey: 'showcase.grade.demo_label', icon: SHOWCASE_STAR },
          { kind: 'link', tag: 'cta-primary', titleKey: 'showcase.see_how', href: '#' },
        ],
      },
      {
        kind: 'showcase',
        id: `${locale}_showcase_task_repeat`,
        kickerKey: 'showcase.kicker',
        titleKey: 'showcase.task.title',
        subtitleKey: 'showcase.task.description',
        href: '#',
        items: [
          { kind: 'inline', tag: 'visual', titleKey: 'showcase.task.demo_label', icon: SHOWCASE_CHECK },
          { kind: 'link', tag: 'cta-primary', titleKey: 'showcase.see_how', href: '#' },
        ],
      },
      {
        kind: 'faq',
        id: `${locale}_faq`,
        kickerKey: 'faq.kicker',
        titleKey: 'faq.title',
        subtitleKey: 'faq.description',
      },
    ],
    footer: buildFooter(locale),
  };
}

/**
 * @description Builds a generic sub page {@link SeedPage} (page-hero + slim footer).
 * @function buildSubPage
 * @param {SiteLocale} locale - The locale code used for ids.
 * @param {string} id - The page identifier matched by the routed page data.
 * @param {string} titleKey - i18n key for the document/page title.
 * @param {Partial<SeedSection>} [overrides] - Extra hero fields (title key, subtitle, items).
 * @param {SeedSection[]} [sections] - Optional body sections rendered between hero and footer.
 * @returns {SeedPage} The sub page definition.
 */
function buildSubPage(
  locale: SiteLocale,
  id: string,
  titleKey: string,
  overrides: Partial<SeedSection> = {},
  sections: SeedSection[] = []
): SeedPage {
  return {
    id,
    titleKey,
    header: {
      kind: 'page-hero',
      id: `${locale}_hero_${id}`,
      items: buildNavItems(locale),
      ...overrides,
    },
    sections,
    footer: buildFooter(locale, true),
  };
}

/**
 * @description Builds the modules page {@link SeedPage}.
 * @function buildModulesPage
 * @param {SiteLocale} locale - The locale code used for ids.
 * @returns {SeedPage} The modules page definition.
 */
function buildModulesPage(locale: SiteLocale): SeedPage {
  return buildSubPage(locale, 'modules', 'modules.document_title', {
    titleKey: 'modules.title',
    subtitleKey: 'modules.subtitle',
  }, [
    { kind: 'modules', id: `${locale}_modules_list` },
  ]);
}

/**
 * @description Builds the features page {@link SeedPage}.
 * @function buildFeaturesPage
 * @param {SiteLocale} locale - The locale code used for ids.
 * @returns {SeedPage} The features page definition.
 */
function buildFeaturesPage(locale: SiteLocale): SeedPage {
  return buildSubPage(locale, 'features', 'features.document_title', {
    titleKey: 'features.title',
    subtitleKey: 'features.description',
  }, [
    { kind: 'features-page', id: `${locale}_features_list` },
  ]);
}

/**
 * @description Builds the tutorials page {@link SeedPage}.
 * @function buildTutorialsPage
 * @param {SiteLocale} locale - The locale code used for ids.
 * @returns {SeedPage} The tutorials page definition.
 */
function buildTutorialsPage(locale: SiteLocale): SeedPage {
  return buildSubPage(locale, 'tutorials', 'tutorials.document_title', {
    title: 'Tutorials',
    titleKey: '',
  }, [
    { kind: 'tutorials', id: `${locale}_tutorials_list` },
  ]);
}

/**
 * @description Builds the examples page {@link SeedPage}.
 * @function buildExamplesPage
 * @param {SiteLocale} locale - The locale code used for ids.
 * @returns {SeedPage} The examples page definition.
 */
function buildExamplesPage(locale: SiteLocale): SeedPage {
  return buildSubPage(locale, 'examples', 'examples.document_title', {
    title: 'Examples',
    titleKey: '',
  }, [
    { kind: 'examples', id: `${locale}_examples_list` },
  ]);
}

/**
 * @description Builds the community page {@link SeedPage}.
 * @function buildCommunityPage
 * @param {SiteLocale} locale - The locale code used for ids.
 * @returns {SeedPage} The community page definition.
 */
function buildCommunityPage(locale: SiteLocale): SeedPage {
  return buildSubPage(locale, 'community', 'community.document_title', {
    titleKey: 'community.title',
    subtitleKey: 'community.subtitle',
  }, [
    {
      kind: 'community',
      id: `${locale}_community`,
      kickerKey: 'community.kicker',
      titleKey: 'community.discover',
      subtitleKey: 'community.discover_subtitle',
      items: [
        {
          kind: 'card',
          tag: 'discord',
          titleKey: 'community.discord.title',
          descriptionKey: 'community.discord.description',
          href: 'https://discord.gg/decaf-ts',
          icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-indigo-600"><path d="M18.942 5.423a17.14 17.14 0 0 0-4.232-1.325.065.065 0 0 0-.069.032 11.938 11.938 0 0 0-.526 1.08 15.845 15.845 0 0 0-4.23 0 11.846 11.846 0 0 0-.53-1.079.066.066 0 0 0-.069-.032 17.088 17.088 0 0 0-4.23 1.325.062.062 0 0 0-.028.025A17.56 17.56 0 0 0 2.423 16.16a.065.065 0 0 0 .025.061 17.16 17.16 0 0 0 5.17 2.611.065.065 0 0 0 .07-.025 12.33 12.33 0 0 0 1.057-1.695.065.065 0 0 0-.036-.09 11.284 11.284 0 0 1-1.612-.766.065.065 0 0 1-.006-.108 8.073 8.073 0 0 0 .32-.255.065.065 0 0 1 .067-.008 12.198 12.198 0 0 0 10.383 0 .065.065 0 0 1 .068.009l.319.255a.065.065 0 0 1-.006.107 11.35 11.35 0 0 1-1.612.767.065.065 0 0 0-.035.09c.462.84.781 1.4 1.057 1.695a.065.065 0 0 0 .07.024 17.108 17.108 0 0 0 5.17-2.61.064.064 0 0 0 .025-.062A17.505 17.505 0 0 0 18.97 5.448a.06.06 0 0 0-.028-.025ZM8.74 13.782c-.977 0-1.78-.898-1.78-1.998 0-1.1.79-1.998 1.78-1.998s1.793.91 1.78 1.998c0 1.1-.792 1.998-1.78 1.998Zm6.52 0c-.977 0-1.78-.898-1.78-1.998 0-1.1.79-1.998 1.78-1.998 1.003 0 1.793.91 1.78 1.998 0 1.1-.79 1.998-1.78 1.998Z" fill="currentColor"/></svg>',
        },
        {
          kind: 'card',
          tag: 'github',
          titleKey: 'community.github.title',
          descriptionKey: 'community.github.description',
          href: 'https://github.com/decaf-ts',
          icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-gray-900"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026a9.564 9.564 0 0 1 2.504-.337c.85 0 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.378.203 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" fill="currentColor"/></svg>',
        },
        {
          kind: 'card',
          tag: 'tutorials',
          titleKey: 'community.tutorials.title',
          descriptionKey: 'community.tutorials.description',
          href: '/tutorials',
          icon: '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="text-purple-600"><path d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
        },
      ],
    },
  ]);
}

/**
 * @description Builds the full {@link SeedSiteData} graph for a locale.
 * @function buildSite
 * @param {SiteLocale} locale - The locale whose content should be used.
 * @returns {SeedSiteData} The complete site graph for the locale.
 */
export function buildSite(locale: SiteLocale): SeedSiteData {
  const pages: SeedPage[] = [
    buildIndex(locale),
    buildModulesPage(locale),
    buildFeaturesPage(locale),
    buildTutorialsPage(locale),
    buildExamplesPage(locale),
    buildCommunityPage(locale),
  ];
  return {
    id: locale,
    locale,
    logo: 'assets/logo_contrast.svg',
    nav: NAV_ITEMS,
    pages,
  };
}
