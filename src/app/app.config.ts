import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { RamAdapter, RamFlavour } from '@decaf-ts/core/ram';
import {
  provideDecafDbAdapter,
  provideDecafDynamicComponents,
  provideDecafI18nConfig,
  provideDecafPageTransition,
} from '@decaf-ts/for-angular';
import { routes } from './app.routes';
import { SiteService } from './services/site.service';
import { SiteSectionComponent } from './components/site-section/site-section.component';
import { WebAppPageComponent } from './components/web-app-page/web-app-page.component';

/**
 * @module app/app.config
 * @description Angular application configuration wiring for the web-page app.
 * @summary Exposes the `AppConfig` constant that configures Ionic, the decaf RamAdapter
 * database, routing, page transitions, the {@link SiteService} singleton, the decaf i18n
 * setup and the dynamic components (\{@link SiteSectionComponent}, {WebAppPageComponent})
 * registered with the decaf rendering engine, plus the {@link DbAdapterFlavour} alias.
 */

/**
 * @const DbAdapterFlavour
 * @description Alias of the ram adapter flavour used by `provideDecafDbAdapter`.
 * @memberOf module:app/app.config
 */
export const DbAdapterFlavour = RamFlavour;

/**
 * @const AppConfig
 * @description Angular application configuration for the web-page app.
 * @summary Provides the Ionic setup, the decaf RamAdapter-based database, routing,
 * page transitions, the singleton {@link SiteService}, the decaf i18n setup (falling back
 * over `./assets/i18n/<lang>.json`) and the dynamic render targets registered with the
 * decaf rendering engine (`SiteSectionComponent` and `WebAppPageComponent`).
 * @memberOf module:app/app.config
 */
export const AppConfig: ApplicationConfig = {
  providers: [
    provideIonicAngular({ mode: 'md' }),
    provideDecafDbAdapter(RamAdapter, { user: 'user' }),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideDecafPageTransition(),
    { provide: SiteService, useValue: new SiteService() },
    provideDecafI18nConfig(
      {
        fallbackLang: 'en_en',
        lang: 'en_en',
      },
      [{ prefix: './assets/i18n/', suffix: '.json' }]
    ),
    provideDecafDynamicComponents(SiteSectionComponent, WebAppPageComponent),
  ],
};
