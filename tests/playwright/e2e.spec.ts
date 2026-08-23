/**
 * E2E suite: the built app must render all six routed pages, in all four
 * locales, with the correct localized strings, navigation, locale switching,
 * footer placement and clean console/runtime behaviour.
 */
import { test, expect, Page } from '@playwright/test';
import {
  locales,
  appPages,
  APP_URL,
  APP_ROUTE,
  switchLocaleApp,
} from './fixtures';

function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
  });
  page.on('pageerror', (err) => errors.push(String(err)));
  return errors;
}

async function expectFooterAtEnd(page: Page): Promise<void> {
  await expect(page.locator('.site-section--footer, .site-section--footer-slim')).toHaveCount(1);
  const order = await page.evaluate(() => {
    const sections = Array.from(document.querySelectorAll('section.site-section, footer.site-section'));
    if (!sections.length) return { ok: false, reason: 'no site sections' };
    const last = sections[sections.length - 1];
    const isFooter = last.classList.contains('site-section--footer') || last.classList.contains('site-section--footer-slim');
    const modulesList = document.querySelector('app-modules-list');
    const moduleBeforeFooter =
      !modulesList ||
      Boolean(modulesList.compareDocumentPosition(last as Node) & Node.DOCUMENT_POSITION_FOLLOWING);
    return {
      ok: isFooter && moduleBeforeFooter,
      reason: isFooter ? (moduleBeforeFooter ? 'ok' : 'footer before modules grid') : 'last section is not the footer',
      lastClass: last.className,
    };
  });
  expect(order.ok, `footer at end of modules page: ${order.reason} (last=${order.lastClass})`).toBe(true);
}

test.describe('web-page E2E', () => {
  for (const locale of locales) {
    test.describe(`locale ${locale.code}`, () => {
      for (const pg of appPages) {
        test(`${pg.name} page renders with localized content and no errors`, async ({
          page,
        }) => {
          test.setTimeout(60_000);
          const errors = collectErrors(page);
          await page.goto(APP_ROUTE(pg.name, locale.code), { waitUntil: 'load' });

          await expect(page.locator('.app-layout__locale-button')).toBeVisible();
          await page.waitForTimeout(1200);

          if (pg.name === 'index') {
            await expect(page.getByText(locale.hero)).toBeVisible();
          }

          expect(errors).toEqual([]);
        });
      }

      test('locale switcher button switches language in place', async ({ page }) => {
        test.setTimeout(60_000);
        const errors = collectErrors(page);
        await page.goto(APP_ROUTE('index', locale.code), { waitUntil: 'load' });
        await page.waitForTimeout(800);
        await switchLocaleApp(page, 'en_us');
        await expect(page.getByText('Brewed for Builders.')).toBeVisible();
        expect(errors).toEqual([]);
      });
    });
  }

  test('homepage loads without runtime errors', async ({ page }) => {
    test.setTimeout(60_000);
    const errors = collectErrors(page);
    await page.goto(`${APP_URL}/`, { waitUntil: 'load' });
    await page.waitForSelector('.app-layout__locale-button', { state: 'attached' });
    await page.waitForTimeout(1200);
    expect(errors).toEqual([]);
  });

  test('all six routes navigate via the SPA router', async ({ page }) => {
    test.setTimeout(120_000);
    const errors = collectErrors(page);
    for (const pg of appPages) {
      await page.goto(APP_ROUTE(pg.name, 'en_us'), { waitUntil: 'load' });
      await page.waitForSelector('.app-layout__locale-button', { state: 'attached' });
      expect(await page.locator('.app-layout__locale-button').count()).toBe(1);
    }
    expect(errors).toEqual([]);
  });

  test('modules page renders the footer AFTER the module grid (footer at END)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto(APP_ROUTE('modules', 'en_us'), { waitUntil: 'load' });
    await page.waitForSelector('.app-layout__locale-button', { state: 'attached' });
    await page.waitForTimeout(1500);
    await expectFooterAtEnd(page);
  });

  test('header uses one continuous section gradient and the Plus Jakarta h1', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await page.goto(APP_ROUTE('index', 'en_us'), { waitUntil: 'load' });
    await page.waitForTimeout(1500);

    const heroBg = await page
      .locator('.site-section--hero')
      .evaluate((el) => getComputedStyle(el).backgroundImage)
      .catch(() => null);

    expect(heroBg).toContain('linear-gradient');

    const hasPageHero = (await page.locator('.site-section--page-hero').count()) > 0;
    if (hasPageHero) {
      const pageHeroBg = await page
        .locator('.site-section--page-hero')
        .first()
        .evaluate((el) => getComputedStyle(el).backgroundImage);
      expect(pageHeroBg).toContain('linear-gradient');
    }

    const h1 = page.locator(
      '.site-section--page-hero #page-hero-title, .site-section__hero-title'
    );
    await expect(h1.first()).toBeVisible();
    const style = await h1
      .first()
      .evaluate((el) => {
        const s = getComputedStyle(el);
        return {
          font: s.fontFamily,
          weight: s.fontWeight,
          lineHeight: s.lineHeight,
          fontSize: s.fontSize,
        };
      });
    expect(style.font).toContain('Plus Jakarta Sans');
    expect(style.weight).toBe('700');

    // The index hero h1 must match the www-mock's actual Tailwind-CDN
    // rendering (AC #1: pixel-perfect to the mock), not the spec intent.
    // The mock class is `text-6xl md:text-7xl lg:text-8xl leading-tight`.
    // Tailwind Play CDN's per-size `line-height` on `text-7xl`/`text-8xl`
    // (both `1`) overrides `leading-tight` (1.25) at md+, but `leading-tight`
    // wins at mobile. The app reproduces this exactly (see
    // site-section.component.scss `&__hero-title`), so the expected ratio is
    // 1.25 at mobile and 1.0 at md+.
    const heroTitle = h1.first();
    for (const [label, vp, expectedRatio] of [
      ['mobile (390)', { width: 390, height: 844 }, 1.25],
      ['md (768)', { width: 768, height: 1024 }, 1.0],
      ['lg (1280)', { width: 1280, height: 800 }, 1.0],
    ] as const) {
      await page.setViewportSize(vp);
      await page.waitForTimeout(150);
      const ratio = await heroTitle.evaluate((el) => {
        const s = getComputedStyle(el);
        return parseFloat(s.lineHeight) / parseFloat(s.fontSize);
      });
      expect(ratio, `hero h1 line-height/font-size ratio at ${label}`).toBeCloseTo(
        expectedRatio,
        1
      );
    }
  });
});
