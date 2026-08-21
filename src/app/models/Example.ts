import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';

/**
 * @module app/models/Example
 * @description A module code example of the examples page. Seeded from the bundled
 * `assets/data/modules.json` asset by the {@link app/services/SiteService} and rendered by
 * the {@link app/components/ExamplesListComponent}.
 */

/**
 * @description Decaf model of a single module code example.
 * @summary Mirrors one `examples` entry of the bundled modules asset (title, context, code
 * and language) plus the `module` it belongs to. Seeded into the RamAdapter with a
 * `example_<module>_<title>` (locale-independent) identifier so the examples list can
 * render across locales.
 * @class
 * @param {Partial<Example>} args - Initial values for the model properties.
 * @example
 * const example = new Example({ module: 'decoration', title: 'Tag a class', lang: 'typescript' });
 */
@model()
export class Example extends Model {
  /**
   * @description Example identifier (locale-independent, derived from module + title).
   */
  @pk() id: string = '';

  /**
   * @description Module name the example belongs to (e.g. `decoration`).
   */
  @prop() module: string = '';

  /**
   * @description Example display title.
   */
  @prop() title: string = '';

  /**
   * @description Short context/description of the example.
   */
  @prop() summary: string = '';

  /**
   * @description Raw code snippet rendered by the example card.
   */
  @prop() code: string = '';

  /**
   * @description Language of the code snippet (defaults to `typescript`).
   */
  @prop() lang: string = '';

  constructor(args: Partial<Example> = {}) {
    super(args);
  }
}
