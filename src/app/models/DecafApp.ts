import { prop } from '@decaf-ts/decoration';
import { Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';
import { uilistmodel } from '@decaf-ts/ui-decorators';

/**
 * @module app/models/DecafApp
 * @description A real application built with decaf-ts, shown on the `/apps`
 * showcase page. Seeded from the content pipeline (`assets/data/apps.json`) into
 * the RamAdapter and rendered by the decaf apps list component.
 */

/**
 * @description Decaf model of a real application built with decaf-ts.
 * @summary Mirrors one `DecafApp` entry of `assets/data/apps.json`: a localized
 * name/description, the app's links and visuals, the decaf modules it builds on
 * and its tags. Seeded per locale with an `en` fallback.
 * @class
 * @param {Partial<DecafApp>} args - Initial values for the model properties.
 * @example
 * const app = new DecafApp({ id: 'flipbored', name: 'Flipbored' });
 */
@uilistmodel('app-decaf-app')
@model()
export class DecafApp extends Model {
  /**
   * @description App identifier (slug), used as the primary key.
   */
  @pk() id: string = '';

  /**
   * @description Display order of the app card (ascending).
   */
  @prop() order: number = 0;

  /**
   * @description App display name.
   */
  @prop() name: string = '';

  /**
   * @description Localized one-line tagline of the app.
   */
  @prop() tagline: string = '';

  /**
   * @description Localized app description.
   */
  @prop() description: string = '';

  /**
   * @description Git repository url of the app.
   */
  @prop() repo: string = '';

  /**
   * @description Live site url of the app.
   */
  @prop() site: string = '';

  /**
   * @description Documentation url of the app.
   */
  @prop() docs: string = '';

  /**
   * @description Logo asset url of the app.
   */
  @prop() logo: string = '';

  /**
   * @description Screenshot asset url of the app.
   */
  @prop() screenshot: string = '';

  /**
   * @description Comma-separated decaf module names the app builds on.
   */
  @prop() modules: string = '';

  /**
   * @description Comma-separated showcase highlight ids the app demonstrates.
   */
  @prop() showcase: string = '';

  constructor(args: Partial<DecafApp> = {}) {
    super(args);
  }
}
