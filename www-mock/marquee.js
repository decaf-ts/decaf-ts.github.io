// Decaf Marquee: seamless, one-direction marquee with configurable fade edges
// Exposes window.DecafMarquee.setup(container, { direction, pxPerSec, gapPx, fade, fadeWidth })
// - direction: 'left' | 'right' (default: 'left'). Can also control via pxPerSec sign.
// - pxPerSec: number of pixels per second (default: 60). Negative reverses direction.
// - gapPx: gap between items (default: 32).
// - fade: enable edge fade-in/out via CSS masks (default: true).
// - fadeWidth: width of fade edges in px (default: 48).

(function () {
  function applyMask(wrap, direction, fadeWidth) {
    if (!fadeWidth || fadeWidth <= 0) {
      wrap.style.webkitMaskImage = '';
      wrap.style.maskImage = '';
      return;
    }
    const fw = Math.max(1, fadeWidth);
    const gradientLeftToRight = `linear-gradient(to right, transparent 0, black ${fw}px, black calc(100% - ${fw}px), transparent 100%)`;
    const gradientRightToLeft = `linear-gradient(to left, transparent 0, black ${fw}px, black calc(100% - ${fw}px), transparent 100%)`;
    const g = direction === 'right' ? gradientRightToLeft : gradientLeftToRight;
    wrap.style.webkitMaskImage = g;
    wrap.style.maskImage = g;
  }

  function setup(container, opts = {}) {
    const gapPx = typeof opts.gapPx === 'number' ? opts.gapPx : 32;
    const direction = opts.direction === 'right' ? 'right' : 'left';
    const speed = Math.abs(typeof opts.pxPerSec === 'number' ? opts.pxPerSec : 60);
    const fade = opts.fade !== false;
    const fadeWidth = typeof opts.fadeWidth === 'number' ? opts.fadeWidth : 48;

    // Cancel previous instance on this container
    if (container.__decafMarquee && container.__decafMarquee.rafId) cancelAnimationFrame(container.__decafMarquee.rafId);
    if (container.__decafMarquee && container.__decafMarquee.cleanup) container.__decafMarquee.cleanup();

    // Snapshot current children (do not mutate originals)
    const originals = Array.from(container.children);
    const hasItems = originals.length > 0;
    // Preserve layout height baseline (avoid jump), but allow growth if needed
    const preservedHeight = container.clientHeight;
    // Do not affect caller layout: preserve size, overflow hidden
    const prevPosition = getComputedStyle(container).position;
    if (prevPosition === 'static') container.style.position = 'relative';
    container.style.overflow = 'hidden';

    // Build track
    container.innerHTML = '';
    const track = document.createElement('div');
    track.style.display = 'flex';
    track.style.flexWrap = 'nowrap';
    track.style.alignItems = 'flex-start';
    track.style.gap = gapPx + 'px';
    track.style.willChange = 'transform';
    container.appendChild(track);
    // Prefer min-height to avoid truncation while preventing layout collapse
    if (preservedHeight) container.style.minHeight = preservedHeight + 'px';

    // Mode determines how we clone: each child vs. whole set as one unit
    const mode = opts.mode === 'cloneContainer' ? 'cloneContainer' : 'cloneItems';
    const appendSetOnce = () => {
      if (mode === 'cloneContainer') {
        // Create a fixed-width page equal to the current container width
        const page = document.createElement('div');
        page.style.flex = '0 0 auto';
        page.style.width = container.clientWidth + 'px';
        page.style.display = 'block';
        // Inner wrapper mirrors the original container classes to keep the exact geometry
        const inner = document.createElement('div');
        inner.className = container.className || '';
        inner.style.width = '100%';
        originals.forEach((n) => inner.appendChild(n.cloneNode(true)));
        page.appendChild(inner);
        track.appendChild(page);
      } else {
        originals.forEach((n) => track.appendChild(n.cloneNode(true)));
      }
    };

    if (hasItems) {
      appendSetOnce();
    }
    // Measure base width of a single set
    const baseWidth = Math.max(1, track.scrollWidth);
    // Ensure we have at least two sets for seamless loop
    appendSetOnce();
    // Add more until we cover container width + one set buffer
    while (track.scrollWidth < container.clientWidth + baseWidth) appendSetOnce();

    // Apply fade masks if requested
    if (fade) applyMask(container, direction, fadeWidth);
    else applyMask(container, direction, 0);

    // Animation loop
    let offset = 0;
    let last = performance.now();
    let paused = false;

    const step = (now) => {
      const dt = (now - last) / 1000; last = now;
      if (!paused) {
        // Positive offset => moves content left; negative => moves right
        const internalSpeed = (direction === 'left') ? speed : -speed;
        offset += internalSpeed * dt;
        // Wrap at baseWidth boundaries to keep the loop seamless
        if (offset >= baseWidth) offset -= baseWidth;
        if (offset < 0) offset += baseWidth;
        track.style.transform = `translate3d(${-offset}px, 0, 0)`;
      }
      container.__decafMarquee.rafId = requestAnimationFrame(step);
    };

    // Pause on hover
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; last = performance.now(); };
    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);

    const onResize = () => {
      // Re-init on resize for correct width coverage
      if (container.__decafMarquee && container.__decafMarquee.rafId) cancelAnimationFrame(container.__decafMarquee.rafId);
      setup(container, opts);
    };
    window.addEventListener('resize', onResize, { passive: true });

    const cleanup = () => {
      window.removeEventListener('resize', onResize);
      container.removeEventListener('mouseenter', onEnter);
      container.removeEventListener('mouseleave', onLeave);
      applyMask(container, direction, 0);
    };

    container.__decafMarquee = { rafId: requestAnimationFrame(step), cleanup };
  }

  function setupFromSelector(selector, opts) {
    document.querySelectorAll(selector).forEach((el) => setup(el, opts));
  }

  window.DecafMarquee = { setup, setupFromSelector };
})();
