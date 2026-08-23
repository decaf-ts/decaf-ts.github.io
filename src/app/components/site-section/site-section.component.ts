import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { Dynamic, NgxComponentDirective } from '@decaf-ts/for-angular';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { Section } from '../../structure/Section';
import { SiteItem } from '../../models/SiteItem';
import { SiteNavComponent } from '../site-nav/site-nav.component';
import { VisualPanelComponent } from './visual-panel.component';
import { BrandsListComponent } from '../brands-list/brands-list.component';
import { HomeCardsListComponent } from '../home-cards-list/home-cards-list.component';
import { FaqListComponent } from '../faq-list/faq-list.component';
import { ModulesListComponent } from '../modules-list/modules-list.component';
import { ModuleFeaturesListComponent } from '../module-features-list/module-features-list.component';
import { FeatureCardsListComponent } from '../feature-cards-list/feature-cards-list.component';
import { ModuleOverviewListComponent } from '../module-overview-list/module-overview-list.component';
import { TutorialsListComponent } from '../tutorials-list/tutorials-list.component';
import { ExamplesListComponent } from '../examples-list/examples-list.component';
import { SloganService } from '../../services/slogans.service';
import { SiteService } from '../../services/site.service';

/**
 * @module app/components/SiteSectionComponent
 * @description Renders one site {@link Section} for every section kind present in the
 * seed data. Registered with the decaf rendering engine under the
 * `@uimodel('app-site-section')` tag, so every page renders its sections through
 * a single `ngx-decaf-model-renderer` per section.
 */

/**
 * @description Angular component rendering a single site {@link Section} by its kind.
 * @summary The default decaf render target for the `Section` model (`@uimodel` tag
 * `app-site-section`). Switches on `model.kind` to render hero, page-hero, logo-cloud,
 * features, cta, showcase, faq, modules, features-page, tutorials, examples, community,
 * footer and footer-slim layouts. Iterable content (logos, cards, faq, modules,
 * features, tutorials, examples) is delegated to decaf `ListComponent` subclasses fed by
 * the RamAdapter tables.
 * @class
 * @extends NgxComponentDirective
 * @example
 * <app-site-section [model]="section"></app-site-section>
 */
@Dynamic()
@Component({
  selector: 'app-site-section',
  standalone: true,
  imports: [
    RouterLink,
    TranslatePipe,
    SafeHtmlPipe,
    SiteNavComponent,
    VisualPanelComponent,
    BrandsListComponent,
    HomeCardsListComponent,
    FaqListComponent,
    ModulesListComponent,
    ModuleFeaturesListComponent,
    FeatureCardsListComponent,
    ModuleOverviewListComponent,
    TutorialsListComponent,
    ExamplesListComponent,
  ],
  templateUrl: './site-section.component.html',
  styleUrl: './site-section.component.scss',
})
export class SiteSectionComponent extends NgxComponentDirective implements OnInit {
  /**
   * @description The section rendered by this component.
   */
  override model!: Section;

  /**
   * @description Selected slogan resolved lazily from the catalog for full footers.
   */
  footerSlogan: string | null = null;

  /**
   * @description Resolved `@decaf-ts` package version of the `?module=` target, when known.
   */
  moduleVersion: string | null = null;

  constructor(
    private sloganService: SloganService,
    private siteService: SiteService,
    override router: Router
  ) {
    super();
  }

  async ngOnInit(): Promise<void> {
    if (this.model.kind === 'footer') {
      this.footerSlogan = await this.sloganService.slogan(this.queryModule() || undefined);
    }
    const moduleName = this.queryModule();
    if (this.model.kind === 'page-hero' && moduleName) {
      const versions = await this.siteService.getModuleVersions();
      this.moduleVersion = versions[moduleName] || null;
    }
  }

  /**
   * @description Module name from the route query, when present.
   * @returns {string} The `?module=` query value, else `''`.
   */
  queryModule(): string {
    return (this.router.parseUrl(this.router.url).queryParamMap.get('module') || '').trim();
  }

  /**
   * @description Returns the navigation items (`kind === 'nav'`) of the section.
   * @returns {SiteItem[]} The nav items rendered by the nav layout.
   */
  navItems(): SiteItem[] {
    return this.model.items.filter((i) => i.kind === 'nav');
  }

  /**
   * @description Resolves the primary CTA item from the section items.
   * @returns {SiteItem|undefined} The `nav-cta` link item of the section.
   */
  cta(): SiteItem | undefined {
    return this.model.items.find((i) => i.kind === 'link' && i.tag === 'nav-cta');
  }

  /**
   * @description Returns the section items tagged with the given tag.
   * @param {string} tag - The item tag to filter on.
   * @returns {SiteItem[]} The matching items.
   */
  byTag(tag: string): SiteItem[] {
    return this.model.items.filter((i) => i.tag === tag);
  }

  /**
   * @description Whether a `?module=` filter is active for the tutorials/examples/features
   * pages, so the lists render only that module's records.
   * @returns {boolean} `true` when a module query param is present.
   */
  hasModuleFilter(): boolean {
    return !!this.queryModule();
  }

  /**
   * @description Returns the visual item rendered by the showcase layout.
   * @returns {SiteItem} The `inline`/`visual` tagged item, else the first section item.
   */
  visual(): SiteItem {
    return this.model.items.find((i) => i.kind === 'inline' && i.tag === 'visual') || this.model.items[0];
  }

  /**
   * @description Whether the showcase visual panel is rendered on the left-hand side.
   * @returns {boolean} `true` when the section is flipped.
   */
  visualOnLeft(): boolean {
    return !!this.model.flip;
  }

  /**
   * @description Computes the showcase section background classes based on `flip`.
   * @returns {string} The `bg-red-50` (flipped) or `bg-white` section classes.
   */
  showcaseSectionClass(): string {
    return this.model.flip ? 'py-28 bg-red-50' : 'py-28 bg-white';
  }

  /**
   * @description Returns the footer link columns (non-social `link` items and their children).
   * @returns {Object[]} The footer columns.
   */
  linkColumns(): { tag: string; titleKey: string; links: SiteItem[] }[] {
    return this.model.items
      .filter((i) => i.kind === 'link' && !!i.tag && i.tag !== 'social')
      .map((col) => ({
        tag: col.tag,
        titleKey: col.titleKey,
        links: col.children,
      }));
  }

  /**
   * @description Returns the social link items (`kind === 'social'`) of the footer.
   * @returns {SiteItem[]} The social items rendered by the footer layout.
   */
  socialItems(): SiteItem[] {
    return this.model.items.filter((i) => i.kind === 'social');
  }

  /**
   * @description Returns the community cards (`kind === 'card'`) of the community section.
   * @returns {SiteItem[]} The community card items.
   */
  communityCards(): SiteItem[] {
    return this.model.items.filter((i) => i.kind === 'card');
  }

  /**
   * @description Normalizes item hrefs to router links, dropping everything else.
   * @param {string|undefined|null} href - The raw href.
   * @returns {string|null} The href when it is an internal `/` link, else `null`.
   */
  hrefOrNil(href: string | undefined | null): string | null {
    if (href && href.startsWith('/')) return href;
    return null;
  }

  /**
   * @description Full absolute hrefs (external links) pass through as raw anchors.
   * @param {string|undefined|null} href - The raw href.
   * @returns {string|undefined} The href for external links.
   */
  rawHref(href: string | undefined | null): string | undefined {
    return href && href.startsWith('http') ? href : undefined;
  }

  /**
   * @description The module name the tutorials/examples/features lists filter by.
   * @returns {string|undefined} The `?module=` value when filtering.
   */
  moduleFilter(): string | undefined {
    return this.hasModuleFilter() ? this.queryModule() : undefined;
  }
}
