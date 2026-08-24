import { Component } from '@angular/core';
import { OrderDirection } from '@decaf-ts/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/FaqListComponent
 * @description Renders the FAQ two-column grid from the `Faq` RamAdapter table.
 */

/**
 * @description Angular component rendering the FAQs in two balanced columns.
 * @summary Extends {@link ModuleListBase} so the questions load from the `Faq` table via
 * the list set query and render as title + body rows split into two columns.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-faq-list></app-faq-list>
 */
@Component({
  selector: 'app-faq-list',
  standalone: true,
  templateUrl: './faq-list.component.html',
  styleUrl: './faq-list.component.scss',
})
export class FaqListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'Faq';

  override sortBy = 'order';
  override sortDirection: OrderDirection = OrderDirection.ASC;

  /**
   * @description Returns the mapped rows of the requested column.
   * @param {number} col - The column index (0 left, 1 right).
   * @returns {KeyValue[]} The rows of the requested column.
   */
  column(col: number): KeyValue[] {
    const half = Math.ceil((this.items || []).length / 2);
    return col === 0 ? (this.items || []).slice(0, half) : (this.items || []).slice(half);
  }
}
