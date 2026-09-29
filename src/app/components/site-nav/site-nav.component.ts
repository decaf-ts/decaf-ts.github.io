import { Component, Input, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteItem } from '../../models/SiteItem';
import { SiteLocale } from '../../seed/i18n-data';
import { LocaleOption, LocaleService } from '../../services/locale.service';

/**
 * @module app/components/SiteNavComponent
 * @description Renders the site navigation bar (logo, links, the language
 * selector and an optional primary CTA) inside page heroes. It only renders
 * internal router links; external anchors use a raw `href` attribute. The logo
 * always navigates home and the language selector sits side-by-side with the Get
 * Started button.
 */

/**
 * @description Angular component rendering the site navigation chrome.
 * @summary Displays the site logo (a link to the home page), the navigation
 * {@link SiteItem} links, the language selector (with translated display names)
 * and an optional primary CTA. Only items with an internal `/` route are turned
 * into router links — any other `href` is dropped so it never navigates off-page
 * by mistake.
 * @class
 * @example
 * <app-site-nav [items]="navItems()" [cta]="cta()"></app-site-nav>
 */
@Component({
  selector: 'app-site-nav',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './site-nav.component.html',
  styleUrl: './site-nav.component.scss',
})
export class SiteNavComponent implements OnInit {
  /**
   * @description Navigation items rendered as router links in the bar.
   */
  @Input() items: SiteItem[] = [];
  /**
   * @description Optional call-to-action item rendered as the primary button.
   */
  @Input() cta: SiteItem | undefined = undefined;

  /**
   * @description Whether the language dropdown is open.
   */
  open = false;
  /**
   * @description The active locale code.
   */
  current: SiteLocale = 'en_us';
  /**
   * @description The selectable locales with translated display names.
   */
  options: LocaleOption[] = [];

  constructor(private readonly localeService: LocaleService) {}

  /**
   * @description Angular lifecycle hook: subscribes to the active locale.
   * @returns {void}
   */
  ngOnInit(): void {
    this.current = this.localeService.current;
    this.options = this.localeService.options();
    this.localeService.locale$.subscribe((locale) => {
      this.current = locale;
      this.options = this.localeService.options();
    });
  }

  /**
   * @description Returns the `href` only when it is an internal `/` router link.
   * @param {string|undefined} href - The raw item href.
   * @returns {string|null} The url when internal (`/...`), else `null` so the link is omitted.
   */
  internalHref(href?: string): string | null {
    return href && href.startsWith('/') ? href : null;
  }

  /**
   * @description Toggles the language dropdown.
   * @returns {void}
   */
  toggleLocale(): void {
    this.open = !this.open;
  }

  /**
   * @description Switches to the selected locale (i18n + re-seed + url).
   * @param {SiteLocale} locale - The locale to activate.
   * @returns {Promise<void>}
   */
  async selectLocale(locale: SiteLocale): Promise<void> {
    this.open = false;
    await this.localeService.select(locale);
    this.options = this.localeService.options();
  }

  /**
   * @description The translated display name of the active locale.
   * @returns {string} The active locale label (`English`, `Português`).
   */
  currentLabel(): string {
    return this.localeService.label(this.current);
  }
}
