import { Component } from '@angular/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/BrandsListComponent
 * @description Renders the homepage logo cloud from the `Brand` RamAdapter table with a
 * CSS-only marquee (no DOM mutation at runtime).
 */

/**
 * @description Angular component rendering the brand logo marquee.
 * @summary Extends {@link ModuleListBase} so the logos load from the `Brand` table via the
 * list set query. The marquee scrolling is achieved purely through CSS keyframes on a
 * duplicated track — no directive mutates the DOM.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-brands-list [modelName]="'Brand'"></app-brands-list>
 */
@Component({
  selector: 'app-brands-list',
  standalone: true,
  templateUrl: './brands-list.component.html',
  styleUrl: './brands-list.component.scss',
})
export class BrandsListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'Brand';

  /**
   * @description Doubles the mapped rows so the CSS track loops seamlessly.
   * @returns {KeyValue[]} The duplicated item list.
   */
  duplicatedItems(): KeyValue[] {
    return [...(this.items || []), ...(this.items || [])];
  }
}
