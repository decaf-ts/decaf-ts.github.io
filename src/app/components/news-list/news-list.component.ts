import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderDirection } from '@decaf-ts/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { NewsItem } from '../../models/NewsItem';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/NewsListComponent
 * @description Renders the latest-release news feed from the `NewsItem`
 * RamAdapter table generated at build time from the public GitHub Releases of every
 * decaf-ts repository.
 */

/**
 * @description Angular component rendering the `/news` latest-release feed.
 * @summary Extends {@link ModuleListBase} so the items load from the `NewsItem`
 * table via the list set query. Each card shows the source module, the release tag
 * and date, the release title and its changelog excerpt, and links out to the
 * public GitHub release. Cards carry a stable `id` anchor so the landing news badge
 * can deep-link to a specific item.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-news-list></app-news-list>
 */
@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './news-list.component.html',
  styleUrl: './news-list.component.scss',
})
export class NewsListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'NewsItem';

  override sortBy = 'order';
  override sortDirection: OrderDirection = OrderDirection.ASC;

  /**
   * @description The news model of a mapped list row.
   * @param {object} item - The mapped list row.
   * @returns {NewsItem} The underlying model.
   */
  news(item: KeyValue): NewsItem {
    return item['model'] as NewsItem;
  }

  /**
   * @description The external release url of a news item, when present.
   * @param {NewsItem} news - The news record.
   * @returns {string} The release url, else `''`.
   */
  releaseUrl(news: NewsItem): string {
    return news.url || '';
  }

  /**
   * @description The display title of a news item, falling back to repo + tag.
   * @param {NewsItem} news - The news record.
   * @returns {string} The display title.
   */
  displayTitle(news: NewsItem): string {
    return news.title || `${news.repo} ${news.tag}`.trim();
  }

  /**
   * @description The readable date of a news item (locale short date).
   * @param {NewsItem} news - The news record.
   * @returns {string} The formatted date, else `''`.
   */
  displayDate(news: NewsItem): string {
    if (!news.date) return '';
    const parsed = new Date(news.date);
    if (Number.isNaN(parsed.getTime())) return news.date;
    return parsed.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  }
}
