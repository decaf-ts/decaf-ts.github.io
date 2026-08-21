import { Component } from '@angular/core';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/ExamplesListComponent
 * @description Renders the examples page cards from the `Example` RamAdapter table,
 * optionally filtered to a single module.
 */

/**
 * @description Angular component rendering the examples page card grid.
 * @summary Extends {@link ModuleListBase} so the examples load from the `Example` table via
 * the list set query. The `filterByModule` input constrains the query to the currently
 * selected module (from the route's `?module=` parameter), otherwise all examples show.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-examples-list></app-examples-list>
 */
@Component({
  selector: 'app-examples-list',
  standalone: true,
  templateUrl: './examples-list.component.html',
  styleUrl: './examples-list.component.scss',
})
export class ExamplesListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'Example';
}
