import { prop } from '@decaf-ts/decoration';
import { list, Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';
import { uilistmodel } from '@decaf-ts/ui-decorators';
import { CodeExample } from './CodeExample';

/**
 * @module app/models/ShowcaseHighlight
 * @description A real decaf-ts feature highlight of the showcase. Seeded from the
 * content pipeline (`assets/data/showcase.json`) into the RamAdapter and rendered
 * by the showcase list, landing-page and detail components.
 */

/**
 * @description Decaf model of a single showcase feature highlight.
 * @summary Mirrors one `ShowcaseHighlight` entry of `assets/data/showcase.json`:
 * a localized title/tagline/detail (formatted markdown), the decaf modules it
 * demonstrates, the demo UI selector and its real code snippets. Seeded per locale
 * with an `en` fallback so `/showcase` and `/showcase/:id` render from the
 * RamAdapter like every other page.
 * @class
 * @param {Partial<ShowcaseHighlight>} args - Initial values for the model properties.
 * @example
 * const highlight = new ShowcaseHighlight({
 *   id: 'extensible-decoration',
 *   title: 'Extensible Decoration',
 *   tagline: 'One decorator, every flavour.',
 * });
 */
@uilistmodel('app-showcase-highlight')
@model()
export class ShowcaseHighlight extends Model {
  /**
   * @description Highlight identifier (slug), used as the primary key and route param.
   */
  @pk() id: string = '';

  /**
   * @description Display order of the highlight (ascending).
   */
  @prop() order: number = 0;

  /**
   * @description Localized highlight title.
   */
  @prop() title: string = '';

  /**
   * @description Localized one-line hook shown on the landing page and list.
   */
  @prop() tagline: string = '';

  /**
   * @description Icon name of the highlight card.
   */
  @prop() icon: string = '';

  /**
   * @description Accent colour token of the highlight card.
   */
  @prop() accent: string = '';

  /**
   * @description Localized formatted markdown explanation (headings/lists/code).
   */
  @prop() detail: string = '';

  /**
   * @description Comma-separated module names the highlight demonstrates.
   */
  @prop() modules: string = '';

  /**
   * @description Demo UI selector kind (e.g. `decoration`, `model`, `routes`).
   */
  @prop() demoKind: string = '';

  /**
   * @description Localized demo UI label.
   */
  @prop() demoLabel: string = '';

  /**
   * @description JSON-encoded demo UI configuration.
   */
  @prop() demoConfig: string = '';

  /**
   * @description Real code snippets attached to the highlight.
   */
  @list(() => CodeExample)
  @prop() codeExamples: CodeExample[] = [];

  constructor(args: Partial<ShowcaseHighlight> = {}) {
    super(args);
  }
}
