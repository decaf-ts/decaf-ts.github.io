// Inject a random, localized slogan after the copyright line in the footer
(function () {
  function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function findFooterAnchor() {
    // Prefer the bottom row wrapper to place a centered middle column
    const footerRow = document.querySelector('footer .border-t > div');
    if (footerRow) return footerRow;
    // Fallback: return the first paragraph inside footer
    return document.querySelector('footer p');
  }

  function insertSlogan(afterEl, slogan) {
    if (!slogan) return;
    // prevent duplicate insertion
    if (document.getElementById('decaf-slogan-banner')) return;
    const p = document.createElement('p');
    p.id = 'decaf-slogan-banner';
    // Centered in the footer row on larger screens; centered full-width on mobile
    p.className = 'text-gray-500 text-sm text-center w-full sm:flex-1';
    p.textContent = slogan;

    // Target the footer bottom row
    const row = document.querySelector('footer .border-t > div');
    if (row) {
      row.classList.add("w-full");
      const copyright = row.querySelector('p');
      const socials = row.lastElementChild;
      // Insert the banner after the copyright (center position between left and right)
      if (copyright && copyright.parentNode === row) {
        row.insertBefore(p, copyright.nextSibling);
      } else if (socials) {
        row.insertBefore(p, socials);
      } else {
        row.appendChild(p);
      }
      // Ensure layout aligns: left, center, right
      if (copyright) {
        copyright.classList.add("w-full", "sm:flex-1", "sm:text-left");
      }
      if (socials && socials instanceof HTMLElement) {
        socials.classList.add("w-full", "sm:flex-1");
        // make sure socials container aligns right on sm+
        socials.classList.add("flex", "justify-center", "sm:justify-end");
      }
    } else if (afterEl && afterEl.parentNode) {
      afterEl.parentNode.insertBefore(p, afterEl.nextSibling);
    } else {
      const footer = document.querySelector('footer .border-t');
      if (footer) footer.appendChild(p);
      else document.querySelector('footer')?.appendChild(p);
    }
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  function awaitLocale(maxWaitMs = 5000) {
    return new Promise((resolve) => {
      const start = Date.now();
      const tick = () => {
        if (window.DecafLocale && window.DecafLocale.dict) return resolve(window.DecafLocale);
        if (Date.now() - start > maxWaitMs) return resolve(null);
        setTimeout(tick, 50);
      };
      tick();
    });
  }

  ready(async () => {
    const anchor = findFooterAnchor();
    const locale = await awaitLocale();
    const dict = locale && locale.dict;
    const arr = (dict && dict.banner && Array.isArray(dict.banner.slogans)) ? dict.banner.slogans : [];
    if (!arr.length) return;
    insertSlogan(anchor, pickRandom(arr));
  });
})();
