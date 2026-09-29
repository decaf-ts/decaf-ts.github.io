import { Component, Input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { OrderDirection } from '@decaf-ts/core';
import { KeyValue } from '@decaf-ts/for-angular';
import { ShowcaseHighlight } from '../../models/ShowcaseHighlight';
import { ModuleListBase } from '../list-base/module-list.base';

/**
 * @module app/components/ShowcaseHighlightsListComponent
 * @description Renders the real decaf feature highlights (Extensible Decoration,
 * Model Centric, backend route generation, integrations, graph, task engine, auth,
 * cross-persistence, cross-UI, ...) from the `ShowcaseHighlight` RamAdapter table,
 * each linking to its detailed explanation page.
 */

/**
 * @description Angular component rendering the showcase highlight cards.
 * @summary Extends {@link ModuleListBase} so the highlights load from the
 * `ShowcaseHighlight` table via the list set query. Used both on the landing page
 * (optionally capped with `limit`) and on the `/showcase` page; each card links to
 * `/showcase/:id` for the full explanation and live demo.
 * @class
 * @extends ModuleListBase
 * @example
 * <app-showcase-highlights-list></app-showcase-highlights-list>
 */
@Component({
  selector: 'app-showcase-highlights-list',
  standalone: true,
  imports: [RouterLink, TranslatePipe, NgTemplateOutlet],
  templateUrl: './showcase-highlights-list.component.html',
  styleUrl: './showcase-highlights-list.component.scss',
})
export class ShowcaseHighlightsListComponent extends ModuleListBase {
  /**
   * @description Model class name resolved by the list query against the RamAdapter.
   */
  override modelName = 'ShowcaseHighlight';

  override sortBy = 'order';
  override sortDirection: OrderDirection = OrderDirection.ASC;

  /**
   * @description Whether to render every highlight in a seamless marquee track
   * instead of a static grid.
   * @summary Used on the landing page so all twelve highlights remain reachable
   * (consistent with the site's other marquees); the `/showcase` page renders the
   * full static grid. The marquee pauses on hover so the cards stay clickable.
   */
  @Input() marquee = false;

  /**
   * @description The highlight model of a mapped list row.
   * @param {object} item - The mapped list row.
   * @returns {ShowcaseHighlight} The underlying model.
   */
  highlight(item: KeyValue): ShowcaseHighlight {
    return item['model'] as ShowcaseHighlight;
  }

  /**
   * @description The module names demonstrated by a highlight.
   * @param {ShowcaseHighlight} highlight - The highlight record.
   * @returns {string[]} The module names.
   */
  modulesOf(highlight: ShowcaseHighlight): string[] {
    return (highlight.modules || '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean);
  }

  /**
   * @description The first code snippet title of a highlight, when present.
   * @param {ShowcaseHighlight} highlight - The highlight record.
   * @returns {string} The snippet title, else `''`.
   */
  firstExampleTitle(highlight: ShowcaseHighlight): string {
    return highlight.codeExamples?.[0]?.title || '';
  }
}
