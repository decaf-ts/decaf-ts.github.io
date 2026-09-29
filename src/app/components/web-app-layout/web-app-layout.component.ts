import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { LocaleService } from '../../services/locale.service';

/**
 * @module app/components/WebAppLayoutComponent
 * @description Root layout: hosts the routed page outlet. The navigation chrome
 * (including the language selector, side-by-side with the Get Started button)
 * lives inside each page hero; this component only owns locale bootstrapping and
 * mirrors the active locale into the url query string.
 */

/**
 * @description Root layout component hosting the routed page outlet.
 * @summary On init it delegates locale resolution and seeding to the shared
 * {@link LocaleService} (url `?lang=`, translate language, `localStorage`, or
 * browser languages). It then keeps the `?lang=` query parameter in sync with the
 * active locale so a refresh or a shared link restores the chosen language.
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
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly localeService: LocaleService,
    private readonly router: Router
  ) {}

  /**
   * @description Angular lifecycle hook: resolves the locale, then mirrors it in the url.
   * @returns {Promise<void>}
   */
  async ngOnInit(): Promise<void> {
    const locale = await this.localeService.initialize();
    this.localeService.locale$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((active) => this.syncQueryParam(active));
    this.syncQueryParam(locale);
  }

  private syncQueryParam(locale: string): void {
    const current = this.router.parseUrl(this.router.url).queryParamMap.get('lang');
    if (current === locale) return;
    this.router.navigate([], { queryParams: { lang: locale }, queryParamsHandling: 'merge' });
  }
}
