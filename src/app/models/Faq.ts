import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';

/**
 * @module app/models/Faq
 * @description A FAQ question/answer entry of the homepage FAQ section. Seeded into the
 * RamAdapter by the {@link app/services/SiteService} and rendered by the
 * {@link app/components/FaqListComponent}.
 */

/**
 * @description Decaf model of a single FAQ entry.
 * @summary Mirrors one `faq` entry of the locale {@link app/seed/i18n-data}. The `id` is
 * locale-qualified and derived from the question text by the seeding service, so each
 * locale keeps its own FAQ table.
 * @class
 * @param {Partial<Faq>} args - Initial values for the model properties.
 * @example
 * const faq = new Faq({ id: 'en_us_what_is_decaf', title: 'What is Decaf?', description: '...' });
 */
@model()
export class Faq extends Model {
  /**
   * @description Locale-qualified FAQ identifier used as the record primary key.
   */
  @pk() id: string = '';

  /**
   * @description FAQ question text.
   */
  @prop() title: string = '';

  /**
   * @description FAQ answer body.
   */
  @prop() description: string = '';

  constructor(args: Partial<Faq> = {}) {
    super(args);
  }
}
