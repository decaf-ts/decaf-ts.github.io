import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';

/**
 * @module app/models/Tutorial
 * @description A tutorial of the tutorials page. Seeded from the per-locale tutorial data
 * of {@link app/seed/i18n-data} by the {@link app/services/SiteService} and rendered by the
 * {@link app/components/TutorialsListComponent}, optionally filtered by module.
 */

/**
 * @description Decaf model of a single tutorial.
 * @summary Represents one `tutorials` entry of the locale {@link app/seed/i18n-data},
 * carrying the module it belongs to, a title, summary and code sample. Seeded with a
 * `tutorial_<module>_<index>` identifier so the tutorials page can filter by the routed
 * module.
 * @class
 * @param {Partial<Tutorial>} args - Initial values for the model properties.
 * @example
 * const tutorial = new Tutorial({ module: 'core', title: 'Create a service', code: '...' });
 */
@model()
export class Tutorial extends Model {
  /**
   * @description Tutorial identifier (derived from module + index).
   */
  @pk() id: string = '';

  /**
   * @description Module name the tutorial belongs to (e.g. `core`).
   */
  @prop() module: string = '';

  /**
   * @description Tutorial display title.
   */
  @prop() title: string = '';

  /**
   * @description Short tutorial summary.
   */
  @prop() summary: string = '';

  /**
   * @description Raw code snippet rendered by the tutorial card.
   */
  @prop() code: string = '';

  constructor(args: Partial<Tutorial> = {}) {
    super(args);
  }
}
