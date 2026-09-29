import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderDirection } from '@decaf-ts/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { DecafApp } from '../../models/DecafApp';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/DecafAppsListComponent
 * @description Renders the real applications built with decaf (flipbored and
 * friends) from the `DecafApp` RamAdapter table, with their modules and links.
 */

/**
 * @description Angular component rendering the decaf apps cards.
 * @summary Extends {@link ModuleListBase} so the apps load from the `DecafApp`
 * table via the list set query. Each card shows the app's tagline, formatted
 * description, the decaf modules it builds on and its links.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-decaf-apps-list></app-decaf-apps-list>
 */
@Component({
  selector: 'app-decaf-apps-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe],
  templateUrl: './decaf-apps-list.component.html',
  styleUrl: './decaf-apps-list.component.scss',
})
export class DecafAppsListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'DecafApp';

  override sortBy = 'order';
  override sortDirection: OrderDirection = OrderDirection.ASC;

  /**
   * @description The app model of a mapped list row.
   * @param {object} item - The mapped list row.
   * @returns {DecafApp} The underlying model.
   */
  app(item: KeyValue): DecafApp {
    return item['model'] as DecafApp;
  }

  /**
   * @description The decaf module names the app builds on.
   * @param {DecafApp} app - The app record.
   * @returns {string[]} The module names.
   */
  modulesOf(app: DecafApp): string[] {
    return (app.modules || '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
  }

  /**
   * @description The showcase highlight ids the app demonstrates.
   * @param {DecafApp} app - The app record.
   * @returns {string[]} The highlight ids.
   */
  showcasesOf(app: DecafApp): string[] {
    return (app.showcase || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
  }

  /**
   * @description Plain-text excerpt of the app's markdown description.
   * @param {string|undefined} text - The markdown description.
   * @param {number} [max] - Maximum characters (default 240).
   * @returns {string} The truncated plain-text excerpt.
   */
  excerpt(text?: string, max: number = 240): string {
    if (!text) return '';
    const noMd = text
      .replace(/```[\s\S]*?```/g, '')
      .replace(new RegExp('[#>*_`()\\[\\]!~]', 'g'), '')
      .replace(/\n+/g, ' ')
      .trim();
    return noMd.length > max ? `${noMd.slice(0, max - 1)}…` : noMd;
  }
}
