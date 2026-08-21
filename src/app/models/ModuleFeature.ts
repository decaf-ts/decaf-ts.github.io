import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';

/**
 * @module app/models/ModuleFeature
 * @description A feature card of the module features page. Seeded into the RamAdapter by
 * the {@link app/services/SiteService} and rendered by the
 * {@link app/components/ModuleFeaturesListComponent}, optionally filtered by module.
 */

/**
 * @description Decaf model of a single module feature card.
 * @summary Represents one feature of an `@decaf-ts` module, pairing the module name with a
 * title and description. Seeded (per module, or synthesized from the module description
 * when a module has no explicit feature groups) with a `feature_<module>_<title>`
 * identifier so the features page can filter by the routed module.
 * @class
 * @param {Partial<ModuleFeature>} args - Initial values for the model properties.
 * @example
 * const feature = new ModuleFeature({ module: 'decoration', title: 'Decorator-based metadata' });
 */
@model()
export class ModuleFeature extends Model {
  /**
   * @description Feature identifier (derived from module + title).
   */
  @pk() id: string = '';

  /**
   * @description Module name the feature belongs to (e.g. `decoration`).
   */
  @prop() module: string = '';

  /**
   * @description Feature display title.
   */
  @prop() title: string = '';

  /**
   * @description Feature description body.
   */
  @prop() description: string = '';

  constructor(args: Partial<ModuleFeature> = {}) {
    super(args);
  }
}
