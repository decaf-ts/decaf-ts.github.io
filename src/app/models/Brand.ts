import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';

/**
 * @module app/models/Brand
 * @description A brand logo entry of the homepage logo cloud. Seeded into the RamAdapter
 * by the {@link app/services/SiteService} and rendered by the {@link app/components/BrandsListComponent}.
 */

/**
 * @description Decaf model of one brand logo of the homepage logo cloud.
 * @summary Mirrors a single `brands` entry of the locale {@link app/seed/i18n-data} such
 * as a Tailwind logo asset. The `id` is locale-qualified by the seeding service so every
 * locale keeps an independent logo table.
 * @class
 * @param {Partial<Brand>} args - Initial values for the model properties.
 * @example
 * const brand = new Brand({ id: 'pt_br_Transistor', name: 'Transistor', src: '/logo.svg' });
 */
@model()
export class Brand extends Model {
  /**
   * @description Locale-qualified brand identifier used as the record primary key.
   */
  @pk() id: string = '';

  /**
   * @description Brand display name.
   */
  @prop() name: string = '';

  /**
   * @description Logo asset url rendered by the logo cloud.
   */
  @prop() src: string = '';

  /**
   * @description Alternate text for the logo image.
   */
  @prop() alt: string = '';

  constructor(args: Partial<Brand> = {}) {
    super(args);
  }
}
