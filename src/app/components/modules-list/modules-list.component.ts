import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { ModuleDoc } from '../../models/ModuleDoc';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/ModulesListComponent
 * @description Renders the module catalogue from the `ModuleDoc` RamAdapter table as
 * alternating showcase rows, showing the installed `@decaf-ts` package version chip.
 */

/**
 * @description Angular component rendering the module catalogue rows.
 * @summary Extends {@link ModuleListBase} so the modules load from the `ModuleDoc` table via
 * the list set query. Each row mirrors the www-mock `renderModule()` alternation and shows
 * the module's resolved package version next to its title, plus `see_examples`/`see_tutorials`
 * CTAs linking to the filtered pages.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-modules-list></app-modules-list>
 */
@Component({
  selector: 'app-modules-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './modules-list.component.html',
  styleUrl: './modules-list.component.scss',
})
export class ModulesListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'ModuleDoc';

  /**
   * @description The module model of a mapped list row.
   * @param {object} item - The mapped list row.
   * @returns {ModuleDoc} The underlying model.
   */
  module(item: KeyValue): ModuleDoc {
    return item['model'] as ModuleDoc;
  }

  /**
   * @description Plain-text excerpt of the module's markdown description.
   * @param {string|undefined} text - The markdown description.
   * @param {number} [max] - Maximum characters (default 280).
   * @returns {string} The truncated plain-text excerpt.
   */
  excerpt(text?: string, max: number = 280): string {
    if (!text) return '';
    const noMd = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(new RegExp('[#>*_`()\\[\\]!~]', 'g'), '')
      .replace(/\n+/g, ' ')
      .trim();
    return noMd.length > max ? `${noMd.slice(0, max - 1)}…` : noMd;
  }
}
