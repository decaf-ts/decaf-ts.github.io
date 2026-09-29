import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Logging } from '@decaf-ts/logging';
import { BehaviorSubject, Observable } from 'rxjs';
import { SITE_LOCALES, SiteLocale } from '../seed/i18n-data';
import { DEFAULT_LOCALE, ensureSiteReady, isSiteLocale } from './site.service';

/**
 * @module app/services/LocaleService
 * @description Owns the active site locale for the whole app: it resolves the
 * initial locale (url `?lang=`, translate current language, `localStorage`, browser
 * languages), switches it (i18n + re-seed), and exposes the supported locales with
 * their translated display names (never raw codes).
 */

/**
 * @description One selectable locale with its translated display name.
 * @interface LocaleOption
 * @memberOf module:app/services/LocaleService
 */
export interface LocaleOption {
  /**
   * @description The locale code (`en_us`, `pt_br`, ...).
   */
  code: SiteLocale;
  /**
   * @description The translated display name (`English`, `Português (Brasil)`).
   */
  label: string;
}

/**
 * @description Resolves a translated language name through `Intl.DisplayNames`.
 * @function languageDisplayName
 * @param {string} language - The two-letter language subtag (`en`, `pt`).
 * @param {string} active - The active locale whose language translates the name.
 * @returns {string} The translated language name, or the raw subtag on failure.
 * @memberOf module:app/services/LocaleService
 */
function languageDisplayName(language: string, active: string): string {
  try {
    const display = new Intl.DisplayNames([bcp47(active)], { type: 'language' });
    return display.of(language) || language;
  } catch {
    return language;
  }
}

/**
 * @description Resolves a translated region name through `Intl.DisplayNames`.
 * @summary Returns `null` when the region subtag does not resolve (e.g. the
 * generic `en_en` variant), so the caller shows the language name alone.
 * @function regionDisplayName
 * @param {string} region - The two-letter region subtag (`US`, `BR`, `EN`).
 * @param {string} active - The active locale whose language translates the name.
 * @returns {string|null} The translated region name, or `null`.
 * @memberOf module:app/services/LocaleService
 */
function regionDisplayName(region: string, active: string): string | null {
  try {
    const display = new Intl.DisplayNames([bcp47(active)], { type: 'region' });
    const name = display.of(region.toUpperCase());
    if (!name || name.toUpperCase() === region.toUpperCase()) return null;
    return name;
  } catch {
    return null;
  }
}

/**
 * @description Normalizes a site locale code to a BCP-47 tag.
 * @function bcp47
 * @param {string} code - The site locale code (`en_us`, `pt_br`).
 * @returns {string} The BCP-47 tag (`en-US`, `pt-BR`).
 * @memberOf module:app/services/LocaleService
 */
function bcp47(code: string): string {
  return code.replace('_', '-');
}

/**
 * @description Computes the translated display name of a site locale.
 * @summary Uses `Intl.DisplayNames` with the active language so the label is
 * translated (`English`, `Português (Brasil)`) rather than a raw code. The region
 * is only appended when it resolves, so the generic `en_en` shows as `English`.
 * @function localeDisplayName
 * @param {string} code - The site locale code.
 * @param {string} active - The active locale whose language translates the label.
 * @returns {string} The translated display name.
 * @memberOf module:app/services/LocaleService
 */
export function localeDisplayName(code: string, active: string): string {
  const [language, region] = code.split('_');
  const languageName = languageDisplayName(language, active);
  if (!region) return languageName;
  const regionName = regionDisplayName(region, active);
  return regionName ? `${languageName} (${regionName})` : languageName;
}

/**
 * @description Service holding the active locale and its translated options.
 * @summary Resolves and applies the active locale once, keeps a `BehaviorSubject`
 * of the current locale so components react to switches, loads the optional
 * content-owned `assets/data/locales.json` display names (falling back to
 * `Intl.DisplayNames`), and re-seeds the site graph on every switch. All state is
 * shared through a single root instance.
 * @class
 * @example
 * const locale = inject(LocaleService);
 * await locale.initialize();
 * await locale.select('pt_br');
 */
@Injectable({ providedIn: 'root' })
export class LocaleService {
  private readonly subject = new BehaviorSubject<SiteLocale>(DEFAULT_LOCALE);
  private readonly labels = new Map<string, string>();
  private initialization?: Promise<SiteLocale>;
  private labelsLoaded = false;

  /**
   * @description Observable of the active locale, emitting on every switch.
   */
  readonly locale$: Observable<SiteLocale> = this.subject.asObservable();

  constructor(private readonly translate: TranslateService) {}

  /**
   * @description The currently active locale.
   * @returns {SiteLocale} The active locale code.
   */
  get current(): SiteLocale {
    return this.subject.value;
  }

  /**
   * @description Resolves and applies the initial locale exactly once.
   * @summary Reads the locale from `?lang=`, the translate current language,
   * `localStorage` and the browser languages (in that order), applies it through
   * the translate service and seeds the site graph. Concurrent callers share the
   * same promise so the site is only seeded once.
   * @returns {Promise<SiteLocale>} The resolved active locale.
   */
  async initialize(): Promise<SiteLocale> {
    if (!this.initialization) {
      this.initialization = this.bootstrap();
    }
    return this.initialization;
  }

  /**
   * @description Switches the active locale: persists it, applies i18n, re-seeds.
   * @param {SiteLocale} locale - The locale to activate.
   * @returns {Promise<void>} Resolves once the locale is applied and seeded.
   */
  async select(locale: SiteLocale): Promise<void> {
    if (locale === this.current) return;
    try {
      window.localStorage.setItem('site-locale', locale);
    } catch {
      // storage unavailable (private mode)
    }
    this.translate.use(locale);
    await ensureSiteReady(locale);
    await this.loadLabels();
    this.subject.next(locale);
  }

  /**
   * @description Lists the supported locales with translated display names.
   * @returns {LocaleOption[]} The selectable locale options.
   */
  options(): LocaleOption[] {
    return SITE_LOCALES.map((code) => ({ code, label: this.label(code) }));
  }

  /**
   * @description Resolves the translated display name of a locale code.
   * @summary Prefers the content-owned `locales.json` label, then the
   * `locale.names.<code>` i18n key, then a runtime `Intl.DisplayNames`
   * translation. It never returns a raw code.
   * @param {SiteLocale} code - The locale code.
   * @returns {string} The translated display name.
   */
  label(code: SiteLocale): string {
    const fromContent = this.labels.get(code);
    if (fromContent) return fromContent;
    const key = `locale.names.${code}`;
    const fromI18n = this.translate.instant(key) as string;
    if (fromI18n && fromI18n !== key) return fromI18n;
    return localeDisplayName(code, this.current);
  }

  /**
   * @description Loads the optional content-owned locale display names once.
   * @summary Fetches `assets/data/locales.json` (`{ "<code>": { en, pt } }`),
   * resolving the label for the active locale with `en` fallback. A missing or
   * malformed asset is ignored so the `Intl` fallback keeps working.
   * @returns {Promise<void>} Resolves once the labels are loaded.
   */
  async loadLabels(): Promise<void> {
    if (this.labelsLoaded) return;
    this.labelsLoaded = true;
    try {
      const response = await fetch('assets/data/locales.json');
      if (!response.ok) return;
      const data = (await response.json()) as Record<string, Record<string, string>>;
      const active = this.current.split('_')[0];
      for (const [code, names] of Object.entries(data)) {
        const label = names?.[this.current] || names?.[active] || names?.['en'];
        if (label) this.labels.set(code, label);
      }
    } catch {
      // missing/invalid labels asset — Intl fallback remains
    }
  }

  private async bootstrap(): Promise<SiteLocale> {
    const log = Logging.get();
    const resolved = this.resolve();
    this.translate.use(resolved);
    await ensureSiteReady(resolved);
    await this.loadLabels();
    this.subject.next(resolved);
    log.info(`Active locale resolved to ${resolved}`);
    return resolved;
  }

  private resolve(): SiteLocale {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get('lang');
    if (isSiteLocale(fromUrl)) return fromUrl;
    if (isSiteLocale(this.translate.currentLang)) return this.translate.currentLang as SiteLocale;
    try {
      const stored = window.localStorage.getItem('site-locale');
      if (isSiteLocale(stored)) return stored;
    } catch {
      // storage unavailable
    }
    for (const language of navigator.languages ?? []) {
      for (const candidate of SITE_LOCALES) {
        if (language.toLowerCase().startsWith(candidate.split('_')[0])) return candidate;
      }
    }
    return DEFAULT_LOCALE;
  }
}
