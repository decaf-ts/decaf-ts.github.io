import { prop } from '@decaf-ts/decoration';
import { list, Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';
import { uimodel } from '@decaf-ts/ui-decorators';
import { Section } from './Section';

/**
 * @module app/structure/WebAppPage
 * @description A page of the {@link WebApp}: index, modules, features, tutorials,
 * examples, community. Holds a hero {@link Section} (header), the body sections list and
 * the footer {@link Section}. Renders only static page structure, so it lives in
 * `structure/` (no persistent representation).
 */

/**
 * @description Decaf model of a single routed marketing page.
 * @summary One {@link WebAppPage} per site route (index, modules, features, tutorials,
 * examples, community), holding the page title key, a hero {@link Section} (header), the
 * ordered list of body {@link Section}s and the footer {@link Section}. Seeded per locale
 * by the {@link SiteService} and rendered by `WebAppPageComponent` through the decaf
 * model renderer.
 * @class
 * @param {Partial<WebAppPage>} args - Initial values for the model properties.
 * @example
 * const page = new WebAppPage({
 *   id: 'index',
 *   titleKey: 'document.title',
 *   header: [heroSection],
 *   sections: [featuresSection, faqSection],
 *   footer: [footerSection],
 * });
 */
@uimodel('app-web-app-page', {
  label: 'site.page.label',
})
@model()
export class WebAppPage extends Model {
  /**
   * @description Page identifier matched by the routed page data (`index`, `modules`, ...).
   */
  @pk() id: string = '';

  /**
   * @description i18n key for the document/page title.
   */
  @prop() titleKey: string = '';

  /**
   * @description Hero section list; only the first entry is rendered by the page component.
   */
  @list(() => Section)
  @prop() header: Section[] = [];

  /**
   * @description Body sections rendered in order between the hero and the footer.
   */
  @list(() => Section)
  @prop() sections: Section[] = [];

  /**
   * @description Footer section list; only the first entry is rendered.
   */
  @list(() => Section)
  @prop() footer: Section[] = [];

  constructor(args: Partial<WebAppPage> = {}) {
    super(args);
  }
}
