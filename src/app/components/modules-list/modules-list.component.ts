import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { ModuleDoc } from '../../models/ModuleDoc';
import { ModuleListBase } from '../list-base/module-list.base';
import { MODULE_LINK_ORDER, ModuleLinkKey, moduleLinkLabel } from '../../seed/link-labels';

/**
 * @module app/components/ModulesListComponent
 * @description Renders the module catalogue from the `ModuleDoc` RamAdapter table as
 * alternating showcase rows.
 */

/**
 * @description Angular component rendering the module catalogue rows.
 * @summary Extends {@link ModuleListBase} so the modules load from the `ModuleDoc` table via
 * the list set query. Each row mirrors the www-mock `renderModule()` alternation with
 * `see_examples`/`see_tutorials` CTAs linking to the filtered pages.
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
   * @description The external links seeded on a module record, in display order.
   * @summary Reads `repo`, `docs`, `githubPages` and `storyboard` from the adapter-backed
   * {@link ModuleDoc}, skipping the ones the content team left empty so only verified links
   * render.
   * @param {ModuleDoc} mod - The module record.
   * @returns {Object[]} The label + href pairs of the module's external links.
   */
  links(mod: ModuleDoc): { label: string; href: string }[] {
    const values: Record<ModuleLinkKey, string> = {
      repo: mod.repo,
      docs: mod.docs,
      githubPages: mod.githubPages,
      storyboard: mod.storyboard,
    };
    const locale = (this.translateService?.getCurrentLang() as string) || 'en_us';
    const seen = new Set<string>();
    return MODULE_LINK_ORDER.map((key) => ({
      label: moduleLinkLabel(key, locale),
      href: values[key],
    }))
      .filter((link) => !!link.href)
      .filter((link) => {
        const href = link.href.trim().replace(/\/+$/, '');
        if (seen.has(href)) return false;
        seen.add(href);
        return true;
      });
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
