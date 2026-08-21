import { prop } from '@decaf-ts/decoration';
import { list, Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';
import { uimodel } from '@decaf-ts/ui-decorators';
import { SiteItem } from '../models/SiteItem';

/**
 * @module app/structure/Section
 * @description A content building block of a {@link WebAppPage}. Rendered by the
 * `UiModelRendererComponent` mapping `Section` to `SiteSectionComponent`. Only lives to
 * drive static page rendering, so it sits in `structure/` (no persistent representation).
 */

/**
 * @description Decaf model of a content building block within a page.
 * @summary A {@link Section} is a layout-driven block (hero, features, faq, footer, ...)
 * belonging to a {@link WebAppPage}. It carries the (i18n-keyed) heading text, optional
 * link/name fields and the ordered list of {@link SiteItem}s rendered inside the block.
 * The `kind` property selects which template `SiteSectionComponent` renders.
 * @class
 * @param {Partial<Section>} args - Initial values for the model properties.
 * @example
 * const section = new Section({
 *   kind: 'faq',
 *   titleKey: 'faq.title',
 *   items: [new SiteItem({ kind: 'faq', title: 'Q1', description: 'A1' })],
 * });
 */
@uimodel('app-site-section', {
  label: 'site.section.label',
})
@model()
export class Section extends Model {
  /**
   * @description Section identifier built from locale and kind by the seed builder.
   */
  @pk() id: string = '';

  /**
   * @description Determines the section layout: 'hero', 'page-hero', 'logo-cloud',
   * 'features', 'cta', 'showcase', 'faq', 'modules', 'features-page', 'tutorials',
   * 'examples', 'community', 'footer', 'footer-slim'.
   */
  @prop() kind: string = 'plain';

  /**
   * @description i18n key for the section heading.
   */
  @prop() titleKey: string = '';

  /**
   * @description Plain (non-keyed) heading override, used by page heroes.
   */
  @prop() title: string = '';

  /**
   * @description i18n key for the section subtitle.
   */
  @prop() subtitleKey: string = '';

  /**
   * @description Plain (non-keyed) subtitle override, used when the hero is module-aware.
   */
  @prop() subtitle: string = '';

  /**
   * @description i18n key for the small kicker label above the heading.
   */
  @prop() kickerKey: string = '';

  /**
   * @description Optional external or router link associated with the section.
   */
  @prop() href: string = '';

  /**
   * @description Optional page/route name hint consumed by list sections and the SloganService.
   */
  @prop() module: string = '';

  /**
   * @description Flips showcase visual placement (visual on the left when true).
   */
  @prop() flip: boolean = false;

  /**
   * @description Ordered content items rendered inside the section.
   */
  @list(() => SiteItem)
  @prop() items: SiteItem[] = [];

  constructor(args: Partial<Section> = {}) {
    super(args);
  }
}
