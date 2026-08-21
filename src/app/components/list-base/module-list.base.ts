import { Component, Input } from '@angular/core';
import { Condition, OrderDirection } from '@decaf-ts/core';
import { Model } from '@decaf-ts/decorator-validation';
import { KeyValue, ListComponent } from '@decaf-ts/for-angular';

/**
 * @module app/components/ModuleListBase
 * @description Shared base for every iterable page component. Subclasses extend decaf's
 * `ListComponent` and render from their RamAdapter table through the list query, with an
 * optional per-module condition so module pages show only that module's records.
 */

/**
 * @description Abstract base of the page's list components.
 * @summary Extends decaf's {@link ListComponent} so every repeated/iterable section of the
 * site renders from its RamAdapter table via the list set query, and adds an optional
 * `filterByModule` input applied as a `module` attribute condition. Subclasses provide
 * their own HTML template and style.
 * @class
 * @abstract
 * @extends ListComponent
 * @example
 * class TutorialsListComponent extends ModuleListBase {
 *   override modelName = Tutorial.name;
 * }
 */
@Component({
  standalone: true,
  template: '',
})
export abstract class ModuleListBase extends ListComponent {
  /**
   * @description Module name to constrain the query to, when provided.
   */
  @Input()
  filterByModule?: string;

  /**
   * @description Builds the `module` attribute condition or the default non-null condition.
   * @returns {Condition<any>} The condition passed to the list query.
   * @protected
   */
  protected moduleCondition(): Condition<any> {
    if (this.filterByModule) {
      return Condition.attribute<any>('module').eq(this.filterByModule);
    }
    const attr = (this.pk || 'id') as keyof Model;
    return Condition.attribute<Model>(attr).dif(null);
  }

  /**
   * @description Fetches the list rows from the RamAdapter table through `query()`.
   * @summary Overrides the default paginated fetch (which skips conditions) so module
   * filtered lists only return rows of the current module. Maps results with the decaf
   * `mapResults` helper so templates find each row under `item.model`.
   * @returns {Promise<KeyValue[]>} The mapped table rows.
   */
  override async getFromModel(): Promise<KeyValue[]> {
    if (!this._repository) {
      this._repository = this.repository;
    }
    const models = await this.query(
      this.moduleCondition(),
      (this.sortBy || this.pk || 'id') as keyof Model,
      this.sortDirection as OrderDirection
    );
    const mapped = await this.mapResults((models ?? []) as unknown as KeyValue[]);
    this.data = this.items = mapped;
    return mapped;
  }
}
