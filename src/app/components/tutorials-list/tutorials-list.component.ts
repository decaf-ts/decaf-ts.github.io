import { Component } from '@angular/core';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/TutorialsListComponent
 * @description Renders the tutorials page cards from the `Tutorial` RamAdapter table,
 * optionally filtered to a single module.
 */

/**
 * @description Angular component rendering the tutorials page card grid.
 * @summary Extends {@link ModuleListBase} so the tutorials load from the `Tutorial` table via
 * the list set query. The `filterByModule` input constrains the query to the currently
 * selected module (from the route's `?module=` parameter), otherwise all tutorials show.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-tutorials-list></app-tutorials-list>
 */
@Component({
  selector: 'app-tutorials-list',
  standalone: true,
  templateUrl: './tutorials-list.component.html',
  styleUrl: './tutorials-list.component.scss',
})
export class TutorialsListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'Tutorial';
}
