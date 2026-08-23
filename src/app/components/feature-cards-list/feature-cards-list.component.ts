import { Component } from '@angular/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { HomeCard } from '../../models/HomeCard';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/FeatureCardsListComponent
 * @description Renders the features page locale card grid (icon, title, description)
 * from the `HomeCard` RamAdapter table.
 */

/**
 * @description Angular component rendering the features page marketing cards.
 * @summary Extends {@link ModuleListBase} so the locale feature cards load from the
 * `HomeCard` table via the list set query. Mirrors the www-mock `features.cards`
 * grid (three-column layout with bordered cards and gray icon tiles).
 * @class
 * @extends ModuleListBase
 * @example
 * <app-feature-cards-list></app-feature-cards-list>
 */
@Component({
  selector: 'app-feature-cards-list',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './feature-cards-list.component.html',
  styleUrl: './feature-cards-list.component.scss',
})
export class FeatureCardsListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'HomeCard';

  /**
   * @description The card model of a mapped list row.
   * @param {object} item - The mapped list row.
   * @returns {HomeCard} The underlying model.
   */
  card(item: KeyValue): HomeCard {
    return item['model'] as HomeCard;
  }
}
