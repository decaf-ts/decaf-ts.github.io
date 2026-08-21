import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { WebApp } from '../../structure/WebApp';
import { SiteService, ensureSiteReady, isSiteLocale, DEFAULT_LOCALE } from '../../services/site.service';
import { SITE_LOCALES, SiteLocale } from '../../seed/i18n-data';

/**
 * @module app/components/WebAppLayoutComponent
 * @description Root layout: hosts the routed page outlet plus the fixed language-switch
 * button. The navigation lives inside each page hero (same gradient), so the layout no
 * longer renders its own nav chrome.
 */

/**
 * @description Root layout component hosting the routed page outlet and locale selector.
 * @summary On init the component resolves the active locale (url `?lang=`, the translate
 * service current language, `localStorage`, or the browser languages) and ensures the site
 * is seeded. A fixed language-switch button opens the available locales and reloads the
 * page graph with the selected i18n language. Navigation is rendered inside each page hero.
 * @class
 * @example
 * <app-web-app-layout>...</app-web-app-layout>
 */
@Component({
  selector: 'app-web-app-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './web-app-layout.component.html',
  styleUrl: './web-app-layout.component.scss',
})
export class WebAppLayoutComponent implements OnInit {
  /**
   * @description The seeded {@link WebApp} site model for the active locale.
   */
  site?: WebApp;
  /**
   * @description Currently active locale.
   */
  currentLocale: SiteLocale = DEFAULT_LOCALE;
  /**
   * @description The supported site locales.
   */
  locales: ReadonlyArray<SiteLocale> = SITE_LOCALES;
  /**
   * @description Whether the locale dropdown is open.
   */
  open = false;

  constructor(
    protected siteService: SiteService,
    protected translateService: TranslateService,
    private router: Router
  ) {}

  /**
   * @description Angular lifecycle hook: resolves and applies the active locale, then reloads.
   * @returns {Promise<void>}
   */
  async ngOnInit(): Promise<void> {
    const resolved = this.resolveLocale();
    this.currentLocale = resolved;
    this.translateService.use(resolved);
    await this.reload();
  }

  /**
   * @description Ensures the active locale is seeded and refreshes the site model.
   * @returns {Promise<void>}
   */
  async reload(): Promise<void> {
    await ensureSiteReady(this.currentLocale);
    this.site = await this.siteService.getSite(this.currentLocale);
  }

  /**
   * @description Toggles the language dropdown.
   * @returns {void}
   */
  toggleLocale(): void {
    this.open = !this.open;
  }

  /**
   * @description Applies the selected locale: switches i18n and re-seeds the site graph.
   * @param {SiteLocale} locale - The locale to activate.
   * @returns {Promise<void>}
   */
  async selectLocale(locale: SiteLocale): Promise<void> {
    if (locale === this.currentLocale) {
      this.open = false;
      return;
    }
    this.open = false;
    try {
      window.localStorage.setItem('site-locale', locale);
    } catch {
      // storage unavailable (e.g. private mode)
    }
    this.currentLocale = locale;
    this.translateService.use(locale);
    await ensureSiteReady(locale);
    this.site = await this.siteService.getSite(locale);
    this.router.navigate([], { queryParams: { lang: locale }, queryParamsHandling: 'merge' });
  }

  /**
   * @description Checks whether the code is a supported locale.
   * @param {string} value - The candidate locale code.
   * @returns {boolean} Whether the value is a known site locale.
   */
  isSiteLocale(value: string): value is SiteLocale {
    return isSiteLocale(value);
  }

  /**
   * @description Resolves the active locale in order: `?lang=` url, translate current
   * language, `localStorage` `site-locale`, then the browser navigator languages.
   * @returns {SiteLocale} The resolved locale, defaulting to {@link DEFAULT_LOCALE}.
   */
  private resolveLocale(): SiteLocale {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get('lang');
    if (isSiteLocale(fromUrl)) return fromUrl;
    if (isSiteLocale(this.translateService.currentLang)) return this.translateService.currentLang as SiteLocale;
    const stored = window.localStorage.getItem('site-locale');
    if (isSiteLocale(stored)) return stored;
    for (const l of navigator.languages) {
      for (const candidate of SITE_LOCALES) {
        if (l.toLowerCase().startsWith(candidate.split('_')[0])) return candidate;
      }
    }
    return DEFAULT_LOCALE;
  }
}
