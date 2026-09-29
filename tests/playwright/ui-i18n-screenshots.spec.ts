// Mandatory `decaf-ts/tests/ui-i18n-screenshots` Playwright suite.
//
// Derived from `skills/decaf-ts/tests/ui-i18n-screenshots`'s
// `references/navigation-test.template.ts`. It produces both plain-view
// user-guide screenshots (normal mode) and bordered/numbered localization
// screenshots (report mode) for every routed page of the built web-page app.
//
// Report mode without touching production source
// ---------------------------------------------
// The skill's canonical report mode boots the app with i18n disabled through a
// bootstrap-level flag (flipbored: `FLIPBORED__I18N__ENABLED=false`; for-angular:
// `globalThis.DECAF__I18N__ENABLED=false`). This app does not read such a flag:
// `src/app/app.config.ts` calls `provideDecafI18nConfig(...)` without the
// `enabled` argument and never consults `globalThis.DECAF__I18N__ENABLED`, so
// `I18nLoader.enabled` is always `true`. Editing `app.config.ts` is out of scope
// for this test ticket (the issue forbids production changes unless a defect is
// proven), so report mode is produced test-side instead: every i18n resource
// request is intercepted and answered with `{}`, which makes ngx-translate
// `TranslateService.instant(key)` return the key itself, so every `| translate`
// element renders its visible translation key -- exactly what the
// `.dcf-translation-key` wrapper shows when the flag is off.
//
// When the app later wires a bootstrap i18n flag, replace `installEmptyI18nRoutes`
// in `openScenario` with that flag and the `.dcf-translation-key` wrapper becomes
// the primary selector automatically (see `applyReportOverlay`).
//
// Completeness rule: SCENARIOS must list every page AND every distinct variant a
// real user can reach. The routed surfaces are the 11 routes in
// `src/app/app.routes.ts`; `showcase/:id` has a successful (known highlight) and a
// not-found (unknown id) variant, and the nav locale menu is a popup variant, so
// the 13 scenarios below cover every distinct rendered surface.

import { test, type Page } from '@playwright/test';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  APP_ROUTE,
  SHOWCASE_DETAIL_ID,
  installAppFontRoutes,
  installEmptyI18nRoutes,
} from './fixtures';

const isReportMode = process.env['UI_REPORT_MODE'] === 'true';

// DecafTranslatePipe's visible key wrapper when i18n is disabled:
//   `<div class="dcf-translation-key">the.translation.key</div>`
// When the app grows a bootstrap flag this becomes the primary selector; until
// then report mode renders keys as plain text and the overlay falls back to
// matching element text against the known key set (see `applyReportOverlay`).
const TRANSLATABLE_WRAPPER_SELECTOR = '.dcf-translation-key';

// The app paints its page composition asynchronously after the route selectors
// resolve. Give it a short settle so the capture is the real UI, not a transient
// paint. Capture timing only.
const SCREENSHOT_SETTLE_MS = 1200;

const PROJECT_ROOT = fileURLToPath(new URL('../../', import.meta.url));
const OUTPUT_ROOT = path.join(PROJECT_ROOT, 'workdocs', 'screenshots');
const I18N_DIR = path.join(PROJECT_ROOT, 'src', 'assets', 'i18n');

/**
 * Every translation key the app ships, unioned across all four locale resources.
 * Used by the report-mode fallback to recognise an element whose visible text is a
 * translation key (the interception renders the raw key as element text).
 */
function loadTranslationKeys(): string[] {
  const keys = new Set<string>();
  const walk = (value: unknown, prefix: string): void => {
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        walk(v, prefix ? `${prefix}.${k}` : k);
      }
    } else if (prefix) {
      keys.add(prefix);
    }
  };
  for (const code of ['en_us', 'en_en', 'pt_br', 'pt_pt']) {
    try {
      walk(JSON.parse(readFileSync(path.join(I18N_DIR, `${code}.json`), 'utf8')), '');
    } catch {
      // Missing locale resource is not fatal; the union of the rest still works.
    }
  }
  return [...keys];
}

const TRANSLATION_KEYS = loadTranslationKeys();

interface PageScenario {
  /** Stable id used in screenshot filenames and the mapping file. */
  id: string;
  /** Human-readable description, preserved verbatim into the mapping file. */
  description: string;
  /** Route path relative to the app root (`''` for the index). */
  appPath: string;
  /** Optional extra interaction after the page settles. */
  after?: (page: Page) => Promise<void>;
}

const SCENARIOS: PageScenario[] = [
  { id: 'index', description: 'Home -- hero, module marquee and CTA', appPath: '' },
  { id: 'modules', description: 'Modules -- browsable module grid', appPath: 'modules' },
  { id: 'features', description: 'Features -- feature highlights', appPath: 'features' },
  { id: 'tutorials', description: 'Tutorials -- guided tutorial list', appPath: 'tutorials' },
  { id: 'examples', description: 'Examples -- code examples list', appPath: 'examples' },
  {
    id: 'documentation',
    description: 'Documentation hub -- round-2 documentation landing page',
    appPath: 'documentation',
  },
  {
    id: 'showcase',
    description: 'Showcase -- round-2 highlights grid',
    appPath: 'showcase',
  },
  {
    id: 'showcase-detail',
    description: `Showcase detail (${SHOWCASE_DETAIL_ID}) -- highlight with live demo and code`,
    appPath: `showcase/${SHOWCASE_DETAIL_ID}`,
  },
  {
    id: 'showcase-detail-not-found',
    description: 'Showcase detail -- unknown id renders the not-found state',
    appPath: 'showcase/__ui-i18n-unknown__',
  },
  { id: 'apps', description: 'Apps -- round-2 apps built with Decaf', appPath: 'apps' },
  { id: 'news', description: 'News -- latest releases page', appPath: 'news' },
  { id: 'community', description: 'Community -- round-2 community page', appPath: 'community' },
  {
    id: 'locale-menu',
    description: 'Navigation locale menu -- open language popup',
    appPath: 'documentation',
    after: async (page) => {
      const button = page.locator('.site-nav__locale-button');
      await button.waitFor({ state: 'visible' });
      await button.click();
      await page.waitForSelector('.site-nav__locale-option', { state: 'visible' });
    },
  },
];

interface ScreenshotRecord {
  id: string;
  description: string;
  mode: 'normal' | 'report';
  file: string;
  numbering?: Array<{ number: number; key: string }>;
}

async function applyReportOverlay(
  page: Page,
): Promise<Array<{ number: number; key: string }>> {
  return page.evaluate(
    ({ wrapperSelector, keys }) => {
      const keySet = new Set(keys as string[]);
      const wrappers = Array.from(document.querySelectorAll(wrapperSelector));

      let elements: Element[];
      if (wrappers.length) {
        elements = wrappers;
      } else {
        const all = Array.from(document.querySelectorAll('*'));
        const matches = all.filter((el) => {
          const text = (el.textContent ?? '').trim();
          if (!text || !keySet.has(text)) return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
        // Keep only the innermost match for each key so a key is numbered once.
        elements = matches.filter(
          (el) => !matches.some((other) => other !== el && el.contains(other)),
        );
      }

      return elements.map((el, index) => {
        const number = index + 1;
        const key = (el.textContent ?? '').trim();
        const rect = el.getBoundingClientRect();

        const badge = document.createElement('div');
        badge.textContent = String(number);
        badge.setAttribute('data-ui-report-badge', 'true');
        badge.style.position = 'absolute';
        badge.style.left = `${rect.left + window.scrollX}px`;
        badge.style.top = `${rect.top + window.scrollY - 14}px`;
        badge.style.background = '#ff0055';
        badge.style.color = '#fff';
        badge.style.font = '10px/1.2 monospace';
        badge.style.padding = '1px 4px';
        badge.style.zIndex = '999999';
        document.body.appendChild(badge);

        const outline = document.createElement('div');
        outline.setAttribute('data-ui-report-outline', 'true');
        outline.style.position = 'absolute';
        outline.style.left = `${rect.left + window.scrollX}px`;
        outline.style.top = `${rect.top + window.scrollY}px`;
        outline.style.width = `${rect.width}px`;
        outline.style.height = `${rect.height}px`;
        outline.style.border = '1px solid #ff0055';
        outline.style.pointerEvents = 'none';
        outline.style.zIndex = '999998';
        document.body.appendChild(outline);

        return { number, key };
      });
    },
    { wrapperSelector: TRANSLATABLE_WRAPPER_SELECTOR, keys: TRANSLATION_KEYS },
  );
}

async function openScenario(page: Page, scenario: PageScenario): Promise<void> {
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await installAppFontRoutes(page);
  if (isReportMode) {
    // Registered AFTER the app document route in installAppFontRoutes so it wins
    // (Playwright matches the most recently registered matching route first).
    await installEmptyI18nRoutes(page);
  }
  await page.goto(APP_ROUTE(scenario.appPath, 'en_us'), { waitUntil: 'load' });
  await page.waitForSelector('app-site-page, app-showcase-detail', {
    state: 'attached',
    timeout: 15_000,
  });
  await page.waitForTimeout(SCREENSHOT_SETTLE_MS);
  if (scenario.after) await scenario.after(page);
}

test.describe('UI i18n screenshots', () => {
  const records: ScreenshotRecord[] = [];

  for (const scenario of SCENARIOS) {
    test(`${scenario.id} -- ${scenario.description}`, async ({ page }) => {
      await openScenario(page, scenario);

      let numbering: Array<{ number: number; key: string }> | undefined;
      if (isReportMode) {
        numbering = await applyReportOverlay(page);
      }

      const mode = isReportMode ? 'report' : 'normal';
      const outDir = path.join(OUTPUT_ROOT, mode);
      mkdirSync(outDir, { recursive: true });
      const file = path.join(outDir, `${scenario.id}.png`);
      await page.screenshot({ path: file, fullPage: true });

      records.push({
        id: scenario.id,
        description: scenario.description,
        mode,
        file: path.relative(OUTPUT_ROOT, file),
        numbering,
      });
    });
  }

  test.afterAll(async () => {
    // Completeness check: every declared scenario must have produced a record.
    const missing = SCENARIOS.filter((s) => !records.some((r) => r.id === s.id));
    if (missing.length > 0) {
      throw new Error(
        `UI i18n screenshot test did not cover: ${missing.map((s) => s.id).join(', ')}`,
      );
    }

    const mode = isReportMode ? 'report' : 'normal';
    const mappingPath = path.join(OUTPUT_ROOT, mode, 'mapping.json');
    writeFileSync(mappingPath, JSON.stringify(records, null, 2));
  });
});
