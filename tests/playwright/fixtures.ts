import { expect } from '@playwright/test';

/**
 * Shared site, locale, page and breakpoint definitions plus deterministic
 * rendering helpers for the web-page Playwright suite.
 */

export const APP_URL = 'http://127.0.0.1:8210';
export const MOCK_URL = 'http://127.0.0.1:8211';

export const locales = [
  { code: 'en_us', hero: 'Brewed for Builders.', navFeatures: 'Features', navModules: 'Modules', modulesTitle: 'Explore Modules', examplesTitle: 'Examples for {module}', docTitle: 'Decaf - Hero Section' },
  { code: 'en_en', hero: 'Brewed for Builders.', navFeatures: 'Features', navModules: 'Modules', modulesTitle: 'Explore Modules', examplesTitle: 'Examples for {module}', docTitle: 'Decaf - Hero Section' },
  { code: 'pt_br', hero: 'Preparado para Criadores.', navFeatures: 'Recursos', navModules: 'Módulos', modulesTitle: 'Explorar Módulos', examplesTitle: 'Exemplos para {module}', docTitle: 'Decaf - Seção Hero' },
  { code: 'pt_pt', hero: 'Preparado para Criadores.', navFeatures: 'Funcionalidades', navModules: 'Módulos', modulesTitle: 'Explorar Módulos', examplesTitle: 'Exemplos para {module}', docTitle: 'Decaf - Secção Hero' },
];

export const pages = [
  { name: 'index', appPath: '', mockFile: 'index.html' },
  { name: 'modules', appPath: 'modules', mockFile: 'modules.html' },
  { name: 'features', appPath: 'features', mockFile: 'features.html' },
  { name: 'tutorials', appPath: 'tutorials', mockFile: 'tutorials.html' },
  { name: 'examples', appPath: 'examples', mockFile: 'examples.html' },
];

// All routed SPA pages (the www-mock reference has no community.html, so the
// community route is covered by the e2e suite only, not the visual diff).
export const appPages = [
  ...pages,
  { name: 'community', appPath: 'community', mockFile: null as string | null },
];

export const breakpoints = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 390, height: 844 },
];

export const APP_ROUTE = (pageName: string, localeCode: string) =>
  pageName === 'index'
    ? `${APP_URL}/?lang=${localeCode}`
    : `${APP_URL}/${pageName}?lang=${localeCode}`;

/**
 * Freeze any rAF-driven marquee (the www-mock DecafMarquee and the app's CSS-keyframe
 * marquee both animate a track with `will-change: transform` and pause on `mouseenter`)
 * so that screenshots are deterministic. Also strips window `resize` listeners that
 * would re-layout the marquee on viewport resize (fullPage screenshots resize the
 * viewport, and re-initializing from the already-marquee'd DOM compounds it).
 */
export async function freezeMarquees(page) {
  await page.evaluate(() => {
    const tracks = Array.from(document.querySelectorAll('*')).filter((el) => {
      const s = getComputedStyle(el);
      return s.willChange === 'transform' && el.parentElement;
    });
    for (const track of tracks) {
      const wrap = track.parentElement;
      track.style.transform = 'translate3d(0,0,0)';
      track.style.transition = 'none';
      wrap.dispatchEvent(new MouseEvent('mouseenter', { bubbles: false }));
    }
    if (window.__decafResizeHandlers) {
      window.__decafResizeHandlers.forEach((fn) => {
        try {
          window.removeEventListener('resize', fn, { capture: false });
        } catch {}
      });
    }
    return tracks.length;
  });
}

/** Override window.addEventListener before page scripts run so every resize
 *  listener is tracked and can be stripped by freezeMarquees. */
export async function trackResizeListeners(page) {
  await page.addInitScript(() => {
    if (window.__decafResizeTracked) return;
    window.__decafResizeTracked = true;
    window.__decafResizeHandlers = [];
    const origAdd = window.addEventListener.bind(window);
    window.addEventListener = (type, fn, opts) => {
      if (type === 'resize') {
        if (!window.__decafResizeHandlers.includes(fn)) {
          window.__decafResizeHandlers.push(fn);
        }
      }
      return origAdd(type, fn, opts);
    };
  });
}

/** Wait for web fonts and give the Tailwind Play CDN (in the mock) time to compile. */
async function settle(page) {
  await page
    .evaluate(() => document.fonts.ready.then(() => true).catch(() => true))
    .catch(() => {});
  await page.waitForTimeout(400);
}

/** Open a www-mock page, switching to the requested locale via DecafLocale. */
export async function openMock(page, mockFile, localeCode) {
  await trackResizeListeners(page);
  await page.goto(`${MOCK_URL}/${mockFile}`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.DecafLocale?.setLocale === 'function');
  if (localeCode !== 'en_us') {
    await page.evaluate(
      async (code) => {
        await window.DecafLocale.setLocale(code);
      },
      localeCode
    );
  }
  await settle(page);
  await freezeMarquees(page);
}

/** Open the built app at a route using `?lang=` for the requested locale. */
export async function openApp(page, pageName, localeCode) {
  await trackResizeListeners(page);
  await page.goto(APP_ROUTE(pageName, localeCode), { waitUntil: 'load' });
  await page.waitForSelector('.app-layout__locale-button', { state: 'attached' });
  await settle(page);
  await freezeMarquees(page);
}

/**
 * Switch the built app to the requested locale through its button-based
 * locale menu (the reworked layout renders a fixed locale button instead of
 * the old `<select class="locale-select">` used by the www-mock).
 */
export async function switchLocaleApp(page, localeCode) {
  const button = page.locator('.app-layout__locale-button');
  await button.waitFor({ state: 'visible' });
  await button.click();
  const option = page.locator('.app-layout__locale-option', {
    hasText: localeCode,
  });
  await option.click();
  await page.waitForTimeout(600);
}

export function visualExpect(page) {
  return expect(page);
}

/**
 * Capture the full page at the breakpoint's viewport WIDTH without relying on
 * Playwright `fullPage` (which uses CDP `contentSize` — the unclipped painted
 * bounds of composited layers, e.g. the marquee `transform` track, and so
 * ignores ancestor `overflow: hidden`, inflating the captured width far past
 * the viewport). Instead this grows the viewport height to the document's full
 * content height and takes a plain viewport screenshot, so the capture width is
 * always exactly the breakpoint width and composited horizontal overflow is
 * clipped by the viewport. The marquee is first frozen (see freezeMarquees) and
 * CSS animations are disabled at capture time so the marquee band is
 * deterministic and comparable between the mock and the app.
 *
 * When `fixedHeight` is given (the app-verification path passes the mock
 * golden's pixel height), the viewport is set to that height so the captured
 * image dimensions always match the golden; any height gap then surfaces as a
 * pixel diff (counted against the suite tolerance) rather than a hard
 * dimension-mismatch failure — small rounding gaps pass, large content gaps
 * fail.
 */
export async function prepareFullCapture(page, width, fixedHeight) {
  // Freeze elements whose min-height resolves to the viewport height (i.e.
  // `min-height: 100vh`) to their current pixel height before resizing the
  // viewport.  Without this, resizing the viewport to the full content height
  // causes 100vh to expand to that height, inflating hero sections and pushing
  // all subsequent content below the screenshot capture area.
  await page.evaluate(() => {
    const innerH = window.innerHeight;
    const els = document.querySelectorAll('*');
    for (const el of els) {
      const s = getComputedStyle(el);
      const mh = parseInt(s.minHeight, 10);
      if (mh === innerH && s.minHeight.endsWith('px')) {
        el.style.minHeight = Math.round(el.getBoundingClientRect().height) + 'px';
      }
    }
  });

  let fullHeight;
  if (fixedHeight && fixedHeight > 0) {
    fullHeight = fixedHeight;
  } else {
    fullHeight = await page.evaluate(
      () => Math.ceil(Math.max(document.documentElement.scrollHeight, document.body.scrollHeight))
    );
  }
  await page.setViewportSize({ width, height: fullHeight });
  return fullHeight;
}
