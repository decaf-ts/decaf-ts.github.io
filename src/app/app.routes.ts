import { Routes } from '@angular/router';

/**
 * @module app/app.routes
 * @description Manual lazy routes for the site pages, hosted by the shared layout.
 */

/**
 * @const routes
 * @description Route table of the web-page app.
 * @summary A single host route (`''`) lazily loading the `WebAppLayoutComponent` with
 * lazy child routes for the index, modules, features, tutorials, examples,
 * documentation, showcase, apps and community pages, all handled by the shared
 * `SitePageComponent` (except the per-highlight showcase detail route, which is
 * handled by `ShowcaseDetailComponent`). Unmatched paths redirect home.
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
        path: 'documentation',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
      {
        path: 'showcase',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
      {
        path: 'showcase/:id',
        loadComponent: () =>
          import('./components/showcase-detail/showcase-detail.component').then(
            (m) => m.ShowcaseDetailComponent
          ),
      },
      {
        path: 'apps',
        loadComponent: () =>
          import('./components/site-page/site-page.component').then((m) => m.SitePageComponent),
      },
      {
        path: 'news',
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
