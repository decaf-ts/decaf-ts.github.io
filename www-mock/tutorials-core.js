// filepath: /home/tvenceslau/local-workspace/decaf-ts/web-page/www/tutorials-core.js
// Core utilities for tutorials.html: data loading and example extraction
(function () {
  async function loadModules() {
    const res = await fetch("assets/modules.json", { cache: "no-cache" });
    if (!res.ok) throw new Error("modules.json");
    return res.json();
  }

  function mdToPlain(text) {
    if (!text) return "";
    const noCode = text.replace(/```[\s\S]*?```/g, "");
    // remove common markdown chars, handle square brackets separately
    return noCode
      .replace(/[#>*_`~]/g, "")
      .replace(/\[|\]/g, "")
      .replace(/\r\n|\r/g, "\n")
      .trim();
  }

  async function fetchFile(url) {
    try {
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) return "";
      return await res.text();
    } catch {
      return "";
    }
  }

  async function gatherSourcesForModule(moduleName) {
    const base = `../../${encodeURIComponent(moduleName)}`;
    const candidates = [
      `${base}/workdocs/HowToUse.md`,
      `${base}/README.md`,
      `${base}/src`,
      `${base}/tests`,
      `${base}/workdocs`,
    ];
    const results = [];
    // Attempt to fetch readme and howtouse files
    for (const c of candidates.slice(0, 2)) {
      const text = await fetchFile(c);
      if (text) results.push({ path: c, content: text });
    }
    // For directories (src/tests/workdocs) try common files by convention
    const srcFiles = [
      `${base}/src/index.ts`,
      `${base}/src/index.js`,
      `${base}/src/index.tsx`,
    ];
    for (const f of srcFiles) {
      const text = await fetchFile(f);
      if (text) results.push({ path: f, content: text });
    }
    // Try some test file names
    const testFiles = [
      `${base}/tests/index.test.ts`,
      `${base}/tests/index.test.js`,
    ];
    for (const f of testFiles) {
      const text = await fetchFile(f);
      if (text) results.push({ path: f, content: text });
    }
    return results;
  }

  function extractCodeBlocks(text, langHint) {
    if (!text) return [];
    const blocks = [];
    const codeRe = /```([a-zA-Z0-9]*)\n([\s\S]*?)```/g;
    let m;
    while ((m = codeRe.exec(text))) {
      const lang = m[1] || "";
      const code = m[2] || "";
      blocks.push({ lang, code });
    }
    // Also try to extract short TS/JS snippets from inline code when none found
    if (!blocks.length && langHint) {
      const lines = text.split("\n");
      const snippet = [];
      for (const l of lines) {
        if (
          l.trim().startsWith("import") ||
          l.includes("class ") ||
          l.includes("function ")
        )
          snippet.push(l);
        if (snippet.length >= 20) break;
      }
      if (snippet.length)
        blocks.push({ lang: langHint, code: snippet.join("\n") });
    }
    return blocks;
  }

  async function buildTutorialEntries(moduleName) {
    const sources = await gatherSourcesForModule(moduleName);
    const entries = [];
    for (const s of sources) {
      const blocks = extractCodeBlocks(s.content, "ts");
      for (const b of blocks) {
        const idx = s.content.indexOf(b.code);
        let context = "";
        if (idx >= 0) {
          context = s.content
            .slice(Math.max(0, idx - 300), idx)
            .split("\n")
            .slice(-3)
            .join(" ");
        }
        entries.push({
          source: s.path,
          lang: b.lang || "ts",
          code: b.code.trim(),
          context: mdToPlain(context).slice(0, 300),
        });
      }
    }
    // dedupe by code signature
    const seen = new Set();
    const dedup = [];
    for (const e of entries) {
      const key = e.code.slice(0, 120).replace(/\s+/g, " ");
      if (!seen.has(key)) {
        seen.add(key);
        dedup.push(e);
      }
    }
    return dedup;
  }

  window.DecafTutorialsCore = {
    loadModules,
    buildTutorialEntries,
  };
})();
