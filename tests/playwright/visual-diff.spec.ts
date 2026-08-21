/**
 * Visual-diff suite: every page × locale × breakpoint of the built app must
 * pixel-match the corresponding www-mock page (the preserved pixel-perfect
 * reference).
 *
 * Two-phase run:
 *   1. Generate goldens from www-mock:
 *      VISUAL_TARGET=mock npx playwright test visual-diff --update-snapshots
 *      (goldens are stored under tests/playwright/visual/ in the repo)
 *   2. Verify the app matches those goldens:
 *      VISUAL_TARGET=app npx playwright test visual-diff
 */
import { test, expect } from '@playwright/test';
import { locales, pages, breakpoints, openMock, openApp } from './fixtures';

const TARGET = process.env.VISUAL_TARGET || 'app';

test.describe(`visual-diff (target=${TARGET})`, () => {
  for (const pg of pages) {
    for (const locale of locales) {
      test.describe(`${pg.name} / ${locale.code}`, () => {
        for (const bp of breakpoints) {
          test(`${bp.name}`, async ({ page }) => {
            test.setTimeout(120_000);
            await page.setViewportSize({ width: bp.width, height: bp.height });

            if (TARGET === 'mock') {
              await openMock(page, pg.mockFile, locale.code);
            } else {
              await openApp(page, pg.name, locale.code);
            }

            const name = `${pg.name}-${locale.code}-${bp.name}.png`;
            await expect(page).toHaveScreenshot(name, {
              fullPage: true,
              animations: 'disabled',
              caret: 'hide',
              maxDiffPixelRatio: 0.03,
              maxDiffPixels: 20000,
            });
          });
        }
      });
    }
  }
});
