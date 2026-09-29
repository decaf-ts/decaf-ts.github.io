import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';
import { uilistmodel } from '@decaf-ts/ui-decorators';

/**
 * @module app/models/NewsItem
 * @description One latest-release news item of the decaf-ts suite, generated at
 * build time by `scripts/collect-data.cjs` from the public GitHub Releases API of
 * every roster repository and rendered by the `/news` page.
 */

/**
 * @description Decaf model of one latest-release news item.
 * @summary Mirrors one entry of `assets/data/news.json`: the release title, tag
 * and date, the source repository and the changelog excerpt. Seeded per locale
 * from the build-time asset and rendered by the news list component.
 * @class
 * @param {Partial<NewsItem>} args - Initial values for the model properties.
 * @example
 * const item = new NewsItem({ id: 'core-v0.31.2', repo: 'core', tag: 'v0.31.2' });
 */
@uilistmodel('app-news-item')
@model()
export class NewsItem extends Model {
  /**
   * @description News item identifier (repo + tag), used as the primary key.
   */
  @pk() id: string = '';

  /**
   * @description Display order of the item (date descending).
   */
  @prop() order: number = 0;

  /**
   * @description Decaf module name the release belongs to.
   */
  @prop() repo: string = '';

  /**
   * @description Remote GitHub repository name the release belongs to.
   */
  @prop() remote: string = '';

  /**
   * @description Release tag (for example `v0.31.2`).
   */
  @prop() tag: string = '';

  /**
   * @description Release display title.
   */
  @prop() title: string = '';

  /**
   * @description ISO release date of the item.
   */
  @prop() date: string = '';

  /**
   * @description Public GitHub release url of the item.
   */
  @prop() url: string = '';

  /**
   * @description Plain-text changelog excerpt of the release.
   */
  @prop() excerpt: string = '';

  /**
   * @description Raw changelog body of the release (markdown).
   */
  @prop() body: string = '';

  constructor(args: Partial<NewsItem> = {}) {
    super(args);
  }
}
