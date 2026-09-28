import { SiteLocale } from './i18n-data';

/**
 * @module app/seed/link-labels
 * @description Localized labels for the module link buttons rendered by the module
 * list components. Kept in the app seed layer (not the `assets/i18n` files, which the
 * content team maintains) so the frontend can label the dynamic module links without
 * touching the content-owned locale assets.
 */

/**
 * @description The module link kinds exposed by the content schema `links{...}`.
 * @typedef {('repo'|'docs'|'githubPages'|'storyboard')} ModuleLinkKey
 * @memberOf module:app/seed/link-labels
 */
export type ModuleLinkKey = 'repo' | 'docs' | 'githubPages' | 'storyboard';

/**
 * @description Order the module links are rendered in, so the UI is stable
 * regardless of the object key order in the JSON asset.
 * @const MODULE_LINK_ORDER
 * @type {ModuleLinkKey[]}
 * @memberOf module:app/seed/link-labels
 */
export const MODULE_LINK_ORDER: ModuleLinkKey[] = ['repo', 'docs', 'githubPages', 'storyboard'];

/**
 * @description Per-locale labels for every module link kind.
 * @const MODULE_LINK_LABELS
 * @type {Record<SiteLocale, Record<ModuleLinkKey, string>>}
 * @memberOf module:app/seed/link-labels
 */
const MODULE_LINK_LABELS: Record<SiteLocale, Record<ModuleLinkKey, string>> = {
  en_en: {
    repo: 'Repository',
    docs: 'Documentation',
    githubPages: 'GitHub Pages',
    storyboard: 'Storyboard',
  },
  en_us: {
    repo: 'Repository',
    docs: 'Documentation',
    githubPages: 'GitHub Pages',
    storyboard: 'Storyboard',
  },
  pt_br: {
    repo: 'Repositório',
    docs: 'Documentação',
    githubPages: 'GitHub Pages',
    storyboard: 'Storyboard',
  },
  pt_pt: {
    repo: 'Repositório',
    docs: 'Documentação',
    githubPages: 'GitHub Pages',
    storyboard: 'Storyboard',
  },
};

/**
 * @description Resolves the localized label of a module link kind.
 * @summary Falls back to the English label, then to the raw key, so an unknown
 * locale never blanks a button.
 * @function moduleLinkLabel
 * @param {ModuleLinkKey} key - The link kind.
 * @param {string} locale - The active locale code.
 * @returns {string} The localized link label.
 * @memberOf module:app/seed/link-labels
 */
export function moduleLinkLabel(key: ModuleLinkKey, locale: string): string {
  const labels = MODULE_LINK_LABELS[locale as SiteLocale] ?? MODULE_LINK_LABELS.en_us;
  return labels[key] ?? MODULE_LINK_LABELS.en_us[key] ?? key;
}
