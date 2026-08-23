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
import * as fs from 'node:fs';
import * as path from 'node:path';
import { locales, pages, breakpoints, openMock, openApp, prepareFullCapture } from './fixtures';

const TARGET = process.env.VISUAL_TARGET || 'app';
const VISUAL_DIR = path.resolve(process.cwd(), 'tests/playwright/visual');

/** Read the stored mock golden's pixel height so the app capture matches the
 *  reference dimensions (height gaps become pixel diffs, not hard mismatches).
 *  Playwright sanitises snapshot names by replacing every char outside
 *  [a-zA-Z0-9-] with `-` (so locale codes like `en_en` become `en-en`); apply
 *  the same transform to locate the golden file on disk. */
function goldenHeight(name: string): number | undefined {
  const stem = name.replace(/\.png$/, '').replace(/[^a-zA-Z0-9-]/g, '-');
  const p = path.join(VISUAL_DIR, stem + '.png');
  if (!fs.existsSync(p)) return undefined;
  const b = fs.readFileSync(p);
  return b.readUInt32BE(20);
}

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

            // Grow the viewport to the full content height and capture a plain
            // viewport screenshot (width == breakpoint width), instead of
            // `fullPage` whose CDP contentSize includes unclipped composited
            // marquee layers and inflates the golden width past the viewport.
            // For the app, pin the height to the mock golden's height so any
            // content-height gap surfaces as a tolerable pixel diff.
            const name = `${pg.name}-${locale.code}-${bp.name}.png`;
            const fixedHeight = TARGET === 'app' ? goldenHeight(name) : undefined;
            await prepareFullCapture(page, bp.width, fixedHeight);

            await expect(page).toHaveScreenshot(name, {
              fullPage: false,
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
