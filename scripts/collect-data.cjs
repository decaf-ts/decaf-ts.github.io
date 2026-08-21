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

process.exit(0);
