import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';

/**
 * @module app/models/HomeCard
 * @description A marketing feature card of the homepage features grid. Seeded into the
 * RamAdapter by the {@link app/services/SiteService} and rendered by the
 * {@link app/components/HomeCardsListComponent}.
 */

/**
 * @description Decaf model of a single homepage feature card.
 * @summary Mirrors one `cards` entry of the locale {@link app/seed/i18n-data}. The `id` is
 * locale-qualified and derived from the card title by the seeding service, so each locale
 * keeps an independent card table.
 * @class
 * @param {Partial<HomeCard>} args - Initial values for the model properties.
 * @example
 * const card = new HomeCard({ id: 'en_us_seamless_styling', title: 'Seamless Styling' });
 */
@model()
export class HomeCard extends Model {
  /**
   * @description Locale-qualified card identifier used as the record primary key.
   */
  @pk() id: string = '';

  /**
   * @description Card display title.
   */
  @prop() title: string = '';

  /**
   * @description Card description body.
   */
  @prop() description: string = '';

  /**
   * @description Inline SVG markup trusted by `SafeHtmlPipe` for the card icon.
   */
  @prop() icon: string = '';

  constructor(args: Partial<HomeCard> = {}) {
    super(args);
  }
}
