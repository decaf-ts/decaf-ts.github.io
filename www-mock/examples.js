// Feature JS for examples.html: renders a detailed examples list for a given module
(function () {
  function mdToPlain(text) {
    if (!text) return '';
    const noCode = text.replace(/```[\s\S]*?```/g, '');
    const noMd = noCode.replace(/[#>*_`~\[\]\(\)!]/g, '').replace(/\n+/g, ' ').trim();
    return noMd;
  }

  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  async function loadModules() {
    const res = await fetch('assets/modules.json', { cache: 'no-cache' });
    if (!res.ok) throw new Error('modules.json');
    return res.json();
  }

  function renderError(dict, key) {
    const box = document.getElementById('examples-error');
    box.textContent = (window.DecafLocale && window.DecafLocale.t) ? window.DecafLocale.t(key) : key;
    box.classList.remove('hidden');
  }

  function renderModuleHeader(mod) {
    // Title/subtitle are localized templates
    const t = (k) => window.DecafLocale ? window.DecafLocale.t(k) : k;
    const title = document.getElementById('examples-title');
    const subtitle = document.getElementById('examples-subtitle');
    const modKey = (mod.name || mod.base_path || '').trim();
    let localizedTitle = '';
    let localizedSummary = '';
    const humanise = (s) => (s || '').replace(/[-_]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim();
    const displayName = humanise(mod.title || mod.name || modKey);
    try {
      const dict = (window.DecafLocale && window.DecafLocale.dict) || {};
      const modLoc = dict.examples && dict.examples.modules && dict.examples.modules[modKey];
      if (modLoc && typeof modLoc.title === 'string') localizedTitle = modLoc.title;
      if (modLoc && typeof modLoc.summary === 'string') localizedSummary = modLoc.summary;
    } catch {}
    // Fall back to a localized generic template for unknown modules
    const fallbackTitle = (window.DecafLocale && window.DecafLocale.t) ? window.DecafLocale.t('examples.modules.fallback.title').replace('{module}', displayName) : `Examples for ${displayName}`;
    title.textContent = localizedTitle || fallbackTitle || t('examples.title').replace('{module}', displayName);
    const genSummary = (mod.summary && mod.summary.trim() ? mod.summary.trim() : (mdToPlain(mod.description || '').slice(0, 200) + '…'));
    const fallbackSummary = (window.DecafLocale && window.DecafLocale.t) ? window.DecafLocale.t('examples.modules.fallback.summary').replace('{module}', displayName) : genSummary;
    const summary = localizedSummary || genSummary || fallbackSummary;
    subtitle.textContent = summary || t('examples.no_description');
  }

  function buildExampleCard(example, index, t) {
    const wrap = document.createElement('div');
    wrap.className = 'border border-gray-200 rounded-xl overflow-hidden';

    const head = document.createElement('div');
    head.className = 'px-6 py-4 bg-gray-50 border-b border-gray-200';
    const title = document.createElement('h3');
    title.className = 'font-jakarta font-bold text-lg text-gray-900';
    const lang = example.lang ? example.lang.toUpperCase() : t('examples.code');
    const heading = (example.title && example.title.trim()) || t('examples.example_title').replace('{n}', String(index + 1)).replace('{lang}', lang);
    title.textContent = heading;
    head.appendChild(title);

    const context = document.createElement('p');
    context.className = 'text-gray-600 text-sm mt-1';
    const ctx = (example.details && example.details.trim()) || (example.context && example.context.trim()) || '';
    context.textContent = ctx || t('examples.example_how_when');
    head.appendChild(context);

    const body = document.createElement('div');
    body.className = 'p-6 bg-white';
    const pre = document.createElement('pre');
    pre.className = 'bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm';
    const code = document.createElement('code');
    code.textContent = (example.code || '').trim();
    pre.appendChild(code);
    body.appendChild(pre);

    wrap.appendChild(head);
    wrap.appendChild(body);
    return wrap;
  }

  async function start() {
    const t = (k) => (window.DecafLocale && window.DecafLocale.t) ? window.DecafLocale.t(k) : k;
    const name = getQueryParam('module');
    if (!name) {
      renderError(null, 'examples.errors.no_module');
      return;
    }
    let list;
    try { list = await loadModules(); } catch {
      renderError(null, 'examples.errors.load_failed');
      return;
    }
    const mod = list.find(m => m && (m.name === name || m.base_path === name));
    if (!mod) {
      renderError(null, 'examples.errors.not_found');
      return;
    }

    renderModuleHeader(mod);
    const root = document.getElementById('examples-list');
    root.innerHTML = '';
    const examples = Array.isArray(mod.examples) ? mod.examples : [];
    if (examples.length === 0) {
      renderError(null, 'examples.errors.no_examples');
      return;
    }
    examples.forEach((ex, i) => root.appendChild(buildExampleCard(ex, i, t)));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else { start(); }
})();
