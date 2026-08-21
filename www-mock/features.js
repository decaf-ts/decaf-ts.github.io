// filepath: /home/tvenceslau/local-workspace/decaf-ts/web-page/www/features.js
// Renderer for features.html: uses DecafFeaturesCore and locale to show main features for a module
(function () {
  function getQueryParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name);
  }

  function renderError(key) {
    const box = document.getElementById("features-error");
    box.textContent =
      window.DecafLocale && window.DecafLocale.t
        ? window.DecafLocale.t(key)
        : key;
    box.classList.remove("hidden");
  }

  function renderHeader(mod) {
    const titleEl = document.getElementById("features-title");
    const subtitleEl = document.getElementById("features-subtitle");
    const modKey = (mod.name || mod.base_path || "").trim();
    const humanise = (s) =>
      (s || "")
        .replace(/[-_]+/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    const displayName = humanise(mod.title || mod.name || modKey);

    // attempt to read localized module entry
    let localizedTitle = "";
    let localizedSummary = "";
    try {
      const modLoc =
        window.DecafLocale &&
        window.DecafLocale.dict &&
        window.DecafLocale.dict.features &&
        window.DecafLocale.dict.features.modules
          ? window.DecafLocale.dict.features.modules[modKey]
          : null;
      if (modLoc && typeof modLoc.title === "string")
        localizedTitle = modLoc.title;
      if (modLoc && typeof modLoc.summary === "string")
        localizedSummary = modLoc.summary;
    } catch (e) {}

    const fallbackTitle =
      window.DecafLocale && window.DecafLocale.t
        ? window.DecafLocale.t("features.title")
        : `Features for ${displayName}`;
    titleEl.textContent =
      localizedTitle || fallbackTitle.replace("{module}", displayName);

    const genSummary =
      mod.summary && mod.summary.trim()
        ? mod.summary.trim()
        : DecafFeaturesCore.mdToPlain(mod.description || "").slice(0, 200) +
          "…";
    const fallbackSummary =
      window.DecafLocale && window.DecafLocale.t
        ? window.DecafLocale.t("features.description")
        : genSummary;
    subtitleEl.textContent = localizedSummary || genSummary || fallbackSummary;
  }

  function buildFeatureCard(item) {
    const wrap = document.createElement("div");
    wrap.className = "border border-gray-200 rounded-xl p-6 bg-white";
    const h3 = document.createElement("h3");
    h3.className = "font-jakarta font-bold text-lg text-gray-900 mb-2";
    h3.textContent = item.title || "";
    const p = document.createElement("p");
    p.className = "text-gray-600 text-base leading-relaxed";
    p.textContent = item.description || "";
    wrap.appendChild(h3);
    wrap.appendChild(p);
    return wrap;
  }

  async function start() {
    const t = (k) =>
      window.DecafLocale && window.DecafLocale.t ? window.DecafLocale.t(k) : k;
    const name = getQueryParam("module");

    let list;
    try {
      list = await DecafFeaturesCore.loadModules();
    } catch (e) {
      renderError("examples.errors.load_failed");
      return;
    }

    // If no module query param provided, render a suite-wide overview
    if (!name) {
      // header – use generic features title/description
      const titleEl = document.getElementById("features-title");
      const subtitleEl = document.getElementById("features-subtitle");
      titleEl.textContent = t("features.title");
      subtitleEl.textContent = t("features.description");

      const root = document.getElementById("features-list");
      root.innerHTML = "";

      // Render feature cards from locale.features.cards
      const dict = (window.DecafLocale && window.DecafLocale.dict) || {};
      const cards =
        dict.features && Array.isArray(dict.features.cards)
          ? dict.features.cards
          : [];
      if (cards.length) {
        const grid = document.createElement("div");
        grid.className = "grid grid-cols-1 md:grid-cols-3 gap-6 mb-8";
        cards.forEach((c) => {
          const item = document.createElement("div");
          item.className =
            "flex flex-col bg-white border border-gray-200 rounded-xl p-6 gap-4";
          const iconWrap = document.createElement("div");
          iconWrap.className =
            "w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center";
          if (c.icon) iconWrap.innerHTML = c.icon;
          const h3 = document.createElement("h3");
          h3.className = "font-jakarta font-bold text-lg text-gray-900";
          h3.textContent = c.title || "";
          const p = document.createElement("p");
          p.className = "text-gray-600";
          p.textContent = c.description || "";
          item.appendChild(iconWrap);
          item.appendChild(h3);
          item.appendChild(p);
          grid.appendChild(item);
        });
        root.appendChild(grid);
      }

      // Render a modules overview list (title + summary) pulled from modules.json and localized module titles where possible
      const modsWrap = document.createElement("div");
      modsWrap.className = "grid grid-cols-1 md:grid-cols-2 gap-6";
      list.forEach((m) => {
        const el = document.createElement("div");
        el.className = "border border-gray-200 rounded-xl p-6 bg-white";
        const h3 = document.createElement("h3");
        h3.className = "font-jakarta font-bold text-lg text-gray-900";
        // localized module title if available
        const modKey = (m.name || m.base_path || "").trim();
        const localized =
          window.DecafLocale &&
          window.DecafLocale.dict &&
          window.DecafLocale.dict.features &&
          window.DecafLocale.dict.features.modules &&
          window.DecafLocale.dict.features.modules[modKey];
        h3.textContent =
          localized && localized.title
            ? localized.title
            : m.title || m.name || modKey;
        const p = document.createElement("p");
        p.className = "text-gray-600 mt-2";
        p.textContent =
          localized && localized.summary
            ? localized.summary
            : DecafFeaturesCore.mdToPlain(m.description || "").split("\n")[0] ||
              "";
        const a = document.createElement("a");
        a.href = `features.html?module=${encodeURIComponent(m.name || m.base_path || "")}`;
        a.className = "text-indigo-600 hover:text-indigo-800 mt-3 inline-block";
        a.textContent = t("modules.see_examples");
        el.appendChild(h3);
        el.appendChild(p);
        el.appendChild(a);
        modsWrap.appendChild(el);
      });
      root.appendChild(modsWrap);
      return;
    }

    // existing per-module behavior below
    const mod = list.find(
      (m) => m && (m.name === name || m.base_path === name)
    );
    if (!mod) {
      renderError("examples.errors.not_found");
      return;
    }

    // render header
    renderHeader(mod);

    const root = document.getElementById("features-list");
    root.innerHTML = "";

    // gather feature items from locale file: features.modules.<module>.features -> array
    const dict = (window.DecafLocale && window.DecafLocale.dict) || {};
    const modKey = (mod.name || mod.base_path || "").trim();
    let locItems = [];
    try {
      const modLoc =
        dict.features && dict.features.modules
          ? dict.features.modules[modKey]
          : null;
      if (modLoc) {
        if (Array.isArray(modLoc.features))
          locItems = modLoc.features.map((f) => ({
            title: f.title || "",
            description: f.description || "",
          }));
        // Support flat keys: title_N / desc_N
        else if (modLoc.title_1 || modLoc.feature_1) {
          let i = 1;
          while (
            modLoc[`title_${i}`] ||
            modLoc[`desc_${i}`] ||
            modLoc[`feature_${i}`]
          ) {
            const title = modLoc[`title_${i}`] || modLoc[`feature_${i}`] || "";
            const description = modLoc[`desc_${i}`] || "";
            locItems.push({ title, description });
            i++;
          }
        }
      }
    } catch (e) {
      locItems = [];
    }

    // If no locale items, try some generic fields from module (summary + bullets from description)
    if (locItems.length === 0) {
      // attempt to extract first few bullets from markdown description
      const plain = DecafFeaturesCore.mdToPlain(mod.description || "");
      const lines = plain
        .split(/\n+/)
        .map((s) => s.trim())
        .filter(Boolean);
      // take first paragraph as summary and subsequent bullets as features
      if (lines.length > 0) {
        locItems.push({
          title: window.DecafLocale
            ? window.DecafLocale.t("features.kicker")
            : "Feature",
          description: lines[0],
        });
      }
      for (let i = 1; i < Math.min(6, lines.length); i++)
        locItems.push({ title: "", description: lines[i] });
    }

    // Render localized feature cards
    const grid = document.createElement("div");
    grid.className = "grid grid-cols-1 md:grid-cols-2 gap-6";
    locItems.forEach((it) => grid.appendChild(buildFeatureCard(it)));
    root.appendChild(grid);

    // Complement with HowToUse.md content (plain excerpt)
    try {
      const work = await DecafFeaturesCore.loadWorkdoc(
        mod.base_path || mod.name || ""
      );
      if (work && work.trim()) {
        const sec = document.createElement("div");
        sec.className = "mt-8";
        const h2 = document.createElement("h2");
        h2.className = "font-jakarta font-bold text-2xl text-gray-900 mb-4";
        h2.textContent = t("features.howto_title") || "How to use";
        const pre = document.createElement("pre");
        pre.className =
          "bg-gray-50 border border-gray-100 p-4 rounded-lg text-sm text-gray-800 overflow-x-auto whitespace-pre-wrap";
        // take first 800 chars
        pre.textContent =
          DecafFeaturesCore.mdToPlain(work).slice(0, 800) +
          (work.length > 800 ? "\n\n…" : "");
        sec.appendChild(h2);
        sec.appendChild(pre);
        root.appendChild(sec);
      }
    } catch (e) {
      // ignore workdoc failures
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
