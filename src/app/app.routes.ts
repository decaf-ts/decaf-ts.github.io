import { Routes } from '@angular/router';

/**
 * @module app/app.routes
 * @description Manual lazy routes for the six site pages, hosted by the shared layout.
 */

/**
 * @const routes
 * @description Route table of the web-page app.
 * @summary A single host route (`''`) lazily loading the `WebAppLayoutComponent` with six
 * lazy child routes for the index, modules, features, tutorials, examples and community
 * pages, all handled by the shared `SitePageComponent`. Unmatched paths redirect home.
 * @example
 * import { provideRouter } from '@angular/router';
 * await provideRouter(routes);
 * @memberOf module:app/app.routes
 */
export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/web-app-layout/web-app-layout.component').then((m) => m.WebAppLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
      {
        path: 'modules',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
      {
        path: 'features',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
      {
        path: 'tutorials',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
      {
        path: 'examples',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
      {
        path: 'community',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
