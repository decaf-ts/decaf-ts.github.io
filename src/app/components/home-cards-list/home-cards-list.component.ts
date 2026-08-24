import { Component } from '@angular/core';
import { OrderDirection } from '@decaf-ts/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { HomeCard } from '../../models/HomeCard';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/HomeCardsListComponent
 * @description Renders the homepage marketing card grid from the `HomeCard` RamAdapter
 * table as a seamless CSS marquee (the www-mock `#features-grid` geometry).
 */

/**
 * @description Angular component rendering the homepage feature card marquee.
 * @summary Extends {@link ModuleListBase} so the marketing cards load from the `HomeCard`
 * table via the list set query. The three unique cards are cycled into the mock's
 * eight-card 4x2 grid and the scrolling is achieved purely through CSS keyframes on a
 * duplicated page track — no directive mutates the DOM.
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

  override sortBy = 'order';
  override sortDirection: OrderDirection = OrderDirection.ASC;

  /**
   * @description The card model of a mapped list row.
   * @param {object} item - The mapped list row.
   * @returns {HomeCard} The underlying model.
   */
  card(item: KeyValue): HomeCard {
    return item['model'] as HomeCard;
  }

  /**
   * @description Cycles the unique cards into the mock's eight-card pattern.
   * @returns {KeyValue[]} The eight grid rows (indices 0,1,2,0,1,2,0,1 of the table).
   */
  cycledItems(): KeyValue[] {
    const items = this.items || [];
    if (!items.length) return [];
    const pattern = [0, 1, 2, 0, 1, 2, 0, 1];
    return pattern.map((i) => items[i % items.length]);
  }
}
