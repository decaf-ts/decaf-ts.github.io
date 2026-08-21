import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteItem } from '../../models/SiteItem';

/**
 * @module app/components/SiteNavComponent
 * @description Renders the site navigation bar (logo, links and an optional primary CTA)
 * inside page heroes. It only renders internal router links; external anchors use a raw
 * `href` attribute.
 */

/**
 * @description Angular component rendering the site navigation chrome.
 * @summary Displays the site logo, the navigation {@link SiteItem} links and an optional
 * primary CTA. Only items with an internal `/` route are turned into router links — any
 * other `href` is dropped so it never navigates off-page by mistake.
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
export class SiteNavComponent {
  /**
   * @description Navigation items rendered as router links in the bar.
   */
  @Input() items: SiteItem[] = [];
  /**
   * @description Optional call-to-action item rendered as the primary button.
   */
  @Input() cta: SiteItem | undefined = undefined;

  /**
   * @description Returns the `href` only when it is an internal `/` router link.
   * @param {string|undefined} href - The raw item href.
   * @returns {string|null} The url when internal (`/...`), else `null` so the link is omitted.
   */
  internalHref(href?: string): string | null {
    return href && href.startsWith('/') ? href : null;
  }
}
