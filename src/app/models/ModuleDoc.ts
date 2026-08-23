import { prop } from '@decaf-ts/decoration';
import { list, Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';
import { uilistmodel } from '@decaf-ts/ui-decorators';
import { SiteItem } from './SiteItem';

/**
 * @module app/models/ModuleDoc
 * @description Documentation entry for a @decaf-ts module, mirroring `assets/data/modules.json`.
 * Seeded from the bundled asset so pages can be rendered purely from the RamAdapter.
 */

/**
 * @description Decaf model describing a @decaf-ts module and its documentation records.
 * @summary Mirrors one entry of the bundled `assets/data/modules.json` asset. It exposes
 * the module name, title, description, summary and base path plus the lists of
 * {@link SiteItem}s holding module examples and tutorials (enriched per locale from
 * {@link SITE_SEED}). Seeded by the {@link SiteService} into the RamAdapter.
 * @class
 * @param {Partial<ModuleDoc>} args - Initial values for the model properties.
 * @example
 * const module = new ModuleDoc({
 *   name: 'decoration',
 *   title: 'Decoration',
 *   base_path: 'https://github.com/decaf-ts/decoration',
 *   examples: [new SiteItem({ kind: 'example', title: 'Add metadata to a class' })],
 * });
 */
@uilistmodel('app-module-doc')
@model()
export class ModuleDoc extends Model {
  /**
   * @description Module name, used as the record primary key and feature/tutorial filter.
   */
  @pk() name: string = '';

  /**
   * @description Module display title.
   */
  @prop() title: string = '';

  /**
   * @description Module long description (markdown), rendered as a plain excerpt.
   */
  @prop() description: string = '';

  /**
   * @description Short module summary.
   */
  @prop() summary: string = '';

  /**
   * @description Base url/path of the module, e.g. its repository or docs location.
   */
  @prop() base_path: string = '';

  /**
   * @description Resolved `@decaf-ts/*` package version (from the build-time versions asset).
   */
  @prop() version: string = '';

  /**
   * @description Seeded {@link SiteItem} records of `example` kind for the module.
   */
  @list(() => SiteItem)
  @prop() examples: SiteItem[] = [];

  /**
   * @description Seeded {@link SiteItem} records of `tutorial` kind for the module.
   */
  @list(() => SiteItem)
  @prop() tutorials: SiteItem[] = [];

  constructor(args: Partial<ModuleDoc> = {}) {
    super(args);
  }
}
