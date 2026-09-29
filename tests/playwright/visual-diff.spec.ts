/**
 * Visual-regression suite: every page × locale × breakpoint of the built app is
 * compared against the committed golden screenshots under
 * `tests/playwright/visual/`.
 *
 * The goldens are captured from the **app itself** (`VISUAL_TARGET=app`). The app
 * is the design source of truth: the round-2 landing/modules/features redesign was
 * approved by the board (SAA-1918/SAA-1919) and superseded the round-1 `www-mock`
 * static replica, which is retained in the repo only as a historical reference.
 * Baselining the app's own approved output keeps full page × locale × breakpoint
 * coverage without the hand-maintained, non-deterministic `www-mock` Tailwind
 * replica (whose index capture drifts run-to-run). Only the five pages that have a
 * `www-mock` counterpart are visual-diffed; the round-2 routes (`documentation`,
 * `showcase`, `showcase/:id`, `apps`, `news`) and `community` have no mock
 * reference and are covered by the e2e + ui-i18n suites instead.
 *
 * Two-phase run:
 *   1. Generate/refresh goldens from the approved app:
 *      npm run test:visual:update
 *      (goldens are stored under tests/playwright/visual/ in the repo)
 *   2. Verify the app still matches those goldens:
 *      npm run test:visual
 *
 * `VISUAL_TARGET=mock` is kept for historical reference/parity checks against
 * the round-1 mock; it is not used to generate the committed goldens.
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
              await openApp(page, pg.appPath, locale.code);
            }

            // Grow the viewport to the full content height and capture a plain
            // viewport screenshot (width == breakpoint width), instead of
            // `fullPage` whose CDP contentSize includes unclipped composited
            // marquee layers and inflates the golden width past the viewport.
            // When verifying the app, pin the height to the committed golden's
            // height so any content-height gap surfaces as a tolerable pixel diff.
            // While (re)generating goldens, capture the app's natural height so
            // a legitimate content-height change is recorded rather than clipped.
            const name = `${pg.name}-${locale.code}-${bp.name}.png`;
            const updating = test.info().config.updateSnapshots !== 'none';
            const fixedHeight =
              TARGET === 'app' && !updating ? goldenHeight(name) : undefined;
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
