import { Component } from '@angular/core';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/ModuleFeaturesListComponent
 * @description Renders the features page cards from the `ModuleFeature` RamAdapter table,
 * optionally filtered to a single module.
 */

/**
 * @description Angular component rendering the features page card grid.
 * @summary Extends {@link ModuleListBase} so the feature cards load from the `ModuleFeature`
 * table via the list set query. The `filterByModule` input constrains the query to the
 * currently selected module (from the route's `?module=` parameter).
 * @class
 * @extends ModuleListBase
 * @example
 * <app-module-features-list></app-module-features-list>
 */
@Component({
  selector: 'app-module-features-list',
  standalone: true,
  templateUrl: './module-features-list.component.html',
  styleUrl: './module-features-list.component.scss',
})
export class ModuleFeaturesListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'ModuleFeature';
}
