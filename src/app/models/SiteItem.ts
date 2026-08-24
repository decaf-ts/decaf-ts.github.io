import { prop } from '@decaf-ts/decoration';
import { list, Model, model } from '@decaf-ts/decorator-validation';
import { pk } from '@decaf-ts/core';
import { uilistmodel } from '@decaf-ts/ui-decorators';

/**
 * @module app/models/SiteItem
 * @description Leaf content item model for {@link Section}s.
 */

/**
 * @description Decaf model of a leaf content item inside a {@link Section}.
 * @summary A generic content unit whose `kind` discriminates how it is rendered
 * (nav, link, inline, social, card, example, tutorial, text). Optional `children`
 * support nested layouts such as footer link columns.
 * @class
 * @param {Partial<SiteItem>} args - Initial values for the model properties.
 * @example
 * const navItem = new SiteItem({ kind: 'nav', titleKey: 'nav.modules', href: '/modules' });
 * const card = new SiteItem({ kind: 'card', title: 'Seamless Styling', description: '...' });
 */
@uilistmodel('app-site-item')
@model()
export class SiteItem extends Model {
  /**
   * @description Item identifier built from locale, tag and kind by the seed builder.
   */
  @pk() id: string = '';

  /**
   * @description Discriminator for the item rendering: 'nav', 'link', 'inline', 'social',
   * 'card', 'example', 'tutorial', 'text' (default). Slogans, brands and faq entries are
   * no longer `SiteItem` records — slogans are provided via the i18n `banner.slogans` key, while brands and faq entries live in the {@link app/models/Brand} and {@link app/models/Faq} tables respectively.
   */
  @prop() kind: string = 'text';

  /**
   * @description Display title (or i18n key when `titleKey` is set).
   */
  @prop() title: string = '';

  /**
   * @description Longer descriptive text used by cards, modules and faq entries.
   */
  @prop() description: string = '';

  /**
   * @description Short summary text used by tutorials and examples.
   */
  @prop() summary: string = '';

  /**
    * @description Plain text content.
   */
  @prop() text: string = '';

  /**
   * @description Raw code snippet rendered by doc blocks and example/tutorial cards.
   */
  @prop() code: string = '';

  /**
   * @description Optional router link or external href.
   */
  @prop() href: string = '';

  /**
   * @description Image asset url, e.g. brand logos.
   */
  @prop() src: string = '';

  /**
   * @description Inline SVG markup (trusted by `SafeHtmlPipe`) for icons and visuals.
   */
  @prop() icon: string = '';

  /**
   * @description Auxiliary item name, e.g. module name or social network name.
   */
  @prop() name: string = '';

  /**
   * @description Language code for code samples.
   */
  @prop() lang: string = '';

  /**
   * @description Tag discriminator used to select items inside a section (e.g. `cta-primary`).
   */
  @prop() tag: string = '';

  /**
   * @description Alternate text for image content.
   */
  @prop() alt: string = '';

  /**
   * @description i18n key for the display title when present.
   */
  @prop() titleKey: string = '';

  /**
   * @description i18n key for the display description when present.
   */
  @prop() descriptionKey: string = '';

  /**
   * @description Nested items, e.g. the links of a footer column.
   */
  @list(() => SiteItem)
  @prop() children: SiteItem[] = [];

  constructor(args: Partial<SiteItem> = {}) {
    super(args);
  }
}
