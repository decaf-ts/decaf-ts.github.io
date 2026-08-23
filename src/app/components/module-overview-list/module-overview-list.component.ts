import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { ModuleDoc } from '../../models/ModuleDoc';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/ModuleOverviewListComponent
 * @description Renders the features page module overview grid (one card per module)
 * from the `ModuleDoc` RamAdapter table.
 */

/**
 * @description Angular component rendering the module overview cards of the features page.
 * @summary Extends {@link ModuleListBase} so the module catalogue loads from the
 * `ModuleDoc` table via the list set query. Each card mirrors the www-mock module
 * overview entry: localized title/summary (with plain-text fallbacks) and a
 * `see_examples` link into the filtered features page.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-module-overview-list></app-module-overview-list>
 */
@Component({
  selector: 'app-module-overview-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './module-overview-list.component.html',
  styleUrl: './module-overview-list.component.scss',
})
export class ModuleOverviewListComponent extends ModuleListBase {
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
   * @description Localized module title from `features.modules.<name>.title`, when present.
   * @param {ModuleDoc} mod - The module record.
   * @returns {string} The localized title, or an empty string when not localized.
   */
  localizedTitle(mod: ModuleDoc): string {
    return this.localized(`features.modules.${mod.name}.title`);
  }

  /**
   * @description Localized module summary from `features.modules.<name>.summary`, when present.
   * @param {ModuleDoc} mod - The module record.
   * @returns {string} The localized summary, or an empty string when not localized.
   */
  localizedSummary(mod: ModuleDoc): string {
    return this.localized(`features.modules.${mod.name}.summary`);
  }

  /**
   * @description Display title: localized entry first, then the record title/name.
   * @param {ModuleDoc} mod - The module record.
   * @returns {string} The resolved display title.
   */
  title(mod: ModuleDoc): string {
    return this.localizedTitle(mod) || mod.title || mod.name || '';
  }

  /**
   * @description Display summary: localized entry first, then the first plain-text line.
   * @param {ModuleDoc} mod - The module record.
   * @returns {string} The resolved display summary.
   */
  summary(mod: ModuleDoc): string {
    return this.localizedSummary(mod) || this.firstLine(mod.description);
  }

  /**
   * @description Resolves a locale key synchronously, returning '' when the key is missing.
   * @param {string} key - The i18n key to resolve.
   * @returns {string} The translation, or an empty string when the key is absent.
   */
  private localized(key: string): string {
    const value = this.translateService.instant(key) as string;
    return value && value !== key ? value : '';
  }

  /**
   * @description First line of the markdown-stripped module description.
   * @param {string|undefined} text - The raw markdown description.
   * @returns {string} The first plain-text line (empty when there is none).
   */
  private firstLine(text?: string): string {
    if (!text) return '';
    const plain = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[#>*_`~\[\]()!]/g, '')
      .replace(/\r\n|\r/g, '\n')
      .replace(/\n{2,}/g, '\n\n')
      .trim();
    return plain.split('\n')[0] || '';
  }
}
