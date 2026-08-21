import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';
import { ModelRendererComponent } from '@decaf-ts/for-angular';
import { WebAppPage } from '../../structure/WebAppPage';
import { SiteService, ensureSiteReady, isSiteLocale } from '../../services/site.service';
import { SiteLocale } from '../../seed/i18n-data';

/**
 * @module app/components/SitePageComponent
 * @description Single routed page host: resolves the active locale, ensures the site is
 * seeded, loads the {@link WebAppPage} matching the current route and renders it.
 */

/**
 * @description Angular component rendering whichever site page the route resolves to.
 * @summary One component hosts all routed pages (index, modules, features, tutorials,
 * examples, community). It derives the page id from the current pathname, seeds the
 * locale and renders the matching {@link WebAppPage} with a single model renderer.
 * @class
 * @example
 * // lazily routed by app.routes.ts for '', 'modules', 'features', 'tutorials', 'examples', 'community'
 */
@Component({
  selector: 'app-site-page',
  standalone: true,
  imports: [ModelRendererComponent],
  templateUrl: './site-page.component.html',
  styleUrl: './site-page.component.scss',
})
export class SitePageComponent implements OnInit {
  /**
   * @description The loaded {@link WebAppPage} rendered by this component.
   */
  page?: WebAppPage;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private siteService: SiteService,
    private translateService: TranslateService,
    private router: Router
  ) {}

  /**
   * @description Angular lifecycle hook: subscribes to language changes, then loads the page.
   * @returns {Promise<void>} Resolves once the page model is loaded.
   */
  async ngOnInit(): Promise<void> {
    this.translateService.onLangChange
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.ensurePage());
    await this.ensurePage();
  }

  /**
   * @description Loads the routed page model for the active locale.
   * @returns {Promise<void>}
   */
  private async ensurePage(): Promise<void> {
    const locale = this.resolveLocale();
    await ensureSiteReady(locale);
    this.page = await this.siteService.getPage(locale, this.pageId());
  }

  /**
   * @description Page identifier derived from the current route pathname.
   * @returns {string} The page id (empty path resolves to `index`).
   */
  pageId(): string {
    const path = this.router.url.split('?')[0].replace(/^\/+/, '');
    return path || 'index';
  }

  /**
   * @description Resolves the page locale from `?lang=` or the translate current language.
   * @returns {SiteLocale} The resolved locale (`en_us` fallback).
   */
  private resolveLocale(): SiteLocale {
    const url = new URL(window.location.href);
    const fromUrl = url.searchParams.get('lang');
    if (isSiteLocale(fromUrl)) return fromUrl as SiteLocale;
    if (isSiteLocale(this.translateService.currentLang)) {
      return this.translateService.currentLang as SiteLocale;
    }
    return 'en_us';
  }
}
