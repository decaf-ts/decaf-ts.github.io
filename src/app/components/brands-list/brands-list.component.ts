import { Component } from '@angular/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { Brand } from '../../models/Brand';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/BrandsListComponent
 * @description Renders the homepage logo cloud from the `Brand` RamAdapter table with a
 * CSS-only marquee (no DOM mutation at runtime).
 */

/**
 * @description Angular component rendering the brand logo marquee.
 * @summary Extends {@link ModuleListBase} so the logos load from the `Brand` table via the
 * list set query. Logos are inline SVG icons (no external network assets); brands without
 * an icon render a monogram badge so the row never shows a broken image. The marquee
 * scrolling is achieved purely through CSS keyframes on a duplicated track — no directive
 * mutates the DOM.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-brands-list [modelName]="'Brand'"></app-brands-list>
 */
@Component({
  selector: 'app-brands-list',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './brands-list.component.html',
  styleUrl: './brands-list.component.scss',
})
export class BrandsListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'Brand';

  /**
   * @description The brand model of a mapped list row.
   * @param {KeyValue} item - The mapped list row.
   * @returns {Brand} The underlying model.
   */
  brand(item: KeyValue): Brand {
    return item['model'] as Brand;
  }

  /**
   * @description Cycles the mapped logos into a full marquee page row.
   * @summary The page always shows a full row (five desktop slots) so the seamless
   * CSS scroll never reveals blank space; when fewer unique brands exist they are
   * repeated to fill the row.
   * @returns {KeyValue[]} The five grid rows (indices 0..4 of the table, cycled).
   */
  pageItems(): KeyValue[] {
    const items = this.items || [];
    if (!items.length) return [];
    const sorted = [...items].sort((a, b) => {
      const ao = ((a['model'] && a['model']['order']) ?? a['order'] ?? 0) as number;
      const bo = ((b['model'] && b['model']['order']) ?? b['order'] ?? 0) as number;
      return (ao as number) - (bo as number);
    });
    const slots = Math.max(5, Math.ceil(sorted.length / 5) * 5);
    return Array.from({ length: slots }, (_, i) => sorted[i % sorted.length]);
  }

  /**
   * @description The inline SVG icon of a brand, when authored.
   * @param {Brand} brand - The brand record.
   * @returns {string} The inline SVG markup, else `''`.
   */
  icon(brand: Brand): string {
    return brand.icon || '';
  }

  /**
   * @description Whether the brand has an inline SVG icon to render.
   * @param {Brand} brand - The brand record.
   * @returns {boolean} `true` when an inline icon exists.
   */
  hasIcon(brand: Brand): boolean {
    return !!brand.icon;
  }

  /**
   * @description The monogram fallback of a brand (up to two initials).
   * @param {Brand} brand - The brand record.
   * @returns {string} The brand initials.
   */
  monogram(brand: Brand): string {
    const name = (brand.name || '').trim();
    if (!name) return '?';
    const parts = name.split(/\s+/).filter(Boolean);
    const initials = parts.length > 1 ? parts[0][0] + parts[1][0] : name.slice(0, 2);
    return initials.toUpperCase();
  }
}
