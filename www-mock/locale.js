let CURRENT_LOCALE = 'en_us';

async function loadLocale(localePath = `locales/${CURRENT_LOCALE}.json`) {
  const res = await fetch(localePath, { cache: 'no-cache' });
  if (!res.ok) throw new Error(`Failed to load locale file: ${localePath}`);
  const dict = await res.json();
  return dict;
}

function getByKey(dict, key) {
  // Only nested paths are supported
  const parts = key.split('.');
  let cur = dict;
  for (const p of parts) {
    if (cur && Object.prototype.hasOwnProperty.call(cur, p)) {
      cur = cur[p];
    } else {
      throw new Error(`Missing locale key: ${key}`);
    }
  }
  if (typeof cur !== 'string') {
    throw new Error(`Locale key is not a string: ${key}`);
  }
  return cur;
}

function applyLocale(dict) {
  // Elements with data-locale -> textContent replacement
  document.querySelectorAll('[data-locale]').forEach((el) => {
    const key = el.getAttribute('data-locale');
    try {
      el.textContent = getByKey(dict, key);
    } catch (e) {
      console.error('[locale] Missing key', key, e);
    }
  });

  // Elements with data-locale-html -> innerHTML replacement
  document.querySelectorAll('[data-locale-html]').forEach((el) => {
    const key = el.getAttribute('data-locale-html');
    try {
      el.innerHTML = getByKey(dict, key);
    } catch (e) {
      console.error('[locale] Missing key', key, e);
    }
  });

  // Attribute localization: data-locale-attr="attrName:key"
  document.querySelectorAll('[data-locale-attr]').forEach((el) => {
    const spec = el.getAttribute('data-locale-attr');
    // Support multiple, comma-separated
    spec.split(',').forEach((pair) => {
      const [attr, key] = pair.split(':').map((s) => s.trim());
      if (!attr || !key) return;
      try {
        el.setAttribute(attr, getByKey(dict, key));
      } catch (e) {
        console.error('[locale] Missing key', key, e);
      }
    });
  });

  // Document title
  const titleKey = document.documentElement.getAttribute('data-locale-title');
  if (titleKey) {
    try {
      document.title = getByKey(dict, titleKey);
    } catch (e) {
      console.error('[locale] Missing key', titleKey, e);
    }
  }
}

function renderFeatures(dict) {
  const root = document.getElementById('features-grid');
  if (!root) return;
  root.innerHTML = '';
  const cards = dict.features && Array.isArray(dict.features.cards) ? dict.features.cards : [];
  const targetCount = 8; // keep 4x2 grid
  const list = Array.from({ length: targetCount }, (_, i) => cards[i % (cards.length || 1)]);

  list.forEach((card) => {
    const item = document.createElement('div');
    item.className = 'flex flex-col';
    const iconWrapOuter = document.createElement('div');
    iconWrapOuter.className = 'mb-6';
    const iconWrap = document.createElement('div');
    iconWrap.className = 'w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4';
    if (card.icon) { iconWrap.innerHTML = card.icon; }
    iconWrapOuter.appendChild(iconWrap);
    const body = document.createElement('div');
    body.className = 'flex flex-col gap-4';
    const h3 = document.createElement('h3');
    h3.className = 'font-jakarta font-bold text-lg text-gray-900';
    h3.textContent = card.title || '';
    const p = document.createElement('p');
    p.className = 'text-gray-600 text-base leading-relaxed';
    p.textContent = card.description || '';
    body.appendChild(h3);
    body.appendChild(p);
    item.appendChild(iconWrapOuter);
    item.appendChild(body);
    root.appendChild(item);
  });
}

function renderFaq(dict) {
  const left = document.getElementById('faq-left');
  const right = document.getElementById('faq-right');
  if (!left || !right) return;
  left.innerHTML = '';
  right.innerHTML = '';
  const items = dict.faq && Array.isArray(dict.faq.items) ? dict.faq.items : [];
  const targetCount = 6; // keep 3 per column
  const list = Array.from({ length: targetCount }, (_, i) => items[i % (items.length || 1)]);
  list.forEach((it, idx) => {
    const block = document.createElement('div');
    block.className = 'flex flex-col gap-4';
    const h3 = document.createElement('h3');
    h3.className = 'font-jakarta font-bold text-lg text-gray-900';
    h3.textContent = it.title || '';
    const p = document.createElement('p');
    p.className = 'text-gray-600 text-base leading-relaxed';
    p.textContent = it.body || '';
    block.appendChild(h3);
    block.appendChild(p);
    (idx < 3 ? left : right).appendChild(block);
  });
}

function renderBrands(dict) {
  const grid = document.getElementById('brands-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const brandsRaw = dict.logo_cloud && Array.isArray(dict.logo_cloud.brands) ? dict.logo_cloud.brands : [];
  // Support either array of strings or objects { name, src }
  const brands = brandsRaw.map((b) => typeof b === 'string' ? { name: b } : b);
  const targetCount = 5; // keep same visual count
  const list = Array.from({ length: targetCount }, (_, i) => brands[i % (brands.length || 1)]);
  const urlByName = {
    'Transistor': 'https://tailwindcss.com/plus-assets/img/logos/158x48/transistor-logo-gray-900.svg',
    'Reform': 'https://tailwindcss.com/plus-assets/img/logos/158x48/reform-logo-gray-900.svg',
    'Tuple': 'https://tailwindcss.com/plus-assets/img/logos/158x48/tuple-logo-gray-900.svg',
    'SavvyCal': 'https://tailwindcss.com/plus-assets/img/logos/158x48/savvycal-logo-gray-900.svg',
    'Statamic': 'https://tailwindcss.com/plus-assets/img/logos/158x48/statamic-logo-gray-900.svg',
  };
  list.forEach((b, i) => {
    const img = document.createElement('img');
    img.className = 'col-span-2 max-h-12 w-full object-contain lg:col-span-1';
    if (i === 3) img.className = 'col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1';
    if (i === 4) img.className = 'col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1';
    img.width = 158; img.height = 48;
    const altKey = b && b.name ? b.name : (dict && dict.common && dict.common.brand_alt ? dict.common.brand_alt : '');
    img.alt = altKey;
    img.src = (b && b.src) ? b.src : (urlByName[altKey] || '');
    grid.appendChild(img);
  });
}

function setupAutoScroll(container, speed = 0.3) {
  // Seamless transform-based marquee using cloned content set
  const original = Array.from(container.children);
  const track = document.createElement('div');
  track.style.display = 'flex';
  track.style.flexWrap = 'nowrap';
  track.style.alignItems = 'center';
  track.style.gap = '32px';
  container.innerHTML = '';
  container.style.overflow = 'hidden';
  // Append two sets for seamless looping
  const appendSet = () => original.forEach((n) => track.appendChild(n.cloneNode(true)));
  appendSet();
  appendSet();
  container.appendChild(track);

  let offset = 0;
  let setWidth = 0;
  const measure = () => { setWidth = Math.max(1, Math.floor(track.scrollWidth / 2)); };
  measure();

  const step = () => {
    offset += speed;
    if (offset >= setWidth) offset -= setWidth;
    track.style.transform = `translateX(${-offset}px)`;
    container.__marqueeRaf = requestAnimationFrame(step);
  };
  if (container.__marqueeRaf) cancelAnimationFrame(container.__marqueeRaf);
  container.__marqueeRaf = requestAnimationFrame(step);
  window.addEventListener('resize', measure);
}

function setupSeamlessMarquee(wrap, items, options = {}) {
  const pxPerSec = (typeof options.pxPerSec === 'number') ? options.pxPerSec : 6; // allow negative for reverse
  const gapPx = options.gapPx || 32;

  // Cancel previous
  if (wrap.__marquee && wrap.__marquee.rafId) cancelAnimationFrame(wrap.__marquee.rafId);
  if (wrap.__marquee && wrap.__marquee.cleanup) wrap.__marquee.cleanup();
  wrap.innerHTML = '';
  wrap.style.overflow = 'hidden';

  const track = document.createElement('div');
  track.style.display = 'flex';
  track.style.flexWrap = 'nowrap';
  track.style.alignItems = 'stretch';
  track.style.gap = gapPx + 'px';
  track.style.willChange = 'transform';
  wrap.appendChild(track);

  const appendSetOnce = () => {
    items.forEach((n) => track.appendChild(n.cloneNode(true)));
  };

  // First render one set to measure base width
  appendSetOnce();
  // Force layout to get accurate measurements
  const baseWidth = Math.max(1, track.scrollWidth);

  // Append at least one more full set
  appendSetOnce();
  // Ensure enough total width to avoid gaps during transform
  while (track.scrollWidth < wrap.clientWidth + baseWidth) {
    appendSetOnce();
  }

  let offset = 0;
  let last = performance.now();
  let paused = false;

  const step = (now) => {
    const dt = (now - last) / 1000;
    last = now;
    if (!paused) {
      offset += pxPerSec * dt;
      // wrap at baseWidth boundary for seamless loop (both directions)
      if (offset >= baseWidth) offset -= baseWidth;
      if (offset < 0) offset += baseWidth;
      track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    }
    wrap.__marquee.rafId = requestAnimationFrame(step);
  };

  const onEnter = () => { paused = true; };
  const onLeave = () => { paused = false; last = performance.now(); };
  wrap.addEventListener('mouseenter', onEnter);
  wrap.addEventListener('mouseleave', onLeave);

  const onResize = () => {
    // Re-init on resize after a tick to avoid jittery recalcs
    if (wrap.__marquee && wrap.__marquee.rafId) cancelAnimationFrame(wrap.__marquee.rafId);
    setupSeamlessMarquee(wrap, items, options);
  };
  window.addEventListener('resize', onResize, { passive: true });

  const cleanup = () => {
    window.removeEventListener('resize', onResize);
    wrap.removeEventListener('mouseenter', onEnter);
    wrap.removeEventListener('mouseleave', onLeave);
  };

  wrap.__marquee = { rafId: requestAnimationFrame(step), cleanup };
}

async function startLocale() {
  try {
    const dict = await loadLocale();
    applyLocale(dict);
    if (window.DecafContent && typeof window.DecafContent.renderAll === 'function') {
      window.DecafContent.renderAll(dict);
    }
    window.DecafLocale = {
      dict,
      t: (key) => getByKey(dict, key),
      apply: () => {
        applyLocale(dict);
        if (window.DecafContent && typeof window.DecafContent.renderAll === 'function') {
          window.DecafContent.renderAll(dict);
        }
      },
      setLocale: async (code) => {
        if (!code || code === CURRENT_LOCALE) return;
        CURRENT_LOCALE = code;
        const newDict = await loadLocale(`locales/${CURRENT_LOCALE}.json`);
        window.DecafLocale.dict = newDict;
        applyLocale(newDict);
        if (window.DecafContent && typeof window.DecafContent.renderAll === 'function') {
          window.DecafContent.renderAll(newDict);
        }
      }
    };
  } catch (err) {
    console.error('[locale] Failed to initialize locale:', err);
  }
}

// Wire up locale selector if present
document.addEventListener('change', (e) => {
  const target = e.target;
  if (target && target.id === 'locale-select' && window.DecafLocale) {
    window.DecafLocale.setLocale(target.value).catch(console.error);
  }
});

// brands marquee not used; rendering grid instead

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startLocale, { once: true });
} else {
  startLocale();
}
