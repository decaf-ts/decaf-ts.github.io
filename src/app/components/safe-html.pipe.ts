import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

/**
 * @module app/components/SafeHtmlPipe
 * @description Trusts raw HTML strings (inline SVGs from seed data) for `[innerHTML]`.
 */

/**
 * @description Angular pipe that marks raw HTML strings as trusted for `[innerHTML]`.
 * @summary Bypasses Angular's sanitizer using `DomSanitizer.bypassSecurityTrustHtml` so
 * the inline SVG markup carried by the seeded {@link SiteItem.icon} and section visuals can
 * be rendered. Intended only for seed data, never for user-controlled input.
 * @class
 * @example
 * <span [innerHTML]="item.icon | safeHtml"></span>
 */
@Pipe({
  name: 'safeHtml',
  standalone: true,
})
export class SafeHtmlPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * @description Converts a raw HTML string into trusted HTML for interpolation.
   * @param {string|undefined|null} value - The raw HTML to trust (empty string when missing).
   * @returns {SafeHtml} The sanitizer-trusted HTML wrapper.
   */
  transform(value: string | undefined | null): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(value || '');
  }
}
