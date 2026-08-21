import { provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppConfig } from './app/app.config';

/**
 * @module main
 * @description Angular bootstrap entry point of the web-page app.
 * @summary Bootstraps the root {@link AppComponent} with the providers gathered from the
 * `AppConfig` (Ionic, decaf RamAdapter + i18n, router, transitions and the singleton
 * {@link SiteService}). Failures are logged to the console.
 */

bootstrapApplication(AppComponent, {
  providers: [provideZoneChangeDetection({ eventCoalescing: true }), ...AppConfig.providers],
}).catch((err) => console.error(err));
