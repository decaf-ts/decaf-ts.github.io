import { prop } from '@decaf-ts/decoration';
import { list, Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';
import { uimodel } from '@decaf-ts/ui-decorators';
import { Section } from './Section';
import { WebAppPage } from './WebAppPage';

/**
 * @module app/structure/WebApp
 * @description Root site model. One instance is seeded per locale in the RamAdapter.
 * Holds the global chrome (nav) and the list of {@link WebAppPage}s. This model only
 * drives static page rendering, so it lives in `structure/` (no persistent representation).
 */

/**
 * @description Decaf model representing the whole marketing site for one locale.
 * @summary The site graph rooted at a single {@link WebApp} instance, persisted per
 * locale in the RamAdapter by the {@link SiteService} and consumed by the layout and
 * routed pages. Carries the global chrome (navigation {@link Section}) and the ordered
 * list of {@link WebAppPage}s exposed by the router.
 * @class
 * @param {Partial<WebApp>} args - Initial values for the model properties.
 * @example
 * import { WebApp } from './WebApp';
 * require('@decaf-ts/core/ram'); // register the RamAdapter
 * const site = new WebApp({
 *   locale: 'en_us',
 *   nav: [navSection],
 *   pages: [indexPage, modulesPage, featuresPage, tutorialsPage, examplesPage],
 * });
 * @mermaid
 * sequenceDiagram
 *   participant SiteService
 *   participant Repository
 *   participant RamAdapter
 *   SiteService->>Repository: forModel(WebApp).create(site)
 *   Repository->>RamAdapter: persist site
 *   SiteService->>SiteService: getSite(locale)
 *   SiteService->>Repository: read(locale)
 */
@uimodel('app-web-app', {
  label: 'site.app.label',
})
@model()
export class WebApp extends Model {
  /**
   * @description Primary key; the seeded id equals the locale code.
   */
  @pk() id: string = 'decaf';

  /**
   * @description Locale the site graph is seeded for (`en_en`, `en_us`, `pt_br`, `pt_pt`).
   */
  @prop() locale: string = 'en_us';

  /**
   * @description Site logo asset path rendered by the layout chrome.
   */
  @prop() logo: string = 'assets/logo_contrast.svg';

  /**
   * @description Global chrome: a single `nav` {@link Section} plus any extra lookup sections.
   */
  @list(() => Section)
  @prop() nav: Section[] = [];

  /**
   * @description Ordered pages of the site, matched by id to the routed page components.
   */
  @list(() => WebAppPage)
  @prop() pages: WebAppPage[] = [];

  constructor(args: Partial<WebApp> = {}) {
    super(args);
  }
}
