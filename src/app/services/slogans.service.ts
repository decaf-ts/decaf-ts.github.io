import { Injectable } from '@angular/core';

/**
 * @module app/services/SloganService
 * @description Picks per-module slogan texts from the build-time `assets/data/slogans.json`
 * catalog, mirroring the CLI module. Global pages get a random slogan; module pages get a
 * module-biased slogan (much higher probability of the current module's own slogans).
 */

interface SloganEntry {
  Slogan?: string;
  text?: string;
  Tags?: string;
}

/**
 * @description `SloganService` selects slogan strings from the per-module catalog asset.
 * @summary Loads `assets/data/slogans.json` (collected at build time from the installed
 * `@decaf-ts/*` deps) once and exposes {@link slogan} to pick a random global slogan or a
 * module-biased one for a given `@decaf-ts` module name, mirroring the CLI module's
 * weighted flattening. Entries are normalized so both `Slogan` and `text` fields resolve.
 * @class
 * @example
 * const slogan = await sloganService.slogan('for-angular');
 */
@Injectable({
  providedIn: 'root',
})
export class SloganService {
  private catalog?: Record<string, SloganEntry[]>;
  private loading?: Promise<Record<string, SloganEntry[]>>;

  /**
   * @description Weight (0..1) of the priority module's own slogans over the union.
   */
  readonly moduleBias = 0.7;

  /**
   * @description Picks a slogan, biased towards `module` when provided.
   * @param {string} [module] - Optional module name to bias the selection towards.
   * @returns {Promise<string|null>} The selected slogan text, or `null` when no catalog.
   */
  async slogan(module?: string): Promise<string | null> {
    const catalog = await this.catalogPromise();
    const modules = Object.keys(catalog);
    if (!modules.length) return null;

    let pool: SloganEntry[] = [];
    if (module && catalog[module]?.length) {
      if (Math.random() < this.moduleBias) {
        pool = catalog[module];
      }
    }
    if (!pool.length) {
      const names = Object.values(catalog).filter((v) => v.length);
      pool = names[Math.floor(Math.random() * names.length)];
    }
    const entry = pool[Math.floor(Math.random() * pool.length)];
    if (!entry) return null;
    return entry.Slogan || entry.text || null;
  }

  private catalogPromise(): Promise<Record<string, SloganEntry[]>> {
    if (this.catalog) return Promise.resolve(this.catalog);
    if (!this.loading) {
      this.loading = fetch('assets/data/slogans.json')
        .then((response) => (response.ok ? response.json() : {}))
        .catch(() => ({}))
        .then((catalog: Record<string, SloganEntry[]>) => {
          this.catalog = catalog || {};
          return this.catalog;
        })
        .finally(() => {
          this.loading = undefined;
        });
    }
    return this.loading;
  }
}
