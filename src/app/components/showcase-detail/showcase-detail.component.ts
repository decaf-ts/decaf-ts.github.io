import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { ShowcaseHighlight } from '../../models/ShowcaseHighlight';
import { SiteService } from '../../services/site.service';
import { LocaleService } from '../../services/locale.service';
import { MarkdownPipe } from '../markdown.pipe';
import { ShowcaseDemoComponent } from '../showcase-demo/showcase-demo.component';
import { ShowcaseLiveComponent } from '../showcase-live/showcase-live.component';

/**
 * @module app/components/ShowcaseDetailComponent
 * @description Renders one showcase highlight's detailed explanation page
 * (`/showcase/:id`): the formatted detail, the decaf modules it demonstrates,
 * a live demo UI and the real code snippets from the content pipeline.
 */

/**
 * @description Angular component rendering a single showcase highlight detail.
 * @summary Reads the highlight from the `ShowcaseHighlight` RamAdapter table by the
 * `:id` route param, renders the formatted markdown explanation, the modules used,
 * the interactive demo and every real code snippet. Unknown ids render a graceful
 * not-found state instead of throwing.
 * @class
 * @example
 * <app-showcase-detail></app-showcase-detail>
 */
@Component({
  selector: 'app-showcase-detail',
  standalone: true,
  imports: [RouterLink, TranslatePipe, MarkdownPipe, ShowcaseDemoComponent, ShowcaseLiveComponent],
  templateUrl: './showcase-detail.component.html',
  styleUrl: './showcase-detail.component.scss',
})
export class ShowcaseDetailComponent implements OnInit {
  /**
   * @description The resolved highlight, or `undefined` when unknown/loading.
   */
  highlight?: ShowcaseHighlight;

  /**
   * @description Whether the highlight has been resolved (successfully or not).
   */
  loaded = false;

  constructor(
    private route: ActivatedRoute,
    private siteService: SiteService,
    private localeService: LocaleService
  ) {}

  async ngOnInit(): Promise<void> {
    await this.localeService.initialize();
    const id = this.route.snapshot.paramMap.get('id') || '';
    if (id) {
      this.highlight = await this.siteService.getHighlight(id);
    }
    this.loaded = true;
  }

  /**
   * @description The live for-angular example kind of the highlight, when it has one.
   * @summary The model-centric, cross-UI and validation highlights render real
   * `@decaf-ts/for-angular` components; every other kind keeps the
   * dependency-free {@link ShowcaseDemoComponent}.
   * @returns {string} The live kind (`model`/`ui`/`forms`), else `''`.
   */
  liveKind(): string {
    const kind = this.highlight?.demoKind || '';
    return ['model', 'ui', 'forms'].includes(kind) ? kind : '';
  }

  /**
   * @description The module names demonstrated by the highlight.
   * @returns {string[]} The module names.
   */
  modules(): string[] {
    return (this.highlight?.modules || '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
  }
}
