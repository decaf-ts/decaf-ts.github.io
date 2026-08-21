import { Component } from '@angular/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { HomeCard } from '../../models/HomeCard';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/HomeCardsListComponent
 * @description Renders the homepage marketing card grid from the `HomeCard` RamAdapter table.
 */

/**
 * @description Angular component rendering the homepage feature cards.
 * @summary Extends {@link ModuleListBase} so the marketing grid loads from the `HomeCard`
 * table via the list set query and renders each card's title, description and icon.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-home-cards-list></app-home-cards-list>
 */
@Component({
  selector: 'app-home-cards-list',
  standalone: true,
  imports: [SafeHtmlPipe],
  templateUrl: './home-cards-list.component.html',
  styleUrl: './home-cards-list.component.scss',
})
export class HomeCardsListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'HomeCard';

  /**
   * @description The card model of a mapped list row.
   * @param {KeyValue} item - The mapped list row.
   * @returns {HomeCard} The underlying model.
   */
  card(item: KeyValue): HomeCard {
    return item['model'] as HomeCard;
  }
}
