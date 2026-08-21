// Build-time script to generate www/assets/modules.json from repo modules and workdocs (CommonJS)
const fs = require('fs');
const path = require('path');

function safeRead(p) {
  try { return fs.readFileSync(p, 'utf8'); } catch { return ''; }
}

function stripMd(s) {
  return s.replace(/```[\s\S]*?```/g, '')
    .replace(/[#>*_`~\[\]\(\)!]/g, '')
    .replace(/\n+/g, ' ')
    .trim();
}

function summarise(text, max = 180) {
  const plain = stripMd(text || '');
  if (!plain) return '';
  let out = plain.replace(/\s+/g, ' ').trim();
  if (out.length <= max) return out;
  // try to cut at sentence boundary
  const cut = out.slice(0, max);
  const lastDot = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('! '), cut.lastIndexOf('? '));
  return (lastDot > 60 ? cut.slice(0, lastDot + 1) : cut.trim()) + (lastDot > 60 ? '' : '…');
}

function extractExamples(md) {
  const out = [];
  const re = /```([a-zA-Z0-9\-_.]*)\n([\s\S]*?)```/g;
  let m;
  while ((m = re.exec(md))) {
    const lang = (m[1] || '').trim();
    const code = m[2] || '';
    // try to find preceding paragraph as context
    const before = md.slice(0, m.index);
    const lines = before.split(/\n/);
    // walk back to capture last non-empty block
    let acc = [];
    for (let i = lines.length - 1; i >= 0 && acc.length < 6; i--) {
      const line = lines[i];
      if (line.trim() === '' && acc.length > 0) break; // stop at blank after capturing
      if (line.trim() !== '') acc.unshift(line);
    }
    const context = stripMd(acc.join('\n')).slice(0, 320);
    out.push({ lang, code, context });
  }
  return out;
}

function isImportOnly(code) {
  const lines = code.split(/\n/).map(l => l.trim()).filter(Boolean);
  if (lines.length === 0) return true;
  return lines.every(l => /^(import\s|export\s|from\s|require\(|const\s+\{?\s*[A-Z0-9_]+\s*\}?\s*=\s*require\().*/.test(l));
}

function isTsConfigBlock(lang, code) {
  if (lang && /json/i.test(lang) === false) return false;
  return /"compilerOptions"\s*:\s*\{/.test(code);
}

function isSimpleConstantAccess(code) {
  const trimmed = code.replace(/\s+/g, ' ').trim();
  // heuristics: single line or two lines accessing a constant/env without logic
  if (trimmed.length > 200) return false;
  const nonComment = trimmed.replace(/\/\/.*$/mg, '').trim();
  const lines = nonComment.split(/\n/).filter(Boolean);
  if (lines.length > 3) return false;
  const pattern = /(process\.env\.|[A-Z_][A-Z0-9_]+(\.[A-Z_][A-Z0-9_]+)*)/;
  return lines.every(l => pattern.test(l)) && !/[(){};].*{/.test(nonComment);
}

function makeTitleFrom(context, code) {
  const ctx = (context || '').toLowerCase();
  const firstWords = ctx.split(/[^a-zA-Z0-9]+/).filter(Boolean).slice(0, 6).map(w => w[0].toUpperCase()+w.slice(1)).join(' ');
  if (/configure|setup|init|initialize/.test(ctx)) return 'Configure and Initialize';
  if (/validate|validation|schema/.test(ctx)) return 'Validate Data with Schema';
  if (/decorate|decorator/.test(ctx)) return 'Use Decorators';
  if (/service|provider|inject/.test(ctx)) return 'Create and Inject Service';
  if (/http|request|api|fetch/.test(ctx)) return 'Call an HTTP API';
  if (/log|logger/.test(ctx)) return 'Structured Logging';
  if (/database|db|query|repository/.test(ctx)) return 'Database Access';
  if (firstWords) return firstWords;
  // fallback from code
  if (/class\s+[A-Za-z]/.test(code)) return 'Define a Class';
  if (/function\s+[A-Za-z]/.test(code)) return 'Define a Function';
  return 'Example';
}

function enrichDescription(context, code) {
  const base = stripMd(context || '');
  if (base.length >= 40) return base;
  // add hints from code
  if (/async|await/.test(code)) return (base ? base + ' — ' : '') + 'Asynchronous usage with async/await.';
  if (/try\s*\{/.test(code)) return (base ? base + ' — ' : '') + 'Includes basic error handling.';
  if (/new\s+[A-Z]/.test(code)) return (base ? base + ' — ' : '') + 'Instantiates and configures a component.';
  return base || 'Practical usage snippet.';
}

function main() {
  const repoRoot = path.resolve(__dirname, '..', '..', '..');
  const modulesList = require(path.join(repoRoot, 'bin', 'modules.js'));
  const outDir = path.join(repoRoot, 'web-page', 'www', 'assets');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const data = modulesList
    .filter((m) => m && m !== 'web-page')
    .map((name) => {
      const base = path.join(repoRoot, name);
      const desc = safeRead(path.join(base, 'workdocs', '4-Description.md'));
      const howto = safeRead(path.join(base, 'workdocs', '5-HowToUse.md'));
      let examples = [];
      extractExamples(desc).forEach((e) => examples.push({ ...e, source: 'description' }));
      extractExamples(howto).forEach((e) => examples.push({ ...e, source: 'howto' }));
      // filter out imports/tsconfig/simple constants
      examples = examples.filter(e => !isTsConfigBlock(e.lang, e.code) && !isImportOnly(e.code) && !isSimpleConstantAccess(e.code));
      // enrich examples
      examples = examples.map((e) => ({
        ...e,
        title: makeTitleFrom(e.context, e.code),
        details: enrichDescription(e.context, e.code),
      }));
      return {
        name,
        title: name,
        description: desc || howto,
        summary: summarise(desc || howto, 200),
        examples,
        base_path: name,
      };
    });

  const outFile = path.join(outDir, 'modules.json');
  fs.writeFileSync(outFile, JSON.stringify(data, null, 2));
  console.log('[build-modules-data] Wrote', outFile, 'with', data.length, 'modules');
}

if (require.main === module) main();
