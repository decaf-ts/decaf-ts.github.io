import { Component, Input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { SiteItem } from '../../models/SiteItem';
import { SafeHtmlPipe } from '../safe-html.pipe';

/**
 * @module app/components/VisualPanelComponent
 * @description Renders the showcase visual placeholder panel.
 * `grade == true` renders the light (white) panel with the grade demo label.
 */

/**
 * @description Angular component rendering the showcase visual placeholder panel.
 * @summary Displays the `icon` and `titleKey` of a showcase {@link SiteItem} in a rounded
 * placeholder panel. When `grade` is `true` a light (white/`text-gray-500`) variant is
 * shown; otherwise the red (`text-red-400`) variant from the www-mock design.
 * @class
 * @example
 * <visual-panel [item]="visual" [grade]="true"></visual-panel>
 */
@Component({
  selector: 'visual-panel',
  standalone: true,
  imports: [TranslatePipe, SafeHtmlPipe],
  templateUrl: './visual-panel.component.html',
  styleUrl: './visual-panel.component.scss',
})
export class VisualPanelComponent {
  /**
   * @description The showcase {@link SiteItem} whose icon and label are displayed.
   */
  @Input() item!: SiteItem;
  /**
   * @description When `true` renders the light grade panel, else the red showcase panel.
   */
  @Input() grade: boolean = false;

  /**
   * @description The panel surface classes depending on the grade variant.
   * @returns {string} Panel + circle + label color utility classes.
   */
  panelClass(): string {
    return this.grade
      ? 'bg-white text-gray-500'
      : 'bg-red-50 text-red-400';
  }
}
