#!/usr/bin/env node
/* Build-time data collector: resolves the installed @decaf-ts packages reachable from
 * this workspace and emits the per-module slogan catalog (assets/data/slogans.json) and
 * the resolved package versions (assets/data/module-versions.json).
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const root = path.resolve(__dirname, '..');
const scopeDir = path.join(root, 'node_modules', '@decaf-ts');
const dataDir = path.join(root, 'src', 'assets', 'data');
const slogansTarget = path.join(dataDir, 'slogans.json');
const versionsTarget = path.join(dataDir, 'module-versions.json');
const modulesTarget = path.join(dataDir, 'modules.json');
const autoModulesTarget = path.join(dataDir, 'modules.auto.json');

if (!fs.existsSync(scopeDir)) {
  console.warn('[collect-data] @decaf-ts scope missing, nothing collected');
  process.exit(0);
}

const slogans = {};
const versions = {};

if (fs.existsSync(slogansTarget)) {
  try {
    Object.assign(slogans, JSON.parse(fs.readFileSync(slogansTarget, 'utf8')));
  } catch {
    // ignore malformed existing asset
  }
}

for (const name of fs.readdirSync(scopeDir)) {
  if (name.startsWith('.')) continue;
  const pkgDir = path.join(scopeDir, name);
  const real = fs.realpathSync(pkgDir);
  if (name === 'ts-workspace') continue;

  let entry = pkgDir;
  try {
    entry = real || pkgDir;
  } catch {
    entry = pkgDir;
  }

  const pkgFile = path.join(pkgDir, 'package.json');
  if (fs.existsSync(pkgFile)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'));
      if (pkg.version) versions[name] = pkg.version;
    } catch {
      // ignore malformed package files
    }
  }

  const candidates = globSync('**/slogans.json', {
    cwd: entry,
    ignore: ['**/node_modules/**', '**/dist/**', '**/doc/**'],
  });
  if (candidates.length) {
    try {
      const content = JSON.parse(
        fs.readFileSync(path.join(entry, candidates[candidates.length - 1]), 'utf8')
      );
      if (Array.isArray(content) && content.length) slogans[name] = content;
    } catch {
      // ignore malformed slogans
    }
  }
}

if (Object.keys(slogans).length) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(slogansTarget, JSON.stringify(slogans, null, 1));
  console.log(`[collect-data] wrote slogans for ${Object.keys(slogans).length} modules`);
} else {
  console.log('[collect-data] no dep slogans found; left existing slogans asset untouched');
}

if (Object.keys(versions).length) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(versionsTarget, JSON.stringify(versions, null, 1));
  console.log(`[collect-data] wrote versions for ${Object.keys(versions).length} packages`);
}

// Auto-generate minimal, localized stubs for decaf-ts modules that the content
// team has not (yet) described in modules.json. The frontend merges this asset
// under modules.json at runtime, so a newly installed module shows up on the page
// without a component change. Authored entries always win.
//
// Discovery sources (union):
//   1. the umbrella repo's .gitmodules paths (one submodule per module dir);
//   2. the installed node_modules/@decaf-ts packages.
// Workspace-only repos that are not published documentation modules (the site
// itself, the template, and tooling-only repos) are excluded.
const workspaceRoot = path.resolve(root, '..');
const EXCLUDED_MODULES = new Set([
  'web-page',
  'ts-template',
  'ts-workspace',
  'with-ai',
  'reusable-actions',
  'flipbored',
]);

// Verified GitHub Pages docs bases (the deployed `decaf-ts.github.io/<repo>/` sites).
// Used to derive the `docs`/`githubPages` links of auto-discovered modules.
const GITHUB_PAGES = new Set([
  'utils', 'logging', 'decoration', 'decorator-validation', 'injectable-decorators',
  'as-zod', 'db-decorators', 'transactional-decorators', 'core', 'crypto',
  'for-http', 'ui-decorators', 'cli', 'for-couchdb', 'for-nano', 'for-pouch',
  'for-typeorm', 'for-fabric', 'for-nest', 'for-angular', 'fabric-weaver',
  'reflection',
]);

// Storyboard links for UI libraries that publish stories in their repo.
const STORYBOARDS = {
  'for-angular': 'https://github.com/decaf-ts/for-angular/tree/master/src/stories',
};

function cleanRepoUrl(url) {
  let repo = url
    .trim()
    .replace(/^git@github\.com:/, 'https://github.com/')
    .replace(/\.git$/, '');
  // never persist embedded credentials
  repo = repo.replace(/https:\/\/[^@/]+@/, 'https://');
  return repo;
}

function readGitmodules() {
  const file = path.join(workspaceRoot, '.gitmodules');
  const discovered = {};
  if (!fs.existsSync(file)) return discovered;
  try {
    const text = fs.readFileSync(file, 'utf8');
    const re = /\[submodule "([^"]+)"\]\s*\n\s*path = ([^\n]+)\s*\n\s*url = ([^\n]+)/g;
    let match;
    while ((match = re.exec(text))) {
      const dir = match[2].trim();
      const url = cleanRepoUrl(match[3]);
      if (!url || !dir) continue;
      discovered[dir] = url;
    }
  } catch {
    console.warn('[collect-data] could not parse .gitmodules');
  }
  return discovered;
}

function readWorkspaceDirs() {
  const discovered = {};
  try {
    for (const name of fs.readdirSync(workspaceRoot)) {
      if (name.startsWith('.') || EXCLUDED_MODULES.has(name)) continue;
      const pkgFile = path.join(workspaceRoot, name, 'package.json');
      if (!fs.existsSync(pkgFile)) continue;
      discovered[name] = `https://github.com/decaf-ts/${name}`;
    }
  } catch {
    console.warn('[collect-data] could not scan workspace directories');
  }
  return discovered;
}

function extractExamples(name) {
  const base = path.join(scopeDir, name);
  const files = [
    path.join(base, 'workdocs', '5-HowToUse.md'),
    path.join(base, 'workdocs', '4-Description.md'),
    path.join(base, 'README.md'),
  ];
  const blocks = [];
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    try {
      const text = fs.readFileSync(file, 'utf8');
      const re = /```([a-zA-Z0-9_.-]*)\n([\s\S]*?)```/g;
      let match;
      while ((match = re.exec(text))) {
        const lang = match[1] || 'typescript';
        const code = match[2].trim();
        if (!code) continue;
        if (/compilerOptions|"scripts"|"name"\s*:|"version"\s*:/.test(code)) continue;
        if (/^["']?@?decaf-ts\/[\w.-]+["']?\s*:\s*["']?/.test(code)) continue;
        if (/^(import|export)\s/.test(code) && code.split('\n').length <= 2) continue;
        if (/^\{\s*["']?name/.test(code)) continue;
        blocks.push({ lang, code });
      }
    } catch {
      // ignore unreadable docs
    }
  }
  return blocks.slice(0, 4).map((block, i) => ({
    title: { en: `Example ${i + 1}`, pt: `Exemplo ${i + 1}` },
    context: {
      en: `Extracted from the ${name} documentation.`,
      pt: `Extraído da documentação de ${name}.`,
    },
    lang: block.lang,
    code: block.code,
  }));
}

const authoredNames = new Set();
if (fs.existsSync(modulesTarget)) {
  try {
    const authored = JSON.parse(fs.readFileSync(modulesTarget, 'utf8'));
    if (Array.isArray(authored)) {
      for (const entry of authored) {
        if (entry && typeof entry.name === 'string') authoredNames.add(entry.name);
      }
    }
  } catch {
    console.warn('[collect-data] modules.json is not valid JSON; auto stubs will cover every module');
  }
}

const discovered = readGitmodules();
for (const [name, url] of Object.entries(readWorkspaceDirs())) {
  if (!discovered[name]) discovered[name] = url;
}
for (const name of Object.keys(versions)) {
  if (!discovered[name]) discovered[name] = `https://github.com/decaf-ts/${name}`;
}

const autoModules = Object.keys(discovered)
  .filter((name) => !EXCLUDED_MODULES.has(name) && !authoredNames.has(name))
  .sort()
  .map((name) => {
    const repoUrl = discovered[name];
    const repoName = repoUrl.split('/').pop();
    const docs = GITHUB_PAGES.has(repoName)
      ? `https://decaf-ts.github.io/${repoName}/`
      : `${repoUrl}#readme`;
    return {
      name,
      package: versions[name] ? `@decaf-ts/${name}` : undefined,
      title: { en: name, pt: name },
      description: {
        en: `@decaf-ts/${name} module.`,
        pt: `Módulo @decaf-ts/${name}.`,
      },
      summary: {
        en: `@decaf-ts/${name} module.`,
        pt: `Módulo @decaf-ts/${name}.`,
      },
      links: {
        repo: repoUrl,
        docs,
        githubPages: GITHUB_PAGES.has(repoName) ? docs : null,
        storyboard: STORYBOARDS[repoName] || null,
      },
      features: [],
      examples: extractExamples(name),
      tutorials: [],
    };
  });

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(autoModulesTarget, JSON.stringify(autoModules, null, 1));
console.log(
  `[collect-data] discovered ${Object.keys(discovered).length} module(s); wrote ${autoModules.length} auto stub(s); ${authoredNames.size} authored`
);

process.exit(0);
