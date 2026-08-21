import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

/**
 * @module app/RootComponent
 * @description Application root component, hosts the routed site layout.
 */

/**
 * @description Angular root component of the web-page application.
 * @summary Hosts the routed site tree: it only renders the `<router-outlet>` that mounts
 * the shared `WebAppLayoutComponent` (which in turn hosts the navigation chrome and the
 * routed site pages).
 * @class
 * @example
 * // mounted as the root selector in src/index.html
 */
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `<router-outlet></router-outlet>`,
})
export class AppComponent {}
