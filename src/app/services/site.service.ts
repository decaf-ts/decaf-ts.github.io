import { Logging } from '@decaf-ts/logging';
import { Context, Repository, service, Service } from '@decaf-ts/core';
import type { AdapterFlags } from '@decaf-ts/core';
import { Model } from '@decaf-ts/decorator-validation';
import { WebApp } from '../structure/WebApp';
import { SiteItem } from '../models/SiteItem';
import { ModuleDoc } from '../models/ModuleDoc';
import { ModuleFeature } from '../models/ModuleFeature';
import { HomeCard } from '../models/HomeCard';
import { Faq } from '../models/Faq';
import { Brand } from '../models/Brand';
import { Tutorial } from '../models/Tutorial';
import { Example } from '../models/Example';
import { Section } from '../structure/Section';
import { WebAppPage } from '../structure/WebAppPage';
import { SiteLocale, SITE_SEED } from '../seed/i18n-data';
import { buildSite, SeedSection, SeedItem } from '../seed/site.seed';

/**
 * Module-scoped seeding state. Kept off the decorated class because @service()
 * wraps the constructor at decoration time and static/dynamic members are
 * unreliable on the returned wrapper.
 * @type {Object}
 * @property {Object<string, Promise<void>>} READY_LOCALES - Map of locale to the seeded-state
 * promise (dedupes concurrent seeding per locale).
 */
const READY_LOCALES: Record<string, Promise<void>> = {};
/**
 * @const MODULE_NAMES
 * @description Names of the seeded {@link ModuleDoc} records, remembered so
 * `getModules()` can read them all back from the RamAdapter.
 * @type {string[]}
 */
const MODULE_NAMES: string[] = [];
/**
 * @const MODULE_VERSIONS
 * @description Resolved `@decaf-ts/*` versions from the build-time versions asset,
 * loaded lazily so module components can display the installed package version.
 * @type {Record<string, string>}
 */
let MODULE_VERSIONS: Record<string, string> = {};

/**
 * @module app/services/SiteService
 * @description Seeds and serves the {@link WebApp} site graph from the RamAdapter.
 * @summary Module exposing the {@link SiteService} class and the {@link ensureSiteReady}
 * seeding helper. The service populates the in-memory adapter once per locale with the
 * {@link WebApp} site graph (built from {@link app/seed/site.seed}), the {@link ModuleDoc}
 * records (read from the bundled `assets/data/modules.json` asset) and the iterable
 * content tables (`ModuleFeature`, `HomeCard`, `Faq`, `Brand`, `Tutorial`, `Example`)
 * preloaded from the locale {@link SITE_SEED} so decaf list components can render them.
 */

/**
 * @description Service producing and reading the site content from the RamAdapter.
 * @summary `SiteService` seeds the {@link WebApp} graph, the {@link ModuleDoc}
 * documentation records and the iterable content tables for each locale into the decaf
 * RamAdapter and exposes {@link getSite}, {@link getPage}, {@link getModule} and
 * {@link getModules} accessors. Because {@link ensureSiteReady} keeps a module-scoped
 * seeding promise, multiple components may call it concurrently without re-seeding.
 * @class
 * @example
 * import { SiteService, ensureSiteReady } from './site.service';
 * const service = new SiteService();
 * await ensureSiteReady('en_us', service);
 * const site = await service.getSite('en_us');
 * console.log(site?.pages.map((p) => p.id));
 */
@service()
export class SiteService extends Service {
  constructor() {
    super();
  }

  /**
   * @description Seeds the site, module + content tables for a locale.
   * @summary Convenience entry point that {@link seedSite}s the {@link WebApp} graph,
   * {@link seedModules} the module documentation records and {@link seedContent} the
   * iterable content tables for the given locale.
   * @param {SiteLocale} locale - The locale to seed.
   * @returns {Promise<void>} Resolves once all seeding passes complete.
   */
  async seed(locale: SiteLocale): Promise<void> {
    const { log, ctx } = this.logCtx([this.newCtx()], this.seed);
    log.info(`Seeding site data for locale ${locale}`);
    await this.seedSite(locale, ctx as Context<AdapterFlags>);
    await this.seedModules(locale, ctx as Context<AdapterFlags>);
    await this.seedContent(locale, ctx as Context<AdapterFlags>);
    log.info(`Seeding complete for locale ${locale}`);
  }
  private newCtx(): Context<AdapterFlags> {
    return new Context().accumulate({
      logger: Logging.get(),
      timestamp: new Date(),
    }) as Context<AdapterFlags>;
  }

  /**
   * @description Seeds or replaces the {@link WebApp} site graph for a locale.
   * @param {SiteLocale} locale - The locale whose site graph is written to the adapter.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context forwarded to the repository.
   * @returns {Promise<void>} Resolves once the previous record (if any) is replaced.
   */
  async seedSite(locale: SiteLocale, ctx?: Context<AdapterFlags>): Promise<void> {
    const site = this.buildWebApp(locale);
    const repo = Repository.forModel(WebApp);
    try {
      await repo.delete(site.id, ctx);
    } catch {
      // no prior record to replace
    }
    await repo.create(site, ctx);
  }

  /**
   * @description Builds and populates the {@link WebApp} model tree from locale seed data.
   * @param {SiteLocale} locale - The locale whose content is used.
   * @returns {WebApp} The fully populated site model (nav + pages).
   */
  buildWebApp(locale: SiteLocale): WebApp {
    const data = buildSite(locale);
    return Model.fromModel(new WebApp(), {
      id: data.id,
      locale: data.locale,
      logo: data.logo,
      nav: [
        {
          id: `${locale}_nav`,
          kind: 'nav',
          items: [
            ...data.nav.map((item, i) => ({
              id: `${locale}_nav_item_${i}`,
              kind: 'nav',
              titleKey: item.title,
              href: item.href,
            })),
            {
              id: `${locale}_nav_cta`,
              kind: 'link',
              tag: 'cta-primary',
              titleKey: 'cta.get_started',
              href: '/modules',
            },
          ],
        },
      ],
      pages: data.pages.map((page) => this.buildPage(locale, page)),
    }) as WebApp;
  }

  /**
   * @description Reads the seeded {@link WebApp} for a locale.
   * @param {string} locale - The locale whose site model is read.
   * @returns {Promise<WebApp|undefined>} The site model, or `undefined` when not seeded yet.
   */
  async getSite(locale: string): Promise<WebApp | undefined> {
    const repo = Repository.forModel(WebApp);
    try {
      return await repo.read(locale);
    } catch {
      return undefined;
    }
  }

  /**
   * @description Reads a single page model (uses SITE_SEED metadata for page ids).
   * @param {string} locale - Locale of the site containing the page.
   * @param {string} pageId - Page identifier (e.g. `index`, `modules`, `features`).
   * @returns {Promise<WebAppPage|undefined>} The matching page, or `undefined`.
   */
  async getPage(locale: string, pageId: string): Promise<WebAppPage | undefined> {
    const site = await this.getSite(locale);
    if (!site) return undefined;
    return site.pages.find((p) => p.id === pageId);
  }

  /**
   * @description Reads a seeded {@link ModuleDoc} by module name.
   * @param {string} name - The module name (primary key of the record).
   * @returns {Promise<ModuleDoc|undefined>} The module documentation record, or `undefined`.
   */
  async getModule(name: string): Promise<ModuleDoc | undefined> {
    const repo = Repository.forModel(ModuleDoc);
    try {
      return await repo.read(name);
    } catch {
      return undefined;
    }
  }

  /**
   * @description Reads all seeded {@link ModuleDoc} records.
   * @returns {Promise<ModuleDoc[]>} Every module documentation record (empty when none seeded).
   */
  async getModules(): Promise<ModuleDoc[]> {
    if (!MODULE_NAMES.length) return [];
    const repo = Repository.forModel(ModuleDoc);
    try {
      return await repo.readAll(MODULE_NAMES);
    } catch {
      return [];
    }
  }

  /**
   * @description Reads the resolved `@decaf-ts/*` version map.
   * @summary Lazily fetched from the build-time `assets/data/module-versions.json` asset
   * and cached module-scope so module list components show the installed package version.
   * @returns {Promise<Record<string, string>>} Map of module name to version string.
   */
  async getModuleVersions(): Promise<Record<string, string>> {
    if (Object.keys(MODULE_VERSIONS).length) return MODULE_VERSIONS;
    try {
      const response = await fetch('assets/data/module-versions.json');
      if (response.ok) {
        MODULE_VERSIONS = (await response.json()) as Record<string, string>;
      }
    } catch {
      MODULE_VERSIONS = {};
    }
    return MODULE_VERSIONS;
  }

  /**
   * @description Seeds the iterable content tables for a locale.
   * @summary Preloads the {@link Brand} (logo cloud), {@link HomeCard} (marketing grid),
   * {@link Faq}, {@link Tutorial} and {@link ModuleFeature} tables from the locale
   * {@link SITE_SEED} plus the {@link Example} table from the modules asset, so decaf
   * list components can render them through the RamAdapter.
   * @param {SiteLocale} locale - The locale whose content tables are written.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>} Resolves once the tables are (re)populated.
   *
   * @private
   */
  private async seedContent(locale: SiteLocale, ctx?: Context<AdapterFlags>): Promise<void> {
    const seed = SITE_SEED[locale];

    const brandRepo = Repository.forModel(Brand);
    const cardRepo = Repository.forModel(HomeCard);
    const faqRepo = Repository.forModel(Faq);
    const tutorialRepo = Repository.forModel(Tutorial);
    const exampleRepo = Repository.forModel(Example);
    const featureRepo = Repository.forModel(ModuleFeature);

    for (const b of seed.brands ?? []) {
      await brandRepo.delete(`${locale}_${b.name}`).catch(() => undefined);
      await brandRepo.create(Model.fromModel(new Brand(), {
        id: `${locale}_${b.name}`,
        name: b.name,
        src: b.src,
        alt: b.name,
      }) as Brand, ctx).catch(() => undefined);
    }

    for (const c of seed.cards ?? []) {
      const id = `${locale}_${(c.title || 'card').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
      await cardRepo.delete(id).catch(() => undefined);
      await cardRepo.create(Model.fromModel(new HomeCard(), {
        id,
        title: c.title || '',
        description: c.description || '',
        icon: c.icon || '',
      }) as HomeCard, ctx).catch(() => undefined);
    }

    for (const f of seed.faq ?? []) {
      const id = `${locale}_${(f.title || 'faq').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`;
      await faqRepo.delete(id).catch(() => undefined);
      await faqRepo.create(Model.fromModel(new Faq(), {
        id,
        title: f.title || '',
        description: f.body || '',
      }) as Faq, ctx).catch(() => undefined);
    }

    for (const raw of await this.readRawModules()) {
      for (const ex of (raw.examples ?? [])) {
        if (!ex || typeof ex !== 'object') continue;
        const id = `example_${raw.name}_${(ex.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '_')}`;
        await exampleRepo.delete(id).catch(() => undefined);
        await exampleRepo.create(Model.fromModel(new Example(), {
          id,
          module: raw.name,
          title: ex.title || '',
          summary: ex.context || '',
          code: ex.code || '',
          lang: ex.lang || 'typescript',
        }) as Example, ctx).catch(() => undefined);
      }
    }

    const exampleFeedSource = await Promise.all(Object.entries(seed.tutorials ?? {}).map(async ([module, group]) => {
      const items = group?.items ?? [];
      return items.map((t, i) => ({
        id: `tutorial_${module}_${i}`,
        module,
        title: t.title || '',
        summary: t.summary || '',
        code: t.code || '',
      }));
    }));
    for (const rows of exampleFeedSource) {
      for (const row of rows) {
        await tutorialRepo.delete(row.id).catch(() => undefined);
        await tutorialRepo.create(Model.fromModel(new Tutorial(), row) as Tutorial, ctx).catch(() => undefined);
      }
    }

    const featureSource: { module: string; title: string; description: string }[] = [];
    for (const raw of (SITE_SEED[locale].featureModules && Object.keys(SITE_SEED[locale].featureModules).length ? await this.readRawModules() : [])) {
      const group = seed.featureModules[raw.name];
      const features = group?.features ?? [];
      if (!features.length) continue;
      for (const feat of features) {
        featureSource.push({ module: raw.name, title: feat.title || '', description: feat.description || '' });
      }
    }
    if (!featureSource.length) {
      for (const raw of await this.readRawModules()) {
        const snippet = (raw.description || '').split(/(?:\.|\n)/)[0].slice(0, 160);
        if (snippet) featureSource.push({ module: raw.name, title: raw.title || raw.name, description: snippet });
      }
    }
    for (const feat of featureSource) {
      const id = `feature_${feat.module}_${(feat.title || 'item').toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 40)}`;
      await featureRepo.delete(id).catch(() => undefined);
      await featureRepo.create(Model.fromModel(new ModuleFeature(), {
        id,
        module: feat.module,
        title: feat.title,
        description: feat.description,
      }) as ModuleFeature, ctx).catch(() => undefined);
    }
  }

  private async readRawModules(): Promise<RawModuleDoc[]> {
    try {
      const response = await fetch('assets/data/modules.json');
      if (!response.ok) return [];
      const data: unknown = await response.json();
      return Array.isArray(data) ? (data as RawModuleDoc[]) : [];
    } catch {
      return [];
    }
  }

  private buildPage(locale: SiteLocale, page: SeedPageData): WebAppPage {
    return Model.fromModel(new WebAppPage(), {
      id: page.id,
      titleKey: page.titleKey,
      header: [this.buildSection(locale, page.header)],
      sections: page.sections.map((s) => this.buildSection(locale, s)),
      footer: [this.buildSection(locale, page.footer)],
    }) as WebAppPage;
  }

  private buildSection(locale: SiteLocale, s: SeedSection): Section {
    return Model.fromModel(new Section(), {
      id: s.id || `${locale}_${s.kind}`,
      kind: s.kind,
      titleKey: s.titleKey || '',
      title: s.title || '',
      subtitleKey: s.subtitleKey || '',
      subtitle: s.subtitle || '',
      kickerKey: s.kickerKey || '',
      href: s.href || '',
      name: s.name || '',
      module: s.module || '',
      flip: !!s.flip,
      items: (s.items ?? []).map((item) => this.buildItem(locale, s, item)),
    }) as Section;
  }

  private buildItem(locale: SiteLocale, s: SeedSection, item: SeedItem): SiteItem {
    return Model.fromModel(new SiteItem(), {
      id: item.id || `${item.tag || item.kind || 'item'}_${locale}_${s.id || s.kind}`,
      kind: item.kind || 'text',
      titleKey: item.titleKey || '',
      title: item.title || '',
      description: item.description || '',
      descriptionKey: item.descriptionKey || '',
      summary: item.summary || '',
      text: item.text || '',
      code: item.code || '',
      href: item.href || '',
      src: item.src || '',
      icon: item.icon || '',
      name: item.name || '',
      lang: item.lang || '',
      tag: item.tag || '',
      alt: item.alt || '',
      children: (item.children ?? []).map((c) => this.buildItem(locale, s, c)),
    }) as SiteItem;
  }

  /**
   * @description Seeds {@link ModuleDoc} records from the modules.json asset plus the
   * per-locale tutorial items from {@link SITE_SEED}.
   * @param {SiteLocale} locale - The locale whose tutorial items enrich the records.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>} Resolves once every module record has been persisted.
   */
  async seedModules(locale: SiteLocale, ctx?: Context<AdapterFlags>): Promise<void> {
    const data: RawModuleDoc[] = await this.readRawModules();
    if (!data.length) return;
    const repo = Repository.forModel(ModuleDoc);
    const seed = SITE_SEED[locale];
    const versions = await this.getModuleVersions();
    for (const raw of data) {
      if (!MODULE_NAMES.includes(raw.name)) MODULE_NAMES.push(raw.name);
      const tutorials = (seed.tutorials[raw.name]?.items ?? []).map((tut, i) => ({
        id: `tutorial_${raw.name}_${i}`,
        kind: 'tutorial',
        title: tut.title || '',
        summary: tut.summary || '',
        code: tut.code || '',
      }));
      const moduleDoc = Model.fromModel(new ModuleDoc(), {
        name: raw.name,
        title: raw.title,
        description: raw.description,
        summary: raw.summary || '',
        base_path: raw.base_path || '',
        version: versions[raw.name] || '',
        examples: (raw.examples ?? [])
          .map((ex, i) => ex && typeof ex === 'object' ? {
            id: `example_${raw.name}_${i}`,
            kind: 'example',
            title: ex.title || '',
            code: ex.code || '',
            lang: ex.lang || '',
            summary: ex.context || '',
          } : undefined)
          .filter((e): e is SiteItemTemplate => !!e),
        tutorials,
      }) as ModuleDoc;
      await repo.delete(moduleDoc.name, ctx).catch(() => undefined);
      await repo.create(moduleDoc, ctx);
    }
  }
}

/**
 * @const DEFAULT_LOCALE
 * @description Fallback locale used when no locale resolves from url, storage or browser.
 * @type {SiteLocale}
 * @memberOf module:app/services/SiteService
 */
export const DEFAULT_LOCALE: SiteLocale = 'en_us';

/**
 * @description Seeds the site + content exactly once per locale.
 * @summary Module-level (not a static on the decorated class, whose wrapper loses statics).
 * Concurrent callers share the in-flight seeding promise per locale.
 * @function ensureSiteReady
 * @param {SiteLocale} locale - The locale to seed.
 * @param {SiteService} [service] - Service instance used for seeding (fresh one by default).
 * @returns {Promise<void>} Resolves once the locale is fully seeded.
 * @memberOf module:app/services/SiteService
 */
export function ensureSiteReady(locale: SiteLocale, service: SiteService = new SiteService()): Promise<void> {
  if (!READY_LOCALES[locale]) {
    READY_LOCALES[locale] = service.seed(locale);
  }
  return READY_LOCALES[locale];
}

/**
 * @description Type guard for {@link SiteLocale} values.
 * @function isSiteLocale
 * @param {unknown} value - The value to test against the supported locales.
 * @returns {boolean} Whether the value is a known {@link SiteLocale}.
 * @memberOf module:app/services/SiteService
 */
export function isSiteLocale(value: unknown): value is SiteLocale {
  if (!value) return false;
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SITE_SEED, value);
}

/**
 * @interface SiteItemTemplate
 * @description Shape of a seeded example {@link SiteItem} built inside {@link seedModules}.
 * @memberOf module:app/services/SiteService
 */
interface SiteItemTemplate {
  id: string;
  kind: string;
  title: string;
  code: string;
  lang: string;
  summary: string;
}

/**
 * @interface SeedPageData
 * @description Shape of a seeded page consumed by {@link buildPage}.
 * @memberOf module:app/services/SiteService
 */
interface SeedPageData {
  id: string;
  titleKey: string;
  header: SeedSection;
  sections: SeedSection[];
  footer: SeedSection;
}

/**
 * @interface RawModuleDoc
 * @description Shape of one raw entry of the bundled `assets/data/modules.json` asset.
 * @memberOf module:app/services/SiteService
 */
interface RawModuleDoc {
  name: string;
  title: string;
  description: string;
  summary?: string;
  base_path?: string;
  examples?: {
    title?: string;
    code?: string;
    lang?: string;
    context?: string;
  }[];
}
