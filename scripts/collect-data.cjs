#!/usr/bin/env node
/* Build-time data collector.
 *
 * Responsibilities:
 *  1. resolve the installed @decaf-ts packages reachable from this workspace and
 *     emit the per-module slogan catalog (assets/data/slogans.json) and the
 *     resolved package versions (assets/data/module-versions.json);
 *  2. reconcile the authored module roster (assets/data/modules.json) against the
 *     umbrella repo `.gitmodules`, which is the SOLE source of truth for the
 *     roster and its order:
 *       - prune every module that is not in `.gitmodules`;
 *       - reorder the records to match `.gitmodules`;
 *       - fill in the authored records for modules the content team has not
 *         described yet (assets/data/modules.auto.json);
 *       - drop `links.githubPages` when it duplicates `links.docs`;
 *       - make sure every feature exposes at least one real code example and the
 *         module description carries markdown structure (headings + lists);
 *  3. write the merged, ordered roster back to assets/data/modules.json.
 *
 * The pipeline is idempotent: running it twice produces the same assets.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { globSync } = require('glob');

const root = path.resolve(__dirname, '..');
const workspaceRoot = path.resolve(root, '..');
const scopeDir = path.join(root, 'node_modules', '@decaf-ts');
const dataDir = path.join(root, 'src', 'assets', 'data');
const slogansTarget = path.join(dataDir, 'slogans.json');
const versionsTarget = path.join(dataDir, 'module-versions.json');
const modulesTarget = path.join(dataDir, 'modules.json');
const autoModulesTarget = path.join(dataDir, 'modules.auto.json');
const newsTarget = path.join(dataDir, 'news.json');
const newsCopyTarget = path.join(dataDir, 'news-copy.json');

// Latest-release news pipeline: one public GitHub Releases request per roster
// repository, merged into a single `assets/data/news.json` consumed by the /news
// page. The pipeline is best-effort and never fails the build: on any network or
// rate-limit error the previously collected asset is preserved (or an empty array
// is written on the first run).
const NEWS_API = 'https://api.github.com/repos/decaf-ts';
const NEWS_PER_REPO = 4;
const NEWS_TOTAL_LIMIT = 48;
const NEWS_TIMEOUT_MS = 8000;
const NEWS_BODY_LIMIT = 6000;

// Editorial bar authored by the content team in `assets/data/news-copy.json`: the
// readable item shape, the excerpt bounds, the thin/empty-body fallback and the
// dedupe key. Defaults mirror the authored rules so a missing asset never breaks
// the pipeline.
const NEWS_COPY_DEFAULTS = {
  excerptMaxChars: 280,
  excerptMinChars: 80,
};
const newsCopy = readJson(newsCopyTarget, {});
const newsRules = { ...NEWS_COPY_DEFAULTS, ...((newsCopy && newsCopy.editorialRules) || {}) };

// Workspace-only repos that are not published documentation modules: the site
// itself, the template/tooling, and the untracked company app. The roster is
// `.gitmodules` minus these.
const EXCLUDED_MODULES = new Set(['web-page', 'ts-template', 'ts-workspace', 'flipbored']);

// Verified GitHub Pages docs bases (the deployed `decaf-ts.github.io/<repo>/` sites).
const GITHUB_PAGES = new Set([
  'utils', 'logging', 'decoration', 'decorator-validation', 'injectable-decorators',
  'as-zod', 'db-decorators', 'transactional-decorators', 'core', 'crypto',
  'for-http', 'ui-decorators', 'cli', 'for-couchdb', 'for-nano', 'for-pouch',
  'for-typeorm', 'for-fabric', 'for-nest', 'for-angular', 'fabric-weaver',
  'with-ai', 'testing', 'integrations', 'styles', 'for-react', 'for-nextjs',
]);

// Storyboard links for UI libraries that publish stories in their repo.
const STORYBOARDS = {
  'for-angular': 'https://github.com/decaf-ts/for-angular/tree/master/src/stories',
};

// Global (module-agnostic) slogans, always present under the `global` key so the
// slogan rotator has a module-neutral pool on top of the per-module catalog.
const GLOBAL_SLOGANS = [
  { Slogan: 'Decaf: less boilerplate, more shipping.', Tags: 'Global, DX, Productivity' },
  { Slogan: 'One model. Every database. Every UI.', Tags: 'Global, Cross-persistence, Cross-UI' },
  { Slogan: 'Decorate once, generate everywhere.', Tags: 'Global, Decoration, Codegen' },
  { Slogan: 'TypeScript-first. Framework-agnostic.', Tags: 'Global, TypeScript, Architecture' },
  { Slogan: 'Build boldly. Brewed for developers.', Tags: 'Global, DX, Coffee-themed' },
  { Slogan: 'Modular by design. Productive by default.', Tags: 'Global, Modules, DX' },
  { Slogan: 'Models are the architecture.', Tags: 'Global, Model-centric, Architecture' },
  { Slogan: 'Ship full-stack without the glue code.', Tags: 'Global, Full-stack, Productivity' },
];

// Per-module slogans for modules that do not publish their own slogans.json. The
// installed dependency catalog still wins for modules that do; these are merged in.
const MODULE_SLOGANS = {
  testing: [
    { Slogan: 'Decaf-TS testing: evidence, not guesswork.', Tags: 'Testing, Evidence, DX' },
    { Slogan: 'Fail loudly, report clearly.', Tags: 'Testing, Reports, Calm' },
  ],
  crypto: [
    { Slogan: 'Encrypt the field, not the whole app.', Tags: 'Crypto, Security, Decorators' },
    { Slogan: 'Secrets stay secret. Even at rest.', Tags: 'Crypto, Security, Encryption' },
  ],
  integrations: [
    { Slogan: 'Wire the platform, not the feature.', Tags: 'Integrations, Platform, DX' },
    { Slogan: 'Keycloak, Docker, blobs and flags — one layer.', Tags: 'Integrations, Services' },
  ],
  demo: [
    { Slogan: 'See it running before you write a line.', Tags: 'Demo, DX, Onboarding' },
    { Slogan: 'A full decaf app, ready to poke at.', Tags: 'Demo, Reference, App' },
  ],
  'for-drizzle': [
    { Slogan: 'SQL, decorated — not duplicated.', Tags: 'Drizzle, Persistence, Decorators' },
    { Slogan: 'Your schema, your queries, decaf models.', Tags: 'Drizzle, SQL, Repository' },
  ],
  weaver: [
    { Slogan: 'Weave Fabric contracts from TypeScript.', Tags: 'Fabric, Weaver, Chaincode' },
    { Slogan: 'Chaincode without the chain of pain.', Tags: 'Fabric, Blockchain, DX' },
  ],
  'with-ai': [
    { Slogan: 'Your AI harness, fluent in decaf.', Tags: 'AI, Skills, Agents' },
    { Slogan: 'Skills, agents and MCP — shipped with the framework.', Tags: 'AI, MCP, Tooling' },
  ],
  'reusable-actions': [
    { Slogan: 'CI that writes itself once and runs everywhere.', Tags: 'CI/CD, Actions, Reuse' },
    { Slogan: 'One workflow, every repository.', Tags: 'CI/CD, GitHub Actions, DX' },
  ],
  'for-nextjs': [
    { Slogan: 'Server components, decaf models.', Tags: 'Next.js, React, UI' },
    { Slogan: 'The same model renders on the Next edge.', Tags: 'Next.js, Cross-UI, Rendering' },
  ],
  'for-react': [
    { Slogan: 'React views straight from the model.', Tags: 'React, UI, Rendering' },
    { Slogan: 'Hooks and forms, generated from decorators.', Tags: 'React, Hooks, Forms' },
  ],
  'as-infra': [
    { Slogan: 'Infrastructure as a decaf contract.', Tags: 'Infra, Contracts, TypeScript' },
    { Slogan: 'Provision it, test it, ship it.', Tags: 'Infra, IaC, DX' },
  ],
  'as-graph': [
    { Slogan: 'Graphs you can reason about.', Tags: 'Graph, Workflow, Architecture' },
    { Slogan: 'Nodes, ports and edges — typed.', Tags: 'Graph, Types, Workflow' },
  ],
};

// Full authored records for roster modules that are not yet described in
// modules.json. Authored entries already present in modules.json always win.
const AUTHORED_MODULES = {
  'with-ai': {
    name: 'with-ai',
    package: '@decaf-ts/with-ai',
    title: { en: 'With AI', pt: 'With AI' },
    summary: {
      en: 'The decaf-ts AI tooling package: the authoritative skills and agents catalog, plus an MCP server and a decaf CLI module.',
      pt: 'O pacote de ferramentas de IA do decaf-ts: o catálogo autoritativo de skills e agentes, além de um servidor MCP e um módulo CLI decaf.',
    },
    description: {
      en: '`@decaf-ts/with-ai` is the decaf-ts AI tooling package. It ships the canonical catalog of decaf skills and agents under `skills/` and `agents/`, consumed by AI harnesses and by Paperclip orchestration. Its detached Model Context Protocol (MCP) server exposes Jira, Xray and common tooling; it boots with `decaf with-ai mcp` or the `decaf-mcp` binary, builds clients per tool request, loads credentials lazily so a missing variable never breaks boot, and gates destructive tools behind a server-level policy. The Streamable HTTP transport is bearer-token authenticated and loopback-bound by default. The CLI module also provides `decaf with-ai encrypt-assets` for build-time encryption of AI-value content and `decaf with-ai install-skills` to decrypt and symlink the packaged skills into an AI harness.',
      pt: '`@decaf-ts/with-ai` é o pacote de ferramentas de IA do decaf-ts. Ele fornece o catálogo canônico de skills e agentes decaf em `skills/` e `agents/`, consumido por harnesses de IA e pela orquestração do Paperclip. Seu servidor Model Context Protocol (MCP) independente expõe Jira, Xray e ferramentas comuns; ele inicia com `decaf with-ai mcp` ou o binário `decaf-mcp`, cria clientes por requisição de ferramenta, carrega credenciais de forma preguiçosa para que uma variável ausente nunca quebre o boot, e protege ferramentas destrutivas com uma política no nível do servidor. O módulo CLI também oferece `decaf with-ai encrypt-assets` para criptografia de conteúdo de valor de IA em tempo de build e `decaf with-ai install-skills` para descriptografar e criar symlinks das skills empacotadas em um harness de IA.',
    },
    links: {
      repo: 'https://github.com/decaf-ts/with-ai',
      docs: 'https://decaf-ts.github.io/with-ai/',
      githubPages: null,
      storyboard: null,
    },
    features: [
      {
        title: { en: 'Skills & agents catalog', pt: 'Catálogo de skills e agentes' },
        description: {
          en: 'Canonical markdown skills and agents, consumed by AI harnesses and Paperclip orchestration.',
          pt: 'Skills e agentes canônicos em markdown, consumidos por harnesses de IA e pela orquestração do Paperclip.',
        },
      },
      {
        title: { en: 'MCP server', pt: 'Servidor MCP' },
        description: {
          en: 'A detached Model Context Protocol server exposing Jira, Xray and common tooling over stdio or Streamable HTTP.',
          pt: 'Um servidor Model Context Protocol independente que expõe Jira, Xray e ferramentas comuns via stdio ou Streamable HTTP.',
        },
      },
      {
        title: { en: 'Lazy credential loading', pt: 'Carregamento preguiçoso de credenciais' },
        description: {
          en: 'The server always boots; a tool whose variables are missing returns a clear error on call instead of failing startup.',
          pt: 'O servidor sempre inicia; uma ferramenta com variáveis ausentes retorna um erro claro na chamada em vez de falhar na inicialização.',
        },
      },
      {
        title: { en: 'Destructive-tool policy', pt: 'Política para ferramentas destrutivas' },
        description: {
          en: 'A server-level policy gates destructive tools behind confirm, allow or block.',
          pt: 'Uma política no nível do servidor controla ferramentas destrutivas com confirm, allow ou block.',
        },
      },
      {
        title: { en: 'CLI commands', pt: 'Comandos CLI' },
        description: {
          en: '`decaf with-ai mcp`, `encrypt-assets` and `install-skills` cover boot, packaging and harness setup.',
          pt: '`decaf with-ai mcp`, `encrypt-assets` e `install-skills` cobrem boot, empacotamento e configuração do harness.',
        },
      },
    ],
    examples: [
      {
        title: { en: 'Boot the MCP server', pt: 'Iniciar o servidor MCP' },
        context: {
          en: 'Launch the with-ai MCP server with the Jira preset and read-only tool filtering.',
          pt: 'Inicie o servidor MCP do with-ai com o preset Jira e filtro somente leitura de ferramentas.',
        },
        lang: 'bash',
        code: 'BANNER=false npx -y -p @decaf-ts/cli@latest -p @decaf-ts/utils@latest -p inquirer -p @decaf-ts/with-ai@latest decaf with-ai mcp --preset jira --read-only',
      },
      {
        title: { en: 'Install the packaged skills', pt: 'Instalar as skills empacotadas' },
        context: {
          en: 'Decrypt and symlink the packaged skills into the configured AI harness.',
          pt: 'Descriptografe e crie symlinks das skills empacotadas no harness de IA configurado.',
        },
        lang: 'bash',
        code: 'npx -y @decaf-ts/with-ai@latest install-skills',
      },
    ],
    tutorials: [
      {
        title: { en: 'MCP server setup', pt: 'Configuração do servidor MCP' },
        summary: {
          en: 'Presets, environment variables, client configs and the HTTP transport.',
          pt: 'Presets, variáveis de ambiente, configurações de cliente e o transporte HTTP.',
        },
        code: '',
      },
      {
        title: { en: 'Install the skills into a harness', pt: 'Instalar as skills em um harness' },
        summary: {
          en: 'Use install-skills to decrypt and symlink the catalog for Claude Code or Codex.',
          pt: 'Use install-skills para descriptografar e criar symlinks do catálogo para Claude Code ou Codex.',
        },
        code: '',
      },
    ],
  },
  'reusable-actions': {
    name: 'reusable-actions',
    package: null,
    title: { en: 'Reusable Actions', pt: 'Actions Reutilizáveis' },
    summary: {
      en: 'Shared GitHub Actions workflows: build, coverage, CodeQL, Snyk, Trivy scans, Renovate remediation and release automation.',
      pt: 'Workflows compartilhados do GitHub Actions: build, cobertura, CodeQL, Snyk, varreduras Trivy, remediação Renovate e automação de releases.',
    },
    description: {
      en: 'The `reusable-actions` repository is the workspace scaffold for shared GitHub Actions workflows. It extracts the baseline workflow set used across every decaf-ts repository — CodeQL analysis, Jest coverage, production builds, Pages deployment, publish-on-release, release-on-merge and release-on-tag — into `workflow_call` reusable workflows that a repository consumes as a thin caller pinned to `@master`. It also ships the security remediation pair: `trivy-scan.yml` runs a filesystem vulnerability scan and dispatches a Renovate trigger when findings appear, while `renovate.yml` runs Renovate with a configurable remediation strategy (`overrides`, `bump-dependents` or both) and prunes stale `overrides` once a package is no longer flagged.',
      pt: 'O repositório `reusable-actions` é o scaffold de workspace para workflows compartilhados do GitHub Actions. Ele extrai o conjunto base de workflows usado em todos os repositórios decaf-ts — análise CodeQL, cobertura Jest, builds de produção, deploy de Pages, publish-on-release, release-on-merge e release-on-tag — para workflows reutilizáveis `workflow_call` que um repositório consome como caller fino fixado em `@master`. Ele também fornece o par de remediação de segurança: `trivy-scan.yml` executa uma varredura de vulnerabilidades no sistema de arquivos e dispara um gatilho de Renovate quando encontra achados, enquanto `renovate.yml` executa o Renovate com estratégia configurável (`overrides`, `bump-dependents` ou ambas) e remove `overrides` obsoletos quando um pacote deixa de ser sinalizado.',
    },
    links: {
      repo: 'https://github.com/decaf-ts/reusable-actions',
      docs: 'https://github.com/decaf-ts/reusable-actions#readme',
      githubPages: null,
      storyboard: null,
    },
    features: [
      {
        title: { en: 'Reusable workflows', pt: 'Workflows reutilizáveis' },
        description: {
          en: 'Build, coverage, CodeQL, Snyk, Pages and release workflows consumed with `workflow_call`.',
          pt: 'Workflows de build, cobertura, CodeQL, Snyk, Pages e release consumidos com `workflow_call`.',
        },
      },
      {
        title: { en: 'Trivy vulnerability scan', pt: 'Varredura de vulnerabilidades Trivy' },
        description: {
          en: '`trivy-scan.yml` filters by severity, uploads `trivy-report.json` and dispatches a Renovate trigger.',
          pt: '`trivy-scan.yml` filtra por severidade, envia `trivy-report.json` e dispara um gatilho do Renovate.',
        },
      },
      {
        title: { en: 'Renovate remediation', pt: 'Remediação com Renovate' },
        description: {
          en: '`renovate.yml` applies security updates with `overrides` or `bump-dependents` strategies.',
          pt: '`renovate.yml` aplica atualizações de segurança com estratégias `overrides` ou `bump-dependents`.',
        },
      },
      {
        title: { en: 'Stale override cleanup', pt: 'Limpeza de overrides obsoletos' },
        description: {
          en: 'Removes `overrides` whose package is no longer vulnerable in the latest report.',
          pt: 'Remove `overrides` cujo pacote não é mais vulnerável no relatório mais recente.',
        },
      },
      {
        title: { en: 'Automerge security PRs', pt: 'Automerge de PRs de segurança' },
        description: {
          en: 'Automerges security PRs once CI is green, scoped by `matchPackageNames`.',
          pt: 'Faz automerge de PRs de segurança quando o CI fica verde, com escopo por `matchPackageNames`.',
        },
      },
    ],
    examples: [
      {
        title: { en: 'Call the shared coverage workflow', pt: 'Chamar o workflow compartilhado de cobertura' },
        context: {
          en: 'A repository workflow becomes a thin caller pinned to @master.',
          pt: 'O workflow de um repositório se torna um caller fino fixado em @master.',
        },
        lang: 'yaml',
        code: 'name: "Test Coverage"\n\non:\n  push:\n    branches: ["master"]\n\njobs:\n  coverage:\n    uses: decaf-ts/reusable-actions/.github/workflows/jest-coverage.yaml@master\n    secrets: inherit',
      },
      {
        title: { en: 'Call the Trivy scan workflow', pt: 'Chamar o workflow de varredura Trivy' },
        context: {
          en: 'Run a severity-filtered vulnerability scan and upload the report artifact.',
          pt: 'Execute uma varredura de vulnerabilidades filtrada por severidade e envie o artefato de relatório.',
        },
        lang: 'yaml',
        code: 'jobs:\n  trivy:\n    uses: decaf-ts/reusable-actions/.github/workflows/trivy-scan.yml@master\n    with:\n      scan-type: vuln\n      severity: HIGH,CRITICAL\n      exit-code: "1"\n      upload-artifact: "true"\n    secrets: inherit',
      },
    ],
    tutorials: [
      {
        title: { en: 'Adopt the shared workflows', pt: 'Adotar os workflows compartilhados' },
        summary: {
          en: 'Point a repository workflow at the reusable workflow pinned to @master.',
          pt: 'Aponte o workflow de um repositório para o workflow reutilizável fixado em @master.',
        },
        code: '',
      },
      {
        title: { en: 'Configure the Renovate strategy', pt: 'Configurar a estratégia do Renovate' },
        summary: {
          en: 'Select overrides, bump-dependents or both for security remediation.',
          pt: 'Selecione overrides, bump-dependents ou ambos para remediação de segurança.',
        },
        code: '',
      },
    ],
  },
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

function readJson(file, fallback) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

/**
 * Parse the umbrella `.gitmodules` into an ordered roster. The order of the
 * returned array is the order of the file, and therefore the canonical roster
 * order of the generated modules asset.
 */
function readGitmodules() {
  const file = path.join(workspaceRoot, '.gitmodules');
  const modules = [];
  if (!fs.existsSync(file)) return modules;
  try {
    const text = fs.readFileSync(file, 'utf8');
    const re = /\[submodule "([^"]+)"\]\s*\n\s*path = ([^\n]+)\s*\n\s*url = ([^\n]+)/g;
    let match;
    while ((match = re.exec(text))) {
      const name = match[2].trim();
      const url = cleanRepoUrl(match[3]);
      if (!name || !url) continue;
      modules.push({ name, url });
    }
  } catch {
    console.warn('[collect-data] could not parse .gitmodules');
  }
  return modules;
}

function readWorkspaceVersions() {
  const versions = {};
  try {
    for (const name of fs.readdirSync(workspaceRoot)) {
      if (name.startsWith('.') || EXCLUDED_MODULES.has(name)) continue;
      const pkgFile = path.join(workspaceRoot, name, 'package.json');
      if (!fs.existsSync(pkgFile)) continue;
      const pkg = readJson(pkgFile, null);
      if (pkg && pkg.version) versions[name] = pkg.version;
    }
  } catch {
    // ignore unreadable workspace
  }
  return versions;
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

/**
 * Attach one real code example to every feature that does not have one yet.
 * Examples come from the module's own harvested example pool, so the snippets
 * are real and runnable rather than placeholders. Idempotent: features that
 * already expose examples are left untouched.
 */
function attachFeatureExamples(entry) {
  const pool = (entry.examples || []).filter((e) => e && e.code);
  if (!pool.length || !Array.isArray(entry.features)) return;
  entry.features = entry.features.map((feature, i) => {
    if (Array.isArray(feature.examples) && feature.examples.length) return feature;
    const picked = pool[i % pool.length];
    return { ...feature, examples: [picked] };
  });
}

/**
 * Give the module description real markdown structure (a heading and a bullet
 * list of the module's own capabilities) so the features page renders formatted
 * copy instead of a flat blob. Idempotent: a description that already carries
 * markdown structure is left untouched.
 */
function formatDescription(entry) {
  const description = entry.description;
  if (!description || typeof description !== 'object') return;
  const formatted = {};
  for (const lang of ['en', 'pt']) {
    const lead = description[lang];
    if (!lead) {
      formatted[lang] = lead;
      continue;
    }
    if (/(^|\n)#{1,6}\s|\n[-*]\s/.test(lead)) {
      formatted[lang] = lead;
      continue;
    }
    const capabilities = (entry.features || [])
      .map((f) => {
        const title = f.title?.[lang] || f.title?.en || '';
        const text = f.description?.[lang] || f.description?.en || '';
        if (!title) return '';
        return `- **${title}**${text ? ` — ${text}` : ''}`;
      })
      .filter(Boolean);
    formatted[lang] = capabilities.length
      ? `${lead}\n\n### Capabilities\n\n${capabilities.join('\n')}`
      : lead;
  }
  entry.description = formatted;
}

/**
 * Drop `links.githubPages` when it duplicates `links.docs` (board req 1: keep the
 * documentation link). Any non-duplicate githubPages value is preserved.
 */
function dedupeLinks(entry) {
  const links = entry.links;
  if (!links || typeof links !== 'object') return;
  if (links.githubPages && links.githubPages === links.docs) {
    links.githubPages = null;
  }
}

function dedupeSlogans(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const text = (item && (item.Slogan || item.text)) || '';
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(item);
  }
  return out;
}

function autoStub(name, url) {
  const repoName = url.split('/').pop();
  const docs = GITHUB_PAGES.has(repoName)
    ? `https://decaf-ts.github.io/${repoName}/`
    : `${url}#readme`;
  return {
    name,
    package: undefined,
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
      repo: url,
      docs,
      githubPages: null,
      storyboard: STORYBOARDS[repoName] || null,
    },
    features: [],
    examples: extractExamples(name),
    tutorials: [],
  };
}

// ---------------------------------------------------------------------------
// 1. versions + slogans
// ---------------------------------------------------------------------------

const slogans = {};
if (fs.existsSync(slogansTarget)) {
  Object.assign(slogans, readJson(slogansTarget, {}));
}

const versions = {};
const workspaceVersions = readWorkspaceVersions();
Object.assign(versions, workspaceVersions);

if (fs.existsSync(scopeDir)) {
  for (const name of fs.readdirSync(scopeDir)) {
    if (name.startsWith('.')) continue;
    const pkgDir = path.join(scopeDir, name);
    if (name === 'ts-workspace') continue;
    const pkgFile = path.join(pkgDir, 'package.json');
    if (fs.existsSync(pkgFile)) {
      const pkg = readJson(pkgFile, null);
      if (pkg && pkg.version && !versions[name]) versions[name] = pkg.version;
    }

    const candidates = globSync('**/slogans.json', {
      cwd: pkgDir,
      ignore: ['**/node_modules/**', '**/dist/**', '**/doc/**'],
    });
    if (candidates.length) {
      const content = readJson(path.join(pkgDir, candidates[candidates.length - 1]), null);
      if (Array.isArray(content) && content.length) {
        slogans[name] = dedupeSlogans([...(slogans[name] || []), ...content]);
      }
    }
  }
}

// Authored per-module slogans for modules without a dependency catalog.
for (const [name, list] of Object.entries(MODULE_SLOGANS)) {
  slogans[name] = dedupeSlogans([...(slogans[name] || []), ...list]);
}

// The module-neutral pool is always present.
slogans.global = GLOBAL_SLOGANS;

// ---------------------------------------------------------------------------
// 2. module roster reconciliation
// ---------------------------------------------------------------------------

const gitmodules = readGitmodules();
const roster = gitmodules.filter(({ name }) => !EXCLUDED_MODULES.has(name));
const rosterNames = roster.map(({ name }) => name);

const authored = readJson(modulesTarget, null);
const authoredByName = new Map();
if (Array.isArray(authored)) {
  for (const entry of authored) {
    if (entry && typeof entry.name === 'string') authoredByName.set(entry.name, entry);
  }
}

// `.gitmodules` is the SOLE source of the roster: discovery never unions in
// workspace directories or installed packages, so a deprecated submodule (such as the
// removed reflection/mcp-server) cannot leak back into the content.
const discovered = {};
for (const { name, url } of roster) discovered[name] = url;

const orderedModules = roster
  .map(({ name, url }) => {
    const entry = authoredByName.get(name) || AUTHORED_MODULES[name] || autoStub(name, url);
    return { ...entry, name };
  })
  .map((entry) => {
    dedupeLinks(entry);
    attachFeatureExamples(entry);
    formatDescription(entry);
    return entry;
  });

const authoredNames = new Set(orderedModules.map((m) => m.name));
const autoModules = roster
  .map(({ name, url }) => name)
  .filter((name) => !authoredNames.has(name))
  .map((name) => autoStub(name, discovered[name]));

// Never persist content for a module that is not in the roster: a deprecated
// submodule must not survive in the slogans or versions assets either.
const rosterSlogans = { global: slogans.global || GLOBAL_SLOGANS };
for (const name of authoredNames) {
  if (Array.isArray(slogans[name]) && slogans[name].length) {
    rosterSlogans[name] = dedupeSlogans(slogans[name]);
  }
}

const rosterVersions = {};
for (const name of authoredNames) {
  if (versions[name]) rosterVersions[name] = versions[name];
}

// ---------------------------------------------------------------------------
// 3. latest-release news
// ---------------------------------------------------------------------------

// One-line module summaries keyed by roster name: the editorial fallback for
// releases whose body is empty or merely repeats the version string.
const moduleSummaries = new Map();
for (const entry of orderedModules) {
  const summary = entry.summary || entry.description || '';
  const value = typeof summary === 'string' ? summary : summary.en || summary.pt || '';
  if (value) moduleSummaries.set(entry.name, value);
}

/**
 * Resolve the GitHub repository name of a roster module from its `.gitmodules` url.
 * The module `name` (a local directory) and the remote repo name can differ
 * (`testing` lives in `decaf-ts/for-testing`), so the remote name is always the
 * last path segment of the cleaned url.
 */
function repoNameOf(url) {
  return (url || '').split('/').filter(Boolean).pop() || '';
}

/**
 * Fetch one url as JSON with a hard timeout. Rejects on a non-2xx response so the
 * caller can fall back to the previous asset.
 */
async function fetchJson(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NEWS_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'decaf-ts-web-page-collector',
      },
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Extract a readable plain-text excerpt from a release body (markdown changelog).
 * Headings, list bullets and links are flattened so the news card never renders
 * raw markdown syntax.
 */
function releaseExcerpt(body, maxChars) {
  return (body || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/^#{1,6}\s.*$/gm, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>]/g, '')
    .replace(/\r/g, '')
    .split('\n')
    .map((line) => line.replace(/^\s*[-+]\s*/, '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxChars);
}

/**
 * Whether a release excerpt is too thin to render on its own: empty, shorter than
 * the authored minimum, or merely repeating the release tag/version. Most bodies in
 * this org are just the version string, so these items fall back to the module
 * summary.
 */
function isThinExcerpt(excerpt, tag) {
  const value = (excerpt || '').trim();
  if (value.length < newsRules.excerptMinChars) return true;
  const normalized = value.toLowerCase().replace(/^v/, '');
  const tagValue = (tag || '').toLowerCase().replace(/^v/, '');
  return tagValue.length > 0 && normalized === tagValue;
}

/**
 * Map one GitHub release payload to the site news entry shape.
 * @param {string} moduleName - The roster module name (display name).
 * @param {string} repo - The remote GitHub repository name.
 * @param {object} release - The raw GitHub Releases API payload.
 * @param {string} summary - The module one-line summary from `modules.json`.
 */
function mapRelease(moduleName, repo, release, summary) {
  const tag = (release.tag_name || release.name || '').trim();
  if (!tag) return null;
  const date = release.published_at || release.created_at || '';
  const releaseName = (release.name || '').trim();
  const title = !releaseName || releaseName === tag ? `${moduleName} ${tag}` : releaseName;
  const body = (release.body || '').trim().slice(0, NEWS_BODY_LIMIT);
  let excerpt = releaseExcerpt(release.body, newsRules.excerptMaxChars);
  if (isThinExcerpt(excerpt, tag) && summary) {
    excerpt = `Release ${tag} - ${summary}`.slice(0, newsRules.excerptMaxChars);
  }
  return {
    id: `${repo}@${tag}`.replace(/[^a-zA-Z0-9@._-]+/g, '-').toLowerCase(),
    order: 0,
    repo: moduleName,
    remote: repo,
    module: moduleName,
    version: tag,
    tag,
    title,
    date,
    prerelease: Boolean(release.prerelease),
    url: release.html_url || `https://github.com/decaf-ts/${repo}/releases/tag/${tag}`,
    changelogUrl: `https://github.com/decaf-ts/${repo}/releases/tag/${tag}`,
    excerpt,
    body,
  };
}

/**
 * Collect the latest releases of every roster repository from the public GitHub
 * API and merge them into a single date-descending news array. Never throws: a
 * repository that fails (network, rate limit, missing repo) is skipped, and when
 * every request fails the caller keeps the previous `news.json`.
 * @param {Array<{name: string, url: string}>} roster - The `.gitmodules` roster.
 * @param {Map<string, string>} summaries - Module name -> one-line summary used
 * as the thin/empty release-body fallback.
 */
async function collectNews(roster, summaries) {
  const results = await Promise.all(
    roster.map(async ({ name, url }) => {
      const repo = repoNameOf(url);
      if (!repo) return { name, repo: '', ok: false, entries: [] };
      try {
        const releases = await fetchJson(`${NEWS_API}/${repo}/releases?per_page=${NEWS_PER_REPO}`);
        if (!Array.isArray(releases)) return { name, repo, ok: false, entries: [] };
        return { name, repo, ok: true, entries: releases };
      } catch (e) {
        console.warn(`[collect-data] news fetch failed for ${repo}: ${(e && e.message) || e}`);
        return { name, repo, ok: false, entries: [] };
      }
    })
  );

  const anyOk = results.some((result) => result.ok);
  if (!anyOk) return null;

  const items = [];
  const seen = new Set();
  for (const result of results) {
    for (const release of result.entries) {
      const entry = mapRelease(result.name, result.repo, release, summaries.get(result.name));
      if (!entry) continue;
      const key = `${result.repo}@${entry.tag}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(entry);
    }
  }
  items.sort((a, b) => {
    const diff = new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
    if (diff !== 0) return diff;
    return Number(a.prerelease) - Number(b.prerelease);
  });
  return items.slice(0, NEWS_TOTAL_LIMIT).map((entry, order) => ({ ...entry, order }));
}

// ---------------------------------------------------------------------------
// 4. write
// ---------------------------------------------------------------------------

fs.mkdirSync(dataDir, { recursive: true });
fs.writeFileSync(slogansTarget, JSON.stringify(rosterSlogans, null, 1));
fs.writeFileSync(versionsTarget, JSON.stringify(rosterVersions, null, 1));
fs.writeFileSync(modulesTarget, JSON.stringify(orderedModules, null, 1));
fs.writeFileSync(autoModulesTarget, JSON.stringify(autoModules, null, 1));

const featureCount = orderedModules.reduce((n, m) => n + (m.features || []).length, 0);
const exampleCount = orderedModules.reduce((n, m) => n + (m.examples || []).length, 0);
const featureExampleCount = orderedModules.reduce(
  (n, m) => n + (m.features || []).reduce((k, f) => k + ((f.examples || []).length ? 1 : 0), 0),
  0
);
console.log(
  `[collect-data] roster ${rosterNames.length} module(s) in .gitmodules order; ` +
    `authored ${authoredNames.size}; auto ${autoModules.length}; ` +
    `features ${featureCount} (${featureExampleCount} with examples); ` +
    `examples ${exampleCount}; slogans ${Object.keys(slogans).length} (global included)`
);

collectNews(roster, moduleSummaries).then((news) => {
  if (Array.isArray(news)) {
    fs.writeFileSync(newsTarget, JSON.stringify(news, null, 1));
    console.log(`[collect-data] news ${news.length} release(s) written to assets/data/news.json`);
  } else {
    console.warn('[collect-data] news fetch unavailable; keeping the previous assets/data/news.json');
  }
  process.exit(0);
});
