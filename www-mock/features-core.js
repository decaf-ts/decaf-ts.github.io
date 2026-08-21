// filepath: /home/tvenceslau/local-workspace/decaf-ts/web-page/www/features-core.js
// Core utilities for features.html. Responsible for data loading and lightweight parsing.
(function () {
  function mdToPlain(text) {
    if (!text) return "";
    const noCode = text.replace(/```[\s\S]*?```/g, "");
    return noCode
      .replace(/[#>*_`~\[\]()!]/g, "")
      .replace(/\r\n|\r/g, "\n")
      .replace(/\n{2,}/g, "\n\n")
      .trim();
  }

  async function loadModules() {
    const res = await fetch("assets/modules.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("modules.json");
    return res.json();
  }

  async function loadWorkdoc(basePath) {
    if (!basePath) return "";
    // Try to fetch workdocs from repository root relative to this page
    // path: ../../<module>/workdocs/HowToUse.md
    const url = `../../${encodeURIComponent(basePath)}/workdocs/HowToUse.md`;
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) return "";
      const text = await res.text();
      return text;
    } catch (e) {
      return "";
    }
  }

  function getModuleLocale(dict, moduleKey) {
    if (!dict || !moduleKey) return null;
    try {
      if (
        dict.features &&
        dict.features.modules &&
        dict.features.modules[moduleKey]
      )
        return dict.features.modules[moduleKey];
    } catch (e) {}
    return null;
  }

  window.DecafFeaturesCore = {
    mdToPlain,
    loadModules,
    loadWorkdoc,
    getModuleLocale,
  };
})();
