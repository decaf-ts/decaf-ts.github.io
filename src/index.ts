/**
 * @module web-page
 * @description Entry point for the decaf pure-web-page application library surface.
 * @summary Exposes the site models, per-locale seed data, seed builder and the
 * seeding {@link SiteService} used by the Angular application (`src/main.ts`).
 */

export * from "./app/models/SiteItem";
export * from "./app/structure/Section";
export * from "./app/structure/WebAppPage";
export * from "./app/structure/WebApp";
export * from "./app/models/ModuleDoc";

export * from "./app/seed/i18n-data";
export * from "./app/seed/site.seed";

export * from "./app/services/site.service";

/**
 * @const VERSION
 * @name VERSION
 * @description Represents the current version of the package.
 * @summary Replaced during the release build.
 */
export const VERSION = "0.0.0";
