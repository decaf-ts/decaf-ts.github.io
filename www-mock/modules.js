// Feature-specific JS: modules page renderer
(function () {
  async function loadModulesData() {
    try {
      const res = await fetch("assets/modules.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("Failed to load modules.json");
      return await res.json();
    } catch (e) {
      console.error("[modules] load failed", e);
      return [];
    }
  }

  function mdToPlain(text, max = 280) {
    if (!text) return "";
    // naive strip md for a short excerpt
    const noCode = text.replace(/```[\s\S]*?```/g, "");
    // remove common markdown chars first, then remove brackets/parentheses
    const step1 = noCode.replace(/[#>*_`~]/g, "");
    const step2 = step1.replace(/\[|\]|\(|\)|!/g, "");
    const noMd = step2.replace(/\n+/g, " ").trim();
    return noMd.length > max ? noMd.slice(0, max - 1) + "…" : noMd;
  }

  function renderModule(dict, mod, index) {
    const t = (k) => (window.DecafLocale ? window.DecafLocale.t(k) : k);
    const container = document.createElement("div");
    container.className = "grid grid-cols-1 lg:grid-cols-2 gap-20 items-center";

    // Decide layout: alternate like index showcase sections
    const leftContent = document.createElement("div");
    leftContent.className = "flex flex-col gap-8";
    const rightVisual = document.createElement("div");
    rightVisual.className = "relative";

    // Content (left)
    const textWrap = document.createElement("div");
    textWrap.className = "flex flex-col gap-4";
    const taglineWrap = document.createElement("div");
    const tagline = document.createElement("span");
    tagline.className =
      "text-red-400 text-sm font-semibold uppercase tracking-wide";
    tagline.textContent = t("modules.kicker");
    taglineWrap.appendChild(tagline);
    const main = document.createElement("div");
    main.className = "flex flex-col gap-6";
    const h2 = document.createElement("h2");
    h2.className =
      "font-jakarta font-bold text-5xl text-gray-900 leading-tight";
    // Title should link to features page for this module
    const titleText = mod.title || mod.name || "";
    const titleAnchor = document.createElement("a");
    titleAnchor.href = `features.html?module=${encodeURIComponent(mod.name || mod.base_path || "")}`;
    titleAnchor.className = "text-gray-900 hover:text-indigo-700";
    titleAnchor.textContent = titleText;
    h2.appendChild(titleAnchor);
    const p = document.createElement("p");
    p.className = "text-gray-600 text-lg leading-relaxed";
    p.textContent = mdToPlain(mod.description || "");
    main.appendChild(h2);
    main.appendChild(p);
    textWrap.appendChild(taglineWrap);
    textWrap.appendChild(main);

    const ctaWrap = document.createElement("div");
    const cta = document.createElement("a");
    cta.className =
      "bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-medium transition-all duration-300";
    cta.textContent = t("modules.see_examples");
    cta.href = `examples.html?module=${encodeURIComponent(mod.name || mod.base_path || "")}`;
    ctaWrap.appendChild(cta);

    // Add a secondary CTA for tutorials (localized)
    const tut = document.createElement("a");
    tut.className =
      "ml-4 inline-block bg-white text-indigo-600 px-5 py-3 rounded-full font-medium border border-indigo-600 hover:bg-indigo-50 transition-all duration-300";
    tut.textContent = t("modules.see_tutorials") || "See Tutorials";
    tut.href = `tutorials.html?module=${encodeURIComponent(mod.name || mod.base_path || "")}`;
    ctaWrap.appendChild(tut);

    leftContent.appendChild(textWrap);
    leftContent.appendChild(ctaWrap);

    // Visual (right)
    const panel = document.createElement("div");
    panel.className =
      "bg-red-50 rounded-t-[40px] rounded-b-[32px] min-h-[300px] h-auto w-full relative overflow-hidden flex items-center justify-center p-6";
    const inner = document.createElement("div");
    inner.className = "text-gray-400 w-full";
    const iconWrap = document.createElement("div");
    iconWrap.className =
      "w-20 h-20 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center";
    iconWrap.innerHTML = t("modules.demo_icon");
    const label = document.createElement("p");
    label.className = "text-sm text-red-400 font-medium text-center";
    label.textContent = t("modules.demo_label");
    inner.appendChild(iconWrap);
    inner.appendChild(label);

    // Preview label/icon only; detailed examples moved to examples.html
    panel.appendChild(inner);
    rightVisual.appendChild(panel);

    // Alternate columns
    if (index % 2 === 0) {
      container.appendChild(leftContent);
      container.appendChild(rightVisual);
    } else {
      container.appendChild(rightVisual);
      container.appendChild(leftContent);
    }

    return container;
  }

  async function start() {
    const dict = (window.DecafLocale && window.DecafLocale.dict) || {};
    const list = await loadModulesData();
    const root = document.getElementById("modules-list");
    if (!root) return;
    root.innerHTML = "";
    list.forEach((mod, i) => root.appendChild(renderModule(dict, mod, i)));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();
