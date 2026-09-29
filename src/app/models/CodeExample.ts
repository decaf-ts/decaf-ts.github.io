import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';

/**
 * @module app/models/CodeExample
 * @description A real, runnable code snippet attached to a showcase highlight or
 * module feature. Seeded from the content pipeline assets and rendered by the
 * showcase detail and feature list components.
 */

/**
 * @description Decaf model of a single code snippet.
 * @summary Mirrors one `codeExamples` entry of a `ShowcaseHighlight` record (or
 * one module `examples` entry): a title, the snippet language and the raw code.
 * The `id` is derived from the parent record and the snippet index so the snippet
 * can be persisted and read back from the RamAdapter.
 * @class
 * @param {Partial<CodeExample>} args - Initial values for the model properties.
 * @example
 * const snippet = new CodeExample({ id: 'extensible-decoration_0', lang: 'typescript', code: '...' });
 */
@model()
export class CodeExample extends Model {
  /**
   * @description Snippet identifier (derived from parent record + index).
   */
  @pk() id: string = '';

  /**
   * @description Snippet display title.
   */
  @prop() title: string = '';

  /**
   * @description Snippet language (e.g. `typescript`).
   */
  @prop() lang: string = '';

  /**
   * @description Raw code snippet, rendered verbatim in a code block.
   */
  @prop() code: string = '';

  constructor(args: Partial<CodeExample> = {}) {
    super(args);
  }
}
