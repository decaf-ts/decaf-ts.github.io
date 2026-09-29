import { Component, Input } from '@angular/core';
import {
  ListComponent,
  ModelBuilderComponent,
  ModelRendererComponent,
} from '@decaf-ts/for-angular';
import {
  ShowcaseCrossUiModel,
  ShowcaseValidationModel,
} from '../../models/showcase-reference.models';

/**
 * @module app/components/ShowcaseLiveComponent
 * @description Live, dependency-free `@decaf-ts/for-angular` UI examples embedded in
 * the showcase highlight detail pages.
 * @summary Renders the real for-angular machinery for the three board-requested
 * highlights: the model builder with live rendering, a decaf list + crud form for the
 * cross-UI reference model and the decorator-driven validation form. Reusing the
 * library components (never reimplementing them) proves the model-first promise on the
 * site itself.
 */

/**
 * @description Angular component rendering the live for-angular UI examples.
 * @class
 * @example
 * <app-showcase-live kind="model"></app-showcase-live>
 */
@Component({
  selector: 'app-showcase-live',
  standalone: true,
  imports: [ModelBuilderComponent, ModelRendererComponent, ListComponent],
  templateUrl: './showcase-live.component.html',
  styleUrl: './showcase-live.component.scss',
})
export class ShowcaseLiveComponent {
  /**
   * @description Live example selector, mirroring the highlight `demo.kind`.
   */
  @Input() kind = '';

  /**
   * @description Cross-UI reference model rendered as a list and a crud form.
   */
  readonly crossUiModel = new ShowcaseCrossUiModel({
    name: 'Graph engine',
    summary: 'Typed workflows rendered from the model.',
    category: 'core',
  });

  /**
   * @description Direct list data so the list renders without a backend.
   */
  readonly crossUiData = [
    this.crossUiModel,
    new ShowcaseCrossUiModel({
      name: 'Repository queries',
      summary: 'A fluent query DSL generated from metadata.',
      category: 'backend',
    }),
    new ShowcaseCrossUiModel({
      name: 'Task engine',
      summary: 'Background tasks with progress events.',
      category: 'core',
    }),
  ];

  /**
   * @description Maps each reference model to the list item's title/description.
   */
  readonly crossUiMapper = (item: ShowcaseCrossUiModel): Record<string, string> => ({
    title: item.name,
    description: item.summary,
  });

  /**
   * @description Decorator-driven validation form model.
   */
  readonly validationModel = new ShowcaseValidationModel();
}
