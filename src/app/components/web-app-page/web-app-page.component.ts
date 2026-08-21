import { Component } from '@angular/core';
import { Dynamic, ModelRendererComponent, NgxComponentDirective } from '@decaf-ts/for-angular';
import { Section } from '../../structure/Section';
import { WebAppPage } from '../../structure/WebAppPage';

/**
 * @module app/components/WebAppPageComponent
 * @description Renders a {@link WebAppPage}: its hero section, body sections and footer.
 * Each section is rendered through a single `ngx-decaf-model-renderer`.
 */

/**
 * @description Angular component rendering a full {@link WebAppPage} through model renderers.
 * @summary Dynamic component target of the decaf rendering engine for the
 * `WebAppPage` model. It renders the hero {@link Section} (`header[0]`), each body
 * section and the footer {@link Section} (`footer[0]`), each through one
 * `ngx-decaf-model-renderer`.
 * @class
 * @extends NgxComponentDirective
 * @example
 * <app-web-app-page [model]="page"></app-web-app-page>
 */
@Dynamic()
@Component({
  selector: 'app-web-app-page',
  standalone: true,
  imports: [ModelRendererComponent],
  templateUrl: './web-app-page.component.html',
  styleUrl: './web-app-page.component.scss',
})
export class WebAppPageComponent extends NgxComponentDirective {
  /**
   * @description The page model rendered by this component.
   */
  override model!: WebAppPage;

  /**
   * @description Returns the hero section (`header[0]`) of the page, if any.
   * @returns {Section|undefined} The hero section of the page.
   */
  header(): Section | undefined {
    return this.model.header[0];
  }

  /**
   * @description Returns the ordered body sections of the page.
   * @returns {Section[]} The page body sections.
   */
  bodySections(): Section[] {
    return this.model.sections;
  }

  /**
   * @description Returns the footer section (`footer[0]`) of the page, if any.
   * @returns {Section|undefined} The footer section of the page.
   */
  footerSection(): Section | undefined {
    return this.model.footer[0];
  }
}
