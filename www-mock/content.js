// DOM content rendering module
// Exposes window.DecafContent with rendering helpers for features, faq, and brands.

(function () {
  function setupAutoScroll(container, speed = 0.3) {
    const original = Array.from(container.children);
    const track = document.createElement('div');
    track.style.display = 'flex';
    track.style.flexWrap = 'nowrap';
    track.style.alignItems = 'center';
    track.style.gap = '32px';
    container.innerHTML = '';
    container.style.overflow = 'hidden';
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
    const pxPerSec = (typeof options.pxPerSec === 'number') ? options.pxPerSec : 6;
    const gapPx = options.gapPx || 32;

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

    const appendSetOnce = () => { items.forEach((n) => track.appendChild(n.cloneNode(true))); };
    appendSetOnce();
    const baseWidth = Math.max(1, track.scrollWidth);
    appendSetOnce();
    while (track.scrollWidth < wrap.clientWidth + baseWidth) { appendSetOnce(); }

    let offset = 0;
    let last = performance.now();
    let paused = false;

    const step = (now) => {
      const dt = (now - last) / 1000; last = now;
      if (!paused) {
        offset += pxPerSec * dt;
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

  function renderFeatures(dict) {
    const root = document.getElementById('features-grid');
    if (!root) return;
    root.innerHTML = '';
    const cards = dict.features && Array.isArray(dict.features.cards) ? dict.features.cards : [];
    const targetCount = 8; // 4x2 grid
    const list = Array.from({ length: targetCount }, (_, i) => cards[i % (cards.length || 1)]);

    list.forEach((card) => {
      const item = document.createElement('div');
      item.className = 'flex flex-col';
      const iconWrapOuter = document.createElement('div');
      iconWrapOuter.className = 'mb-6';
      const iconWrap = document.createElement('div');
      iconWrap.className = 'w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center mb-4';
      if (card && card.icon) { iconWrap.innerHTML = card.icon; }
      iconWrapOuter.appendChild(iconWrap);
      const body = document.createElement('div');
      body.className = 'flex flex-col gap-4';
      const h3 = document.createElement('h3');
      h3.className = 'font-jakarta font-bold text-lg text-gray-900';
      h3.textContent = (card && card.title) || '';
      const p = document.createElement('p');
      p.className = 'text-gray-600 text-base leading-relaxed';
      p.textContent = (card && card.description) || '';
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
    const targetCount = 6; // 3 per column
    const list = Array.from({ length: targetCount }, (_, i) => items[i % (items.length || 1)]);
    list.forEach((it, idx) => {
      const block = document.createElement('div');
      block.className = 'flex flex-col gap-4';
      const h3 = document.createElement('h3');
      h3.className = 'font-jakarta font-bold text-lg text-gray-900';
      h3.textContent = (it && it.title) || '';
      const p = document.createElement('p');
      p.className = 'text-gray-600 text-base leading-relaxed';
      p.textContent = (it && it.body) || '';
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
    const brands = brandsRaw.map((b) => typeof b === 'string' ? { name: b } : b);
    const targetCount = 5;
    const list = Array.from({ length: targetCount }, (_, i) => brands[i % (brands.length || 1)]);
    list.forEach((b, i) => {
      const clsBase = 'col-span-2 max-h-12 w-full object-contain lg:col-span-1';
      const classes = [clsBase];
      if (i === 3) classes[0] = 'col-span-2 max-h-12 w-full object-contain sm:col-start-2 lg:col-span-1';
      if (i === 4) classes[0] = 'col-span-2 col-start-2 max-h-12 w-full object-contain sm:col-start-auto lg:col-span-1';
      const altText = (b && (b.alt || b.name)) || ((dict && dict.common && dict.common.brand_alt) || '');
      if (b && b.svg) {
        const wrap = document.createElement('div');
        wrap.className = classes.join(' ');
        wrap.setAttribute('role', 'img');
        wrap.setAttribute('aria-label', altText);
        wrap.innerHTML = b.svg;
        grid.appendChild(wrap);
      } else {
        const img = document.createElement('img');
        img.className = classes.join(' ');
        img.width = 158; img.height = 48;
        img.alt = altText;
        img.src = (b && b.src) ? b.src : '';
        grid.appendChild(img);
      }
    });
  }

  function renderAll(dict) {
    renderFeatures(dict);
    renderFaq(dict);
    renderBrands(dict);
  }

  window.DecafContent = {
    setupAutoScroll,
    setupSeamlessMarquee,
    renderFeatures,
    renderFaq,
    renderBrands,
    renderAll,
  };
})();
