import { Component, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { MarkdownPipe } from '../markdown.pipe';
import { SiteItem } from '../../models/SiteItem';
import { ModuleDoc } from '../../models/ModuleDoc';
import { ModuleFeature } from '../../models/ModuleFeature';
import { ModuleListBase } from '../list-base/module-list.base';
import { SiteService } from '../../services/site.service';

/**
 * @module app/components/ModuleFeaturesListComponent
 * @description Renders the features page cards from the `ModuleFeature` RamAdapter table,
 * optionally filtered to a single module, followed by the module's real code examples.
 */

/**
 * @description Angular component rendering the features page card grid.
 * @summary Extends {@link ModuleListBase} so the feature cards load from the `ModuleFeature`
 * table via the list set query. The `filterByModule` input constrains the query to the
 * currently selected module (from the route's `?module=` parameter) and additionally loads the
 * module's real code examples from the adapter so each feature page shows live snippets.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-module-features-list [filterByModule]="'decoration'"></app-module-features-list>
 */
@Component({
  selector: 'app-module-features-list',
  standalone: true,
  imports: [TranslatePipe, MarkdownPipe],
  templateUrl: './module-features-list.component.html',
  styleUrl: './module-features-list.component.scss',
})
export class ModuleFeaturesListComponent extends ModuleListBase implements OnInit {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'ModuleFeature';

  /**
   * @description Real code examples of the filtered module, loaded from the adapter.
   */
  examples: SiteItem[] = [];

  /**
   * @description The filtered module's documentation record, when resolved.
   */
  module?: ModuleDoc;

  constructor(private siteService: SiteService) {
    super();
  }

  /**
   * @description Loads the list rows and the module's real code examples.
   * @returns {Promise<void>} Resolves once the list and examples are loaded.
   */
  override async ngOnInit(): Promise<void> {
    await super.ngOnInit();
    if (this.filterByModule) {
      this.module = await this.siteService.getModule(this.filterByModule);
      this.examples = this.module?.examples ?? [];
    }
  }

  /**
   * @description The feature model of a mapped list row.
   * @param {object} item - The mapped list row.
   * @returns {ModuleFeature} The underlying model.
   */
  feature(item: KeyValue): ModuleFeature {
    return item['model'] as ModuleFeature;
  }

  /**
   * @description Zero-padded ordinal of a feature card.
   * @param {number} index - The zero-based card index.
   * @returns {string} The two-digit ordinal (`01`, `02`, ...).
   */
  ordinal(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
