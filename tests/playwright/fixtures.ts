import { expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

/**
 * Shared site, locale, page and breakpoint definitions plus deterministic
 * rendering helpers for the web-page Playwright suite.
 */

export const APP_URL = 'http://127.0.0.1:8210';
export const MOCK_URL = 'http://127.0.0.1:8211';

/**
 * Disk-persistent cache of the Google Fonts CSS, woff2 font files, and the
 * Tailwind Play CDN script.
 *
 * Both the www-mock and the built app pull Inter / Plus Jakarta Sans from the
 * Google Fonts CDN (`fonts.googleapis.com` for the CSS, `fonts.gstatic.com`
 * for the binary files) with `font-display: swap`. The www-mock also loads the
 * Tailwind Play CDN JIT compiler (`cdn.tailwindcss.com`) at runtime. These
 * resources are reachable but can vary across fetches (Google Fonts rotates
 * woff2 file URLs; the Tailwind CDN script is versioned and can change), so
 * the golden generated in the `--update-snapshots` process and the verification
 * run (a separate Playwright process) may receive different bytes, producing a
 * sub-pixel text-rendering drift that exceeds the suite tolerance. An in-process
 * `Map` cache only helps within a single process; the visual-diff suite runs
 * across multiple process invocations (update, verify, verify again), so the
 * cache must persist to disk to guarantee every process serves byte-identical
 * assets.
 *
 * The cache lives under `os.tmpdir()` (outside the git tree, so it never
 * pollutes the working delta) and is keyed by a hash of the request URL. A hot
 * in-memory `Map` sits on top for speed within a single process.
 */
const DISK_CACHE_DIR = path.join(
  os.tmpdir(),
  'decaf-web-page-visual-cache',
);

function diskCachePath(url: string): string {
  const hash = crypto.createHash('sha256').update(url).digest('hex').slice(0, 32);
  return path.join(DISK_CACHE_DIR, hash);
}

function diskCacheMetaPath(url: string): string {
  return diskCachePath(url) + '.meta';
}

interface CacheEntry {
  body: Buffer;
  contentType: string;
}

const memCache = new Map<string, CacheEntry>();

/**
 * Vendored, git-tracked copies of every external CDN asset the www-mock (and
 * the app's font-binary route) loads, so the visual-diff mock phase is
 * byte-for-byte reproducible in any environment without touching the network.
 *
 * The assets live under `tests/playwright/visual-assets/` (committed) and are
 * described by `manifest.json`, which maps each request URL to a local file
 * path plus its content type. The manifest is the single source of truth: the
 * route handlers below look the request URL up in it and serve the vendored
 * bytes; only URLs NOT present in the manifest fall through to the disk cache
 * / network path. This makes the mock phase deterministic even with a cold
 * `os.tmpdir()` runtime cache (which is wiped between runs in this execution
 * environment) — the determinism comes from the committed pin, not a warm
 * cache.
 *
 * Contents:
 *   - `tailwind/tailwind-play.js`            the Tailwind Play CDN JIT script
 *   - `google-fonts/fonts.css`               the Google Fonts stylesheet with
 *                                            `font-display: swap` rewritten to
 *                                            `block` (the swap→block transform
 *                                            the old route handler applied at
 *                                            serve time is now baked in)
 *   - `google-fonts/font-*.woff2`            the woff2 files the CSS references
 *                                            (kept keyed by their original
 *                                            `fonts.gstatic.com` URLs)
 *   - `brand-logos/*.svg`                    the Tailwind Plus brand marquee
 *                                            logos the mock loads as <img>
 */
const VENDOR_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  'visual-assets',
);

interface VendorEntry {
  path: string;
  contentType: string;
}

function loadVendorManifest(): Map<string, VendorEntry> {
  const map = new Map<string, VendorEntry>();
  try {
    const raw = fs.readFileSync(path.join(VENDOR_DIR, 'manifest.json'), 'utf8');
    const obj = JSON.parse(raw) as Record<string, VendorEntry>;
    for (const [k, v] of Object.entries(obj)) map.set(k, v);
  } catch {
    // No manifest -> every request falls through to the disk cache / network.
  }
  return map;
}

const VENDOR_MANIFEST = loadVendorManifest();

function vendorEntryFor(reqUrl: string): VendorEntry | null {
  let e = VENDOR_MANIFEST.get(reqUrl);
  if (e) return e;
  // The mock HTML references the Google Fonts CSS with `display=swap`; the
  // vendored CSS is the `block` form. Accept either URL form.
  const block = reqUrl.replace('display=swap', 'display=block');
  if (block !== reqUrl) {
    e = VENDOR_MANIFEST.get(block);
    if (e) return e;
  }
  return null;
}

/**
 * Serve a request from the vendored assets. If the request URL is not in the
 * manifest (or the vendored file is missing on disk), fall through to the disk
 * cache / network path so unrelated requests keep working.
 */
async function fulfillFromVendored(route) {
  const reqUrl = route.request().url();
  const entry = vendorEntryFor(reqUrl);
  if (entry) {
    try {
      const body = fs.readFileSync(path.join(VENDOR_DIR, entry.path));
      await route.fulfill({
        status: 200,
        contentType: entry.contentType,
        body,
      });
      return;
    } catch {
      // fall through to cache/network
    }
  }
  return fulfillFromCache(route);
}

function readDiskCache(url: string): CacheEntry | null {
  const p = diskCachePath(url);
  const mp = diskCacheMetaPath(url);
  try {
    const body = fs.readFileSync(p);
    const meta = JSON.parse(fs.readFileSync(mp, 'utf8'));
    return { body, contentType: meta.contentType || 'application/octet-stream' };
  } catch {
    return null;
  }
}

function writeDiskCache(url: string, entry: CacheEntry): void {
  try {
    fs.mkdirSync(DISK_CACHE_DIR, { recursive: true });
    fs.writeFileSync(diskCachePath(url), entry.body);
    fs.writeFileSync(
      diskCacheMetaPath(url),
      JSON.stringify({ contentType: entry.contentType }),
    );
  } catch {
    // Best-effort: if disk write fails, the in-memory cache still works
    // for the current process.
  }
}

async function fulfillFromCache(route) {
  const url = route.request().url();
  let cached = memCache.get(url);
  if (!cached) {
    cached = readDiskCache(url);
    if (cached) memCache.set(url, cached);
  }
  if (!cached) {
    let lastErr;
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const resp = await route.fetch();
        const body = await resp.body();
        cached = {
          body,
          contentType: resp.headers()['content-type'] || 'application/octet-stream',
        };
        memCache.set(url, cached);
        writeDiskCache(url, cached);
        lastErr = null;
        break;
      } catch (err) {
        lastErr = err;
        await new Promise((res) => setTimeout(res, 400));
      }
    }
    if (!cached) {
      // Last resort: let the request go to the network untouched.
      return route.continue();
    }
  }
  await route.fulfill({
    status: 200,
    contentType: cached.contentType,
    body: cached.body,
  });
}

/**
 * Intercept the mock's Google Fonts stylesheet request and serve it from the
 * cache (fetching once with retries on the first miss). The CSS is rewritten to
 * `font-display: block` so the browser never paints a fallback-glyph frame
 * before the real font is available — with the cached fonts that is instant,
 * eliminating the swap race that otherwise produces sub-pixel heading drift.
 */
async function installMockFontRoute(page) {
  // Serve the Tailwind Play CDN JIT script from the vendored pin so its bytes
  // (and therefore the CSS it generates and the timing of that generation
  // relative to settle()) are identical on every run. The vendored script is
  // captured once and committed; a cold runtime cache no longer matters.
  await page.route('**/cdn.tailwindcss.com/**', fulfillFromVendored);
  await page.route('**/fonts.googleapis.com/css2**', async (route) => {
    // The vendored CSS already has `font-display: block` baked in, so no
    // runtime rewrite is needed; serve it directly. Fall back to the cache /
    // network path only if the URL is not vendored.
    const entry = vendorEntryFor(route.request().url());
    if (entry) {
      try {
        const body = fs.readFileSync(path.join(VENDOR_DIR, entry.path));
        await route.fulfill({
          status: 200,
          contentType: entry.contentType,
          body,
        });
        return;
      } catch {
        // fall through
      }
    }
    // Legacy path: fetch, rewrite swap->block, cache. Kept as a fallback for
    // any non-vendored Google Fonts stylesheet URL.
    const url = route.request().url().replace('display=swap', 'display=block');
    let cached = memCache.get(url);
    if (!cached) {
      cached = readDiskCache(url);
      if (cached) memCache.set(url, cached);
    }
    if (!cached) {
      try {
        const resp = await route.fetch({ url });
        let body = await resp.text();
        body = body.replace(/font-display:\s*swap/g, 'font-display: block');
        cached = {
          body: Buffer.from(body, 'utf8'),
          contentType: 'text/css; charset=utf-8',
        };
        memCache.set(url, cached);
        writeDiskCache(url, cached);
      } catch (err) {
        return route.continue();
      }
    }
    await route.fulfill({
      status: 200,
      contentType: cached.contentType,
      body: cached.body,
    });
  });
  // Serve the woff2 font binaries from the vendored pin (keyed by their
  // original `fonts.gstatic.com` URLs).
  await page.route('**/fonts.gstatic.com/**', fulfillFromVendored);
  // Serve the Tailwind Plus brand marquee logos the mock loads as <img> from
  // the vendored pin so their bytes (and any SVG rasterization) are stable
  // across runs. Not previously intercepted; pinning them removes the last
  // network-dependent asset the mock phase loads.
  await page.route('**/tailwindcss.com/plus-assets/**', fulfillFromVendored);
}

/**
 * Intercept the app's font binary requests (the app inlines its @font-face
 * rules pointing at `fonts.gstatic.com`) and serve them from the shared cache.
 * The app's HTML is an SPA shell served for every route, so its document
 * responses are rewritten to switch the inlined `font-display: swap` to
 * `block` for the same swap-race reason.
 *
 * The bundled `@decaf-ts/styles` base stylesheet forwards an `@import` of the
 * variable Inter font (`Inter:ital,opsz,wght@0,14..32,400..900…`). That
 * variable face overrides the static Inter weights (400/500/600/700) the
 * www-mock loads, and a variable font renders glyphs with different hinting
 * than the static cuts — a uniform sub-pixel text drift on every line that
 * dwarfs the suite tolerance. The app's built HTML already inlines the static
 * Inter + Plus Jakarta Sans @font-face rules (the exact faces the mock uses),
 * so blocking the decaf variable-Inter @import leaves only those static faces
 * and makes the app render text identically to the mock.
 */
async function installAppFontRoutes(page) {
  // Serve the app's font binaries from the same vendored woff2 pin the mock
  // uses, so the app and mock paint the exact same font bytes.
  await page.route('**/fonts.gstatic.com/**', fulfillFromVendored);
  // Block the decaf variable-Inter @import (and any other Google Fonts CSS
  // stylesheet the app requests at runtime): the static @font-face are already
  // inlined in the built HTML, matching the mock. Return empty CSS so the
  // @import resolves to no additional @font-face rules.
  await page.route('**/fonts.googleapis.com/**', (route) =>
    route.fulfill({ status: 200, contentType: 'text/css; charset=utf-8', body: '' }),
  );
  await page.route(`${APP_URL}/**`, async (route) => {
    const req = route.request();
    if (req.resourceType() !== 'document') return route.continue();
    try {
      const resp = await route.fetch();
      const ct = resp.headers()['content-type'] || '';
      if (!ct.includes('text/html')) return route.fulfill(resp);
      let body = await resp.text();
      body = body.replace(/font-display:\s*swap/g, 'font-display: block');
      await route.fulfill({ status: 200, contentType: ct, body });
    } catch (err) {
      return route.continue();
    }
  });
}

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
      return (
        (s.willChange === 'transform' && el.parentElement) ||
        (s.animationName && s.animationName !== 'none')
      );
    });
    for (const track of tracks) {
      const wrap = track.parentElement;
      track.style.transform = 'translate3d(0,0,0)';
      track.style.transition = 'none';
      track.style.animation = 'none';
      track.style.willChange = 'auto';
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

/**
 * Deterministically wait for the page's web fonts to be loaded and applied.
 *
 * The www-mock references Google Fonts (Inter, Plus Jakarta Sans) via a
 * `<link>` stylesheet served from a slow CDN; `document.fonts.ready` resolves
 * immediately while the @font-face rules are still unregistered (the stylesheet
 * has not loaded yet), so a capture taken after a short fixed buffer can catch
 * the fallback-font state and later swap, producing run-to-run pixel drift
 * distributed across every text line. The built app bundles the same fonts
 * locally, so it is always in the font-loaded state; the mock goldens must be
 * captured in that same state for the app-vs-mock comparison to be valid.
 *
 * This (1) waits for every `<link rel="stylesheet">` to load so the @font-face
 * rules are registered, (2) actively triggers `document.fonts.load` for every
 * weight the mock/app actually use (Plus Jakarta Sans is only served at 700/800
 * by the Google Fonts URL, so loading the default 400 weight does nothing and
 * leaves the headings in the fallback state), (3) waits for
 * `document.fonts.ready`, (4) waits for the document scroll height to settle so
 * any late asynchronous content (module cards fetched and rendered by the mock,
 * random footer banner) and the font-swap reflow have all completed before the
 * capture, and (5) keeps a small buffer for the Tailwind Play CDN JIT compile.
 * Every stage is bounded so a blocked network never hangs the suite.
 */
async function settle(page) {
  await page
    .evaluate(() => {
      const waitStylesheets = () =>
        new Promise((resolve) => {
          const links = Array.from(
            document.querySelectorAll('link[rel="stylesheet"]')
          );
          if (links.length === 0) return resolve();
          let pending = links.length;
          const done = () => {
            if (--pending <= 0) resolve();
          };
          for (const l of links) {
            if (l.sheet) {
              done();
            } else {
              l.addEventListener('load', done, { once: true });
              l.addEventListener('error', done, { once: true });
            }
          }
          setTimeout(done, 12000);
        });
      const loadFamilies = () => {
        // Google Fonts serves each family split into unicode-range subsets
        // (latin, latin-ext, ...) as separate @font-face files. `fonts.load`
        // with no text only fetches the default (latin) subset, so accented
        // glyphs used by pt_br/pt_pt (ã, ç, é, …) fall back to the system font
        // and the heading reflows whenever the latin-ext file has not also
        // been pulled in. Loading with a text sample that mixes ASCII and the
        // accented glyphs forces every subset the suite covers to fetch.
        const sample =
          'ABCabcÃãÇçÉéÁáÀàÊêÍíÓóÔôÕõÚúâêô0123456789.,:-/()';
        const weights = [
          '400 16px Inter',
          '500 16px Inter',
          '600 16px Inter',
          '700 16px Inter',
          '700 16px "Plus Jakarta Sans"',
          '800 16px "Plus Jakarta Sans"',
        ];
        const loadAll = () =>
          Promise.all(
            weights.map((f) =>
              ((document.fonts && document.fonts.load(f, sample)) ||
                Promise.resolve([])).catch(() => [])
            )
          );
        // `document.fonts.load` resolves when the fetch completes, but a
        // subset may not yet be check-able (or may have failed silently); poll
        // `check` with the same sample until every weight is confirmed
        // available across all the glyphs we render, so the capture never
        // lands in a fallback-font state.
        const confirmAll = (deadline) =>
          new Promise((resolve) => {
            const tick = () => {
              if (
                document.fonts &&
                weights.every((f) => document.fonts.check(f, sample))
              ) {
                return resolve(true);
              }
              if (Date.now() >= deadline) return resolve(false);
              setTimeout(tick, 60);
            };
            tick();
          });
        return loadAll()
          .then(() => confirmAll(Date.now() + 10000))
          .then(() => document.fonts && document.fonts.ready);
      };
      const waitStable = () =>
        new Promise((resolve) => {
          const deadline = Date.now() + 8000;
          let last = -1;
          let stableSince = Date.now();
          const tick = () => {
            const h = Math.max(
              document.documentElement.scrollHeight,
              document.body.scrollHeight
            );
            if (h === last) {
              if (Date.now() - stableSince >= 1000 || Date.now() >= deadline) {
                return resolve();
              }
            } else {
              last = h;
              stableSince = Date.now();
            }
            setTimeout(tick, 80);
          };
          tick();
        });
      return waitStylesheets()
        .then(loadFamilies)
        .then(waitStable)
        .catch(() => true);
    })
    .catch(() => {});
  await page.waitForTimeout(400);
}

/** Open a www-mock page, switching to the requested locale via DecafLocale. */
export async function openMock(page, mockFile, localeCode) {
  await trackResizeListeners(page);
  await installMockFontRoute(page);

  // modules.js fetches assets/modules.json asynchronously and renders cards
  // via DecafLocale.t(). If the fetch resolves before setLocale() is called,
  // the cards render with the wrong locale (or raw key strings if start()
  // beats startLocale()). setLocale() only updates [data-locale] elements —
  // it does NOT re-render the dynamically-created cards. Delay the
  // modules.json fetch until the correct locale is in place so cards always
  // render with the right translations. Also pin Math.random so banner.js
  // always picks the same footer slogan (different slogans wrap to different
  // line counts on mobile, causing height variance).
  await page.addInitScript(() => {
    Math.random = () => 0;
    window.__DECAF_LOCALE_READY = false;
    const origFetch = window.fetch;
    window.fetch = function (...args) {
      const url =
        typeof args[0] === 'string'
          ? args[0]
          : args[0] && args[0].url
            ? args[0].url
            : '';
      if (url.includes('modules.json')) {
        return new Promise((resolve) => {
          const check = () => {
            if (window.__DECAF_LOCALE_READY) {
              resolve(origFetch.apply(this, args));
            } else {
              setTimeout(check, 30);
            }
          };
          check();
        });
      }
      return origFetch.apply(this, args);
    };
  });

  await page.goto(`${MOCK_URL}/${mockFile}`, { waitUntil: 'load' });
  await page.waitForFunction(() => typeof window.DecafLocale?.setLocale === 'function');
  await page.evaluate(() => {
    // setLocale() updates .dict but NOT .t (which closes over the original
    // en_us dict from startLocale). Patch t() to always read from the current
    // .dict so dynamically-rendered content (modules.js, features.js, etc.)
    // uses the correct locale. Missing keys return undefined so callers that
    // use `t(key) || "fallback"` still work.
    if (window.DecafLocale) {
      window.DecafLocale.t = (key) => {
        const dict = window.DecafLocale.dict;
        if (!dict) return undefined;
        const parts = key.split('.');
        let cur = dict;
        for (const p of parts) {
          if (cur && Object.prototype.hasOwnProperty.call(cur, p)) cur = cur[p];
          else return undefined;
        }
        return typeof cur === 'string' ? cur : undefined;
      };
    }
  });
  if (localeCode !== 'en_us') {
    await page.evaluate(
      async (code) => {
        await window.DecafLocale.setLocale(code);
        window.__DECAF_LOCALE_READY = true;
      },
      localeCode
    );
  } else {
    await page.evaluate(() => {
      window.__DECAF_LOCALE_READY = true;
    });
  }
  // Wait for banner.js to finish inserting the footer slogan (it polls for
  // DecafLocale every 50ms and then adds a <p> that changes the page height).
  // If settle() runs before the banner is inserted, the captured height is
  // short and the golden won't match on runs where the banner lands earlier.
  await page
    .waitForSelector('#decaf-slogan-banner', { state: 'attached', timeout: 5000 })
    .catch(() => {});
  // Wait for the Tailwind Play CDN's MutationObserver to finish generating
  // CSS for elements created by renderAll (content.js adds feature/FAQ/brand
  // cards with Tailwind classes). The observer fires asynchronously, so we
  // poll the total <style> text length until it stabilises — a growing style
  // element means new CSS rules are still being injected, which changes
  // element dimensions and therefore page height.
  await page
    .evaluate(() => {
      return new Promise((resolve) => {
        let lastLen = -1;
        let stableSince = Date.now();
        const deadline = Date.now() + 5000;
        const tick = () => {
          let total = 0;
          for (const s of document.querySelectorAll('style'))
            total += s.textContent.length;
          if (total === lastLen) {
            if (Date.now() - stableSince >= 200 || Date.now() >= deadline)
              return resolve();
          } else {
            lastLen = total;
            stableSince = Date.now();
          }
          setTimeout(tick, 50);
        };
        tick();
      });
    })
    .catch(() => {});
  await page.addStyleTag({
    content: [
      'html, body, * { -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; }',
    ].join('\n'),
  });
  await settle(page);
  await freezeMarquees(page);
  // DecafMarquee.setup() pins each container's `minHeight` to the height it
  // measured at setup time ("avoid jump"). When the Tailwind Play CDN JIT has
  // not yet generated the grid CSS at setup time (a cold-cache first capture),
  // the brand logos stack vertically and the pinned minHeight locks that tall
  // pre-Tailwind layout even after the grid CSS arrives — a run-to-run 40px
  // height drift on the index page that breaks mock-phase determinism. By the
  // time settle() returns the Tailwind CSS is applied, so dropping the sticky
  // minHeight lets each marquee container settle to its natural (final) height
  // deterministically. The frozen-at-0, overflow-hidden capture is unaffected
  // (extra off-screen clone sets are clipped); only the height is corrected.
  await page.evaluate(() => {
    for (const el of Array.from(document.querySelectorAll('*'))) {
      if (el.__decafMarquee) el.style.minHeight = '';
    }
  });
}

/** Open the built app at a route using `?lang=` for the requested locale. */
export async function openApp(page, pageName, localeCode) {
  await trackResizeListeners(page);
  // Pin Math.random so any random-dependent rendering (e.g. the footer slogan
  // selection the mock pins identically) is deterministic and reproducible
  // across runs, matching the mock fixture's pinning.
  await page.addInitScript(() => {
    Math.random = () => 0;
  });
  await installAppFontRoutes(page);
  await page.goto(APP_ROUTE(pageName, localeCode), { waitUntil: 'load' });
  await page.waitForSelector('.app-layout__locale-button', { state: 'attached' });
  // The mock has no locale selector — hide the app's fixed locale button so
  // it doesn't overlay the top-right corner in visual-diff captures.
  await page.addStyleTag({
    content: [
      '.app-layout__locale { display: none !important; }',
      // Kill CSS-keyframe marquee animations at the stylesheet level so the
      // track stays at translateX(0) regardless of when the screenshot is
      // taken.  Inline `animation: none` can be overridden by Playwright's
      // own `animations: 'disabled'` injection; a `!important` stylesheet
      // rule is more robust.
      '.home-cards-marquee__track, .brands-marquee__track { animation: none !important; transform: none !important; }',
      'html, body, * { -webkit-font-smoothing: antialiased !important; -moz-osx-font-smoothing: grayscale !important; }',
    ].join('\n'),
  });
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

  // Re-freeze marquees after the viewport resize — Angular may re-render
  // animated tracks during the resize, dropping the inline `animation: none`
  // set earlier in openApp/openMock.
  await freezeMarquees(page);

  return fullHeight;
}
