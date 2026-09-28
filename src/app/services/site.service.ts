import { Logging } from '@decaf-ts/logging';
import { Context, Repository, service, Service } from '@decaf-ts/core';
import type { AdapterFlags } from '@decaf-ts/core';
import { InternalError } from '@decaf-ts/db-decorators';
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
 * @description Localized value as authored by the content team: either a plain
 * string (legacy single-locale content) or a map of locale code to string
 * (e.g. `{ en: '...', pt: '...' }`).
 * @typedef {string | Record<string, string> | null | undefined} LocalizedValue
 * @memberOf module:app/services/SiteService
 */
export type LocalizedValue = string | Record<string, string> | null | undefined;

/**
 * @description Raw `links` object of one `assets/data/modules.json` entry.
 * @interface RawModuleLinks
 * @memberOf module:app/services/SiteService
 */
export interface RawModuleLinks {
  repo?: string;
  docs?: string;
  githubPages?: string;
  storyboard?: string;
}

/**
 * @description Raw feature entry of one `assets/data/modules.json` module.
 * @interface RawModuleFeature
 * @memberOf module:app/services/SiteService
 */
export interface RawModuleFeature {
  title?: LocalizedValue;
  description?: LocalizedValue;
}

/**
 * @description Raw example entry of one `assets/data/modules.json` module.
 * @interface RawModuleExample
 * @memberOf module:app/services/SiteService
 */
export interface RawModuleExample {
  title?: LocalizedValue;
  context?: LocalizedValue;
  code?: string;
  lang?: string;
}

/**
 * @description Raw tutorial entry of one `assets/data/modules.json` module.
 * @interface RawModuleTutorial
 * @memberOf module:app/services/SiteService
 */
export interface RawModuleTutorial {
  title?: LocalizedValue;
  summary?: LocalizedValue;
  code?: string;
}

/**
 * @description One entry of the bundled `assets/data/modules.json` (or the
 * auto-generated `assets/data/modules.auto.json`) asset. Text fields accept the
 * localized `{ en, pt }` shape with `en` fallback; a plain string is also accepted
 * for backwards compatibility with the first single-locale attempt.
 * @interface RawModuleDoc
 * @memberOf module:app/services/SiteService
 */
export interface RawModuleDoc {
  name: string;
  title?: LocalizedValue;
  description?: LocalizedValue;
  summary?: LocalizedValue;
  base_path?: string;
  links?: RawModuleLinks;
  features?: RawModuleFeature[];
  examples?: RawModuleExample[];
  tutorials?: RawModuleTutorial[];
}

/**
 * @description Locale resolution order used to pick a localized string from the
 * `{ en, pt }` content shape: exact locale, sibling variant, base language, then
 * the `en` fallback.
 * @const LOCALE_FALLBACKS
 * @type {Record<string, string[]>}
 * @memberOf module:app/services/SiteService
 */
const LOCALE_FALLBACKS: Record<string, string[]> = {
  en_en: ['en_en', 'en_us', 'en'],
  en_us: ['en_us', 'en_en', 'en'],
  pt_br: ['pt_br', 'pt_pt', 'pt'],
  pt_pt: ['pt_pt', 'pt_br', 'pt'],
};

/**
 * @description Module-scoped id registry of the records written by the last seed,
 * per model name. Re-seeding deletes these before writing the new locale's content,
 * so switching locale replaces the tables instead of accumulating stale rows.
 * @type {Record<string, string[]>}
 * @memberOf module:app/services/SiteService
 */
const SEEDED_IDS: Record<string, string[]> = {};

/**
 * @const MODULE_NAMES
 * @description Names of the seeded {@link ModuleDoc} records, remembered so
 * `getModules()` can read them all back from the RamAdapter.
 * @type {string[]}
 * @memberOf module:app/services/SiteService
 */
const MODULE_NAMES: string[] = [];

/**
 * @const MODULE_VERSIONS
 * @description Resolved `@decaf-ts/*` versions from the build-time versions asset,
 * loaded lazily so module components can display the installed package version.
 * @type {Record<string, string>}
 * @memberOf module:app/services/SiteService
 */
let MODULE_VERSIONS: Record<string, string> = {};

/**
 * @description Locale the content tables are currently seeded for, so
 * {@link ensureSiteReady} can re-seed when the active locale changes.
 * @type {SiteLocale|null}
 * @memberOf module:app/services/SiteService
 */
let ACTIVE_LOCALE: SiteLocale | null = null;

/**
 * @description In-flight seeding promise, deduping concurrent callers.
 * @type {Promise<void>|null}
 * @memberOf module:app/services/SiteService
 */
let SEEDING: Promise<void> | null = null;

/**
 * @description Locale the in-flight seeding promise is writing, so concurrent
 * callers for the same locale share it and a different locale waits for it.
 * @type {SiteLocale|null}
 * @memberOf module:app/services/SiteService
 */
let SEEDING_LOCALE: SiteLocale | null = null;

/**
 * @description Resolves a {@link LocalizedValue} for a locale with `en` fallback.
 * @summary Plain strings are returned unchanged (legacy single-locale content). For
 * the localized `{ en, pt }` shape it tries the exact locale (`pt_br`), then the
 * sibling variant (`pt_pt`), then the base language (`pt`), then `en`, and finally
 * any non-empty string value so a missing translation never blanks a page.
 * @function localize
 * @param {LocalizedValue} value - The authored value.
 * @param {string} locale - The active locale code.
 * @returns {string} The resolved string, or `''` when nothing matches.
 * @memberOf module:app/services/SiteService
 */
export function localize(value: LocalizedValue, locale: string): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  const candidates = LOCALE_FALLBACKS[locale] ?? [locale, 'en'];
  for (const key of candidates) {
    const candidate = value[key];
    if (typeof candidate === 'string' && candidate) return candidate;
  }
  for (const candidate of Object.values(value)) {
    if (typeof candidate === 'string' && candidate) return candidate;
  }
  return '';
}

/**
 * @module app/services/SiteService
 * @description Seeds and serves the {@link WebApp} site graph from the RamAdapter.
 * @summary Module exposing the {@link SiteService} class and the {@link ensureSiteReady}
 * seeding helper. The service populates the in-memory adapter once per locale with the
 * {@link WebApp} site graph (built from {@link app/seed/site.seed}), the {@link ModuleDoc}
 * records (read from the bundled `assets/data/modules.json` + auto-generated
 * `assets/data/modules.auto.json` assets, localized with `en` fallback) and the iterable
 * content tables (`ModuleFeature`, `HomeCard`, `Faq`, `Brand`, `Tutorial`, `Example`)
 * so decaf list components can render them from the adapter.
 */

/**
 * @description Service producing and reading the site content from the RamAdapter.
 * @summary `SiteService` seeds the {@link WebApp} graph, the {@link ModuleDoc}
 * documentation records and the iterable content tables for each locale into the decaf
 * RamAdapter and exposes {@link getSite}, {@link getPage}, {@link getModule} and
 * {@link getModules} accessors. Because {@link ensureSiteReady} re-seeds whenever the
 * active locale changes, the previous locale's rows are deleted first, so a locale switch
 * replaces the tables instead of accumulating stale content.
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
    try {
      await this.seedSite(locale, ctx as Context<AdapterFlags>);
      await this.seedModules(locale, ctx as Context<AdapterFlags>);
      await this.seedContent(locale, ctx as Context<AdapterFlags>);
      log.info(`Seeding complete for locale ${locale}`);
    } catch (e: unknown) {
      log.error(`Seeding failed for locale ${locale}: ${(e as Error).message}`);
      throw new InternalError(e as Error);
    }
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
              tag: 'nav-cta',
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
   * {@link Faq}, {@link Tutorial}, {@link Example} and {@link ModuleFeature} tables. The
   * iterable content is resolved for the active locale from the modules asset (localized with
   * `en` fallback) and the locale {@link SITE_SEED}. The previous locale's rows are deleted
   * first, so a locale switch replaces the tables.
   * @param {SiteLocale} locale - The locale whose content tables are written.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>} Resolves once the tables are (re)populated.
   * @private
   */
  private async seedContent(locale: SiteLocale, ctx?: Context<AdapterFlags>): Promise<void> {
    const seed = SITE_SEED[locale];
    const modules = await this.readRawModules();

    await this.seedBrands(seed, locale, ctx);
    await this.seedCards(seed, locale, ctx);
    await this.seedFaq(seed, locale, ctx);
    await this.seedExamples(locale, modules, ctx);
    await this.seedTutorials(locale, seed, modules, ctx);
    await this.seedFeatures(locale, seed, modules, ctx);
  }

  /**
   * @description Seeds the {@link Brand} logo cloud for a locale.
   * @param {typeof SITE_SEED[SiteLocale]} seed - The locale seed.
   * @param {SiteLocale} locale - The locale whose ids prefix the records.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>}
   * @private
   */
  private async seedBrands(
    seed: (typeof SITE_SEED)[SiteLocale],
    locale: SiteLocale,
    ctx?: Context<AdapterFlags>
  ): Promise<void> {
    const repo = Repository.forModel(Brand);
    await this.clearPrevious(Brand.name, repo, ctx);
    const ids: string[] = [];
    for (const [idx, b] of (seed.brands ?? []).entries()) {
      const id = `${locale}_${b.name}`;
      if (ids.includes(id)) continue;
      const brand = Model.fromModel(new Brand(), {
        id,
        name: b.name,
        src: b.src,
        alt: b.name,
        order: idx,
      }) as Brand;
      await repo.create(brand, ctx);
      ids.push(id);
    }
    SEEDED_IDS[Brand.name] = ids;
  }

  /**
   * @description Seeds the {@link HomeCard} marketing grid for a locale.
   * @param {typeof SITE_SEED[SiteLocale]} seed - The locale seed.
   * @param {SiteLocale} locale - The locale whose ids prefix the records.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>}
   * @private
   */
  private async seedCards(
    seed: (typeof SITE_SEED)[SiteLocale],
    locale: SiteLocale,
    ctx?: Context<AdapterFlags>
  ): Promise<void> {
    const repo = Repository.forModel(HomeCard);
    await this.clearPrevious(HomeCard.name, repo, ctx);
    const ids: string[] = [];
    for (const [idx, c] of (seed.cards ?? []).entries()) {
      const id = `${locale}_${slug(c.title || 'card')}`;
      if (ids.includes(id)) continue;
      const card = Model.fromModel(new HomeCard(), {
        id,
        title: c.title || '',
        description: c.description || '',
        icon: c.icon || '',
        order: idx,
      }) as HomeCard;
      await repo.create(card, ctx);
      ids.push(id);
    }
    SEEDED_IDS[HomeCard.name] = ids;
  }

  /**
   * @description Seeds the {@link Faq} table for a locale.
   * @param {typeof SITE_SEED[SiteLocale]} seed - The locale seed.
   * @param {SiteLocale} locale - The locale whose ids prefix the records.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>}
   * @private
   */
  private async seedFaq(
    seed: (typeof SITE_SEED)[SiteLocale],
    locale: SiteLocale,
    ctx?: Context<AdapterFlags>
  ): Promise<void> {
    const repo = Repository.forModel(Faq);
    await this.clearPrevious(Faq.name, repo, ctx);
    const ids: string[] = [];
    for (const [idx, f] of (seed.faq ?? []).entries()) {
      const id = `${locale}_${slug(f.title || 'faq').slice(0, 40)}`;
      if (ids.includes(id)) continue;
      const faq = Model.fromModel(new Faq(), {
        id,
        title: f.title || '',
        description: f.body || '',
        order: idx,
      }) as Faq;
      await repo.create(faq, ctx);
      ids.push(id);
    }
    SEEDED_IDS[Faq.name] = ids;
  }

  /**
   * @description Seeds the {@link Example} table for a locale from the modules asset.
   * @param {SiteLocale} locale - The active locale used to resolve localized text.
   * @param {RawModuleDoc[]} modules - The merged raw module records.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>}
   * @private
   */
  private async seedExamples(
    locale: SiteLocale,
    modules: RawModuleDoc[],
    ctx?: Context<AdapterFlags>
  ): Promise<void> {
    const repo = Repository.forModel(Example);
    await this.clearPrevious(Example.name, repo, ctx);
    const ids: string[] = [];
    for (const raw of modules) {
      for (const [i, ex] of (raw.examples ?? []).entries()) {
        const title = localize(ex.title, locale);
        const id = `example_${raw.name}_${slug(title || `example_${i}`)}`;
        if (ids.includes(id)) continue;
        const example = Model.fromModel(new Example(), {
          id,
          module: raw.name,
          title,
          summary: localize(ex.context, locale),
          code: ex.code || '',
          lang: ex.lang || 'typescript',
        }) as Example;
        await repo.create(example, ctx);
        ids.push(id);
      }
    }
    SEEDED_IDS[Example.name] = ids;
  }

  /**
   * @description Seeds the {@link Tutorial} table for a locale.
   * @summary Prefers the localized `tutorials[]` of the modules asset and falls back to
   * the per-module {@link SITE_SEED} tutorials when the asset has none.
   * @param {SiteLocale} locale - The active locale used to resolve localized text.
   * @param {(typeof SITE_SEED)[SiteLocale]} seed - The locale seed.
   * @param {RawModuleDoc[]} modules - The merged raw module records.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>}
   * @private
   */
  private async seedTutorials(
    locale: SiteLocale,
    seed: (typeof SITE_SEED)[SiteLocale],
    modules: RawModuleDoc[],
    ctx?: Context<AdapterFlags>
  ): Promise<void> {
    const repo = Repository.forModel(Tutorial);
    await this.clearPrevious(Tutorial.name, repo, ctx);
    const ids: string[] = [];
    for (const raw of modules) {
      const authored = (raw.tutorials ?? []).map((t, i) => ({
        id: `tutorial_${raw.name}_${i}`,
        module: raw.name,
        title: localize(t.title, locale),
        summary: localize(t.summary, locale),
        code: t.code || '',
      }));
      const fallback = (seed.tutorials?.[raw.name]?.items ?? []).map((t, i) => ({
        id: `tutorial_${raw.name}_${i}`,
        module: raw.name,
        title: t.title || '',
        summary: t.summary || '',
        code: t.code || '',
      }));
      const rows = authored.length
        ? authored.map((row, i) => ({
            ...row,
            summary: row.summary || fallback[i]?.summary || '',
            code: row.code || fallback[i]?.code || '',
          }))
        : fallback;
      for (const row of rows) {
        if (ids.includes(row.id)) continue;
        const tutorial = Model.fromModel(new Tutorial(), row) as Tutorial;
        await repo.create(tutorial, ctx);
        ids.push(row.id);
      }
    }
    SEEDED_IDS[Tutorial.name] = ids;
  }

  /**
   * @description Seeds the {@link ModuleFeature} table for a locale.
   * @summary Prefers the localized `features[]` of the modules asset and falls back to
   * the per-module {@link SITE_SEED} feature groups, then to a description excerpt.
   * @param {SiteLocale} locale - The active locale used to resolve localized text.
   * @param {(typeof SITE_SEED)[SiteLocale]} seed - The locale seed.
   * @param {RawModuleDoc[]} modules - The merged raw module records.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>}
   * @private
   */
  private async seedFeatures(
    locale: SiteLocale,
    seed: (typeof SITE_SEED)[SiteLocale],
    modules: RawModuleDoc[],
    ctx?: Context<AdapterFlags>
  ): Promise<void> {
    const repo = Repository.forModel(ModuleFeature);
    await this.clearPrevious(ModuleFeature.name, repo, ctx);
    const ids: string[] = [];
    for (const raw of modules) {
      const authored = (raw.features ?? [])
        .map((f) => ({
          title: localize(f.title, locale),
          description: localize(f.description, locale),
        }))
        .filter((f) => !!f.title);
      const seeded = (seed.featureModules?.[raw.name]?.features ?? []).map((f) => ({
        title: f.title || '',
        description: f.description || '',
      }));
      let features = authored.length ? authored : seeded;
      if (!features.length) {
        const excerpt = localize(raw.description, locale).split(/(?:\.|\n)/)[0].slice(0, 160);
        if (excerpt) features = [{ title: localize(raw.title, locale) || raw.name, description: excerpt }];
      }
      for (const feat of features) {
        const id = `feature_${raw.name}_${slug(feat.title || 'item').slice(0, 40)}`;
        if (ids.includes(id)) continue;
        const feature = Model.fromModel(new ModuleFeature(), {
          id,
          module: raw.name,
          title: feat.title,
          description: feat.description,
        }) as ModuleFeature;
        await repo.create(feature, ctx);
        ids.push(id);
      }
    }
    SEEDED_IDS[ModuleFeature.name] = ids;
  }

  /**
   * @description Deletes the records written by the previous seed of a model.
   * @summary Uses the module-scoped {@link SEEDED_IDS} registry so a locale switch (or a
   * re-seed) replaces the table instead of accumulating stale locale rows. Missing records
   * are ignored because the first seed has no previous ids.
   * @param {string} modelName - The model name the ids belong to.
   * @param {Repository<Model>} repo - The model repository.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>}
   * @private
   */
  private async clearPrevious<M extends Model<boolean>>(
    modelName: string,
    repo: Repository<M, any>,
    ctx?: Context<AdapterFlags>
  ): Promise<void> {
    const ids = SEEDED_IDS[modelName] ?? [];
    for (const id of ids) {
      try {
        await repo.delete(id, ctx);
      } catch {
        // record already absent (first seed, or a concurrent locale switch)
      }
    }
    SEEDED_IDS[modelName] = [];
  }

  /**
   * @description Reads and merges the bundled modules assets.
   * @summary Fetches `assets/data/modules.json` (authored by the content team) and the
   * build-time `assets/data/modules.auto.json` generated by `scripts/collect-data.cjs`
   * for installed modules missing from the authored asset. Authored entries win; the
   * auto-generated stubs fill the gaps so a newly installed module shows up without a
   * component change.
   * @returns {Promise<RawModuleDoc[]>} The merged raw module records.
   * @private
   */
  private async readRawModules(): Promise<RawModuleDoc[]> {
    const authored = await this.readModuleAsset('assets/data/modules.json');
    const auto = await this.readModuleAsset('assets/data/modules.auto.json');
    if (!auto.length) return authored;
    const names = new Set(authored.map((m) => m.name));
    return [...authored, ...auto.filter((m) => !names.has(m.name))];
  }

  /**
   * @description Reads one module asset as a raw module array.
   * @param {string} url - The asset url to fetch.
   * @returns {Promise<RawModuleDoc[]>} The parsed entries (empty on failure).
   * @private
   */
  private async readModuleAsset(url: string): Promise<RawModuleDoc[]> {
    try {
      const response = await fetch(url);
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
   * @description Seeds {@link ModuleDoc} records from the merged modules assets.
   * @summary Resolves each module's title, description, summary and links for the active
   * locale (with `en` fallback), enriches it with the resolved package version and the
   * localized example/tutorial {@link SiteItem} templates, and replaces the previous seed's
   * records so a locale switch serves localized module content.
   * @param {SiteLocale} locale - The locale whose localized module content is seeded.
   * @param {Context<AdapterFlags>} [ctx] - Optional execution context.
   * @returns {Promise<void>} Resolves once every module record has been persisted.
   */
  async seedModules(locale: SiteLocale, ctx?: Context<AdapterFlags>): Promise<void> {
    const data: RawModuleDoc[] = await this.readRawModules();
    if (!data.length) return;
    const repo = Repository.forModel(ModuleDoc);
    const seed = SITE_SEED[locale];
    const versions = await this.getModuleVersions();
    await this.clearPrevious(ModuleDoc.name, repo, ctx);
    const ids: string[] = [];
    for (const raw of data) {
      if (ids.includes(raw.name)) continue;
      if (!MODULE_NAMES.includes(raw.name)) MODULE_NAMES.push(raw.name);
      const tutorials = (raw.tutorials ?? []).map((tut, i) => ({
        id: `tutorial_${raw.name}_${i}`,
        kind: 'tutorial',
        title: localize(tut.title, locale),
        summary: localize(tut.summary, locale),
        code: tut.code || '',
      }));
      const fallbackTutorials = (seed.tutorials?.[raw.name]?.items ?? []).map((tut, i) => ({
        id: `tutorial_${raw.name}_${i}`,
        kind: 'tutorial',
        title: tut.title || '',
        summary: tut.summary || '',
        code: tut.code || '',
      }));
      const moduleDoc = Model.fromModel(new ModuleDoc(), {
        name: raw.name,
        title: localize(raw.title, locale) || raw.name,
        description: localize(raw.description, locale),
        summary: localize(raw.summary, locale),
        base_path: raw.base_path || raw.links?.repo || '',
        repo: raw.links?.repo || raw.base_path || '',
        docs: raw.links?.docs || '',
        githubPages: raw.links?.githubPages || '',
        storyboard: raw.links?.storyboard || '',
        locale,
        version: versions[raw.name] || '',
        examples: (raw.examples ?? []).map((ex, i) => ({
          id: `example_${raw.name}_${i}`,
          kind: 'example',
          title: localize(ex.title, locale),
          code: ex.code || '',
          lang: ex.lang || '',
          summary: localize(ex.context, locale),
        })) as SiteItem[],
        tutorials: (tutorials.length
          ? tutorials.map((row, i) => ({
              ...row,
              summary: row.summary || fallbackTutorials[i]?.summary || '',
              code: row.code || fallbackTutorials[i]?.code || '',
            }))
          : fallbackTutorials) as SiteItem[],
      }) as ModuleDoc;
      await repo.create(moduleDoc, ctx);
      ids.push(moduleDoc.name);
    }
    SEEDED_IDS[ModuleDoc.name] = ids;
  }
}

/**
 * @description Builds a stable slug from free text for locale-independent record ids.
 * @summary Lowercases the source and collapses every run of non-alphanumeric
 * characters into a single underscore, preserving leading/trailing separators.
 * @function slug
 * @param {string} value - The source text.
 * @returns {string} The normalized slug.
 * @memberOf module:app/services/SiteService
 */
function slug(value: string): string {
  return (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '_');
}

/**
 * @const DEFAULT_LOCALE
 * @description Fallback locale used when no locale resolves from url, storage or browser.
 * @type {SiteLocale}
 * @memberOf module:app/services/SiteService
 */
export const DEFAULT_LOCALE: SiteLocale = 'en_us';

/**
 * @description Seeds the site + content for a locale, re-seeding when it changes.
 * @summary Module-level (not a static on the decorated class, whose wrapper loses
 * statics). Concurrent callers for the same locale share the in-flight seeding promise;
 * a different locale (or a re-seed after a locale switch) replaces the content tables.
 * @function ensureSiteReady
 * @param {SiteLocale} locale - The locale to seed.
 * @param {SiteService} [service] - Service instance used for seeding (fresh one by default).
 * @returns {Promise<void>} Resolves once the locale is fully seeded.
 * @memberOf module:app/services/SiteService
 */
export async function ensureSiteReady(locale: SiteLocale, service: SiteService = new SiteService()): Promise<void> {
  if (SEEDING && SEEDING_LOCALE === locale) return SEEDING;
  if (!SEEDING && ACTIVE_LOCALE === locale) return;
  if (SEEDING) {
    await SEEDING;
    if (SEEDING && SEEDING_LOCALE === locale) return SEEDING;
    if (ACTIVE_LOCALE === locale) return;
  }
  const pending = service.seed(locale);
  SEEDING = pending;
  SEEDING_LOCALE = locale;
  try {
    await pending;
    ACTIVE_LOCALE = locale;
  } finally {
    if (SEEDING === pending) {
      SEEDING = null;
      SEEDING_LOCALE = null;
    }
  }
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
