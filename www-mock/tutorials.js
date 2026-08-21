// filepath: /home/tvenceslau/local-workspace/decaf-ts/web-page/www/tutorials.js
// Renderer for tutorials.html: uses DecafTutorialsCore and locale to show developer-focused tutorials for a module
(function () {
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function renderError(key) {
    const box = document.getElementById("tutorials-error");
    if (!box) return;
    box.textContent =
      window.DecafLocale && window.DecafLocale.t
        ? window.DecafLocale.t(key)
        : key;
    box.classList.remove("hidden");
  }

  function renderHeader(moduleName, mod) {
    const t = (k) =>
      window.DecafLocale && window.DecafLocale.t ? window.DecafLocale.t(k) : k;
    const titleEl = document.getElementById("tutorials-title");
    const subtitleEl = document.getElementById("tutorials-subtitle");
    const display = (mod && (mod.title || mod.name)) || moduleName || "";
    if (titleEl)
      titleEl.textContent = t("tutorials.title").replace("{module}", display);
    if (subtitleEl)
      subtitleEl.textContent =
        mod && mod.summary
          ? mod.summary
          : t("tutorials.subtitle").replace("{module}", display);
  }

  function buildTutorialCard(item, idx) {
    const wrap = document.createElement("div");
    wrap.className =
      "border border-gray-200 rounded-xl overflow-hidden bg-white";
    const head = document.createElement("div");
    head.className = "px-6 py-4 bg-gray-50 border-b border-gray-200";
    const h3 = document.createElement("h3");
    h3.className = "font-jakarta font-bold text-lg text-gray-900";
    h3.textContent = item.title || `Example ${idx + 1}`;
    head.appendChild(h3);
    if (item.context) {
      const ctx = document.createElement("p");
      ctx.className = "text-gray-600 text-sm mt-1";
      ctx.textContent = item.context;
      head.appendChild(ctx);
    }

    const body = document.createElement("div");
    body.className = "p-6 bg-white";
    const pre = document.createElement("pre");
    pre.className =
      "bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto text-sm";
    const code = document.createElement("code");
    code.textContent = item.code || "";
    pre.appendChild(code);
    body.appendChild(pre);

    wrap.appendChild(head);
    wrap.appendChild(body);
    return wrap;
  }

  async function start() {
    const moduleName = getQueryParam("module");
    if (!moduleName) {
      renderError("examples.errors.no_module");
      return;
    }

    let modulesList;
    try {
      modulesList = window.DecafFeaturesCore
        ? await window.DecafFeaturesCore.loadModules()
        : await fetch("assets/modules.json").then((r) => r.json());
    } catch (e) {
      renderError("examples.errors.load_failed");
      return;
    }

    const mod = (modulesList || []).find(
      (m) => m && (m.name === moduleName || m.base_path === moduleName)
    );
    if (!mod) {
      renderError("examples.errors.not_found");
      return;
    }

    renderHeader(moduleName, mod);
    const root = document.getElementById("tutorials-list");
    if (!root) return;
    root.innerHTML = "";

    // Try locale first
    const dict = (window.DecafLocale && window.DecafLocale.dict) || {};
    const modKey = (mod.name || mod.base_path || "").trim();
    let entries = [];
    try {
      const modLoc =
        dict.tutorials && dict.tutorials.modules
          ? dict.tutorials.modules[modKey]
          : null;
      if (modLoc && Array.isArray(modLoc.items))
        entries = modLoc.items.map((it) => ({
          title: it.title,
          code: it.code,
          context: it.summary,
        }));
    } catch (err) {
      entries = [];
    }

    if (!entries.length) {
      try {
        const found = await window.DecafTutorialsCore.buildTutorialEntries(
          mod.name || mod.base_path || ""
        );
        entries = found.map((e) => ({
          title: e.source,
          code: e.code,
          context: e.context,
        }));
      } catch (err) {
        entries = [];
      }
    }

    if (!entries.length) {
      renderError("examples.errors.no_examples");
      return;
    }

    entries.forEach((it, idx) => root.appendChild(buildTutorialCard(it, idx)));
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
