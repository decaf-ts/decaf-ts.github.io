import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { ModuleDoc } from '../../models/ModuleDoc';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/DocumentationListComponent
 * @description Renders the documentation hub: every module with its formatted
 * summary and the single canonical documentation link (the deduplicated `docs` url,
 * falling back to the repository when a module has no published docs).
 */

/**
 * @description Angular component rendering the module documentation cards.
 * @summary Extends {@link ModuleListBase} so the modules load from the `ModuleDoc`
 * RamAdapter table via the list set query. Each card links to the module's official
 * documentation (or repository) and shows a plain-text excerpt of its description.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-documentation-list></app-documentation-list>
 */
@Component({
  selector: 'app-documentation-list',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './documentation-list.component.html',
  styleUrl: './documentation-list.component.scss',
})
export class DocumentationListComponent extends ModuleListBase {
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
   * @description The module's canonical documentation link.
   * @summary Prefers the published docs site and falls back to the repository so
   * every module always has exactly one working destination.
   * @param {ModuleDoc} mod - The module record.
   * @returns {string} The documentation (or repository) url.
   */
  docHref(mod: ModuleDoc): string {
    return mod.docs || mod.githubPages || mod.repo || '';
  }

  /**
   * @description Whether the module's canonical link is the repository.
   * @param {ModuleDoc} mod - The module record.
   * @returns {boolean} `true` when only the repository is available.
   */
  isRepoOnly(mod: ModuleDoc): boolean {
    return !mod.docs && !mod.githubPages && !!mod.repo;
  }

  /**
   * @description Plain-text excerpt of the module's markdown description.
   * @param {string|undefined} text - The markdown description.
   * @param {number} [max] - Maximum characters (default 220).
   * @returns {string} The truncated plain-text excerpt.
   */
  excerpt(text?: string, max: number = 220): string {
    if (!text) return '';
    const noMd = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(new RegExp('[#>*_`()\\[\\]!~]', 'g'), '')
      .replace(/\n+/g, ' ')
      .trim();
    return noMd.length > max ? `${noMd.slice(0, max - 1)}…` : noMd;
  }
}
