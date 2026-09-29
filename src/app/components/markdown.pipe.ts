import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { resolveDecoratorLink } from '../seed/decorator-links';

/**
 * @module app/components/MarkdownPipe
 * @description Minimal, dependency-free Markdown renderer for the seeded content
 * (module descriptions, showcase details). It supports the subset authored by the
 * content pipeline — headings, paragraphs, unordered and ordered lists, fenced code
 * blocks, inline code, bold text, links and horizontal rules — escapes all text
 * before wrapping it in trusted HTML and links every known `@decorator` token to its
 * documentation page.
 */

/**
 * @description Escapes the HTML-significant characters of a raw string.
 * @function escapeHtml
 * @param {string} value - The raw text.
 * @returns {string} The HTML-escaped text.
 * @memberOf module:app/components/MarkdownPipe
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * @description Replaces every known `@decorator` token of an inline run with a
 * link to its documentation page.
 * @summary Consumes the authored `assets/data/decorator-links.json` registry (loaded
 * at seed time) so decorators referenced in prose navigate to their GitHub Pages doc
 * in the original repository. Unknown tokens are left untouched, so non-decorator
 * `@` occurrences (handles, refs) render as plain text.
 * @function linkDecorators
 * @param {string} value - The HTML-escaped inline text.
 * @returns {string} The text with decorator links applied.
 * @memberOf module:app/components/MarkdownPipe
 */
function linkDecorators(value: string): string {
  return value.replace(/@[A-Za-z][A-Za-z0-9_]*/g, (token) => {
    const link = resolveDecoratorLink(token);
    if (!link || !link.url) return token;
    const title = escapeHtml(link.en || token);
    return `<a class="md-decorator" href="${link.url}" target="_blank" rel="noopener noreferrer" title="${title}">${token}</a>`;
  });
}

/**
 * @description Renders the inline Markdown of one text run (code, bold, links,
 * decorator links).
 * @function renderInline
 * @param {string} value - The raw inline text.
 * @returns {string} The HTML with the inline tokens replaced.
 * @memberOf module:app/components/MarkdownPipe
 */
function renderInline(value: string): string {
  const withCode = escapeHtml(value).replace(/`([^`]+)`/g, '<code>$1</code>');
  const withBold = withCode.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  const withLinks = withBold.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );
  return linkDecorators(withLinks);
}

/**
 * @description Renders a Markdown subset to safe HTML.
 * @summary Converts the content pipeline's formatted markdown into headings,
 * paragraphs, unordered and ordered lists, fenced code blocks and horizontal rules
 * so module descriptions and showcase details are readable. Consecutive plain lines
 * are joined into one paragraph, headings map below the page title, every known
 * `@decorator` is linked to its documentation page and all text is escaped first,
 * so the output is safe to trust for `[innerHTML]`.
 * @class
 * @example
 * <div [innerHTML]="highlight.detail | markdown"></div>
 */
@Pipe({
  name: 'markdown',
  standalone: true,
})
export class MarkdownPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  /**
   * @description Converts a Markdown string into trusted HTML.
   * @param {string|undefined|null} value - The Markdown source.
   * @returns {SafeHtml} The rendered, trusted HTML.
   */
  transform(value: string | undefined | null): SafeHtml {
    const source = (value || '').replace(/\r\n/g, '\n');
    const lines = source.split('\n');
    const out: string[] = [];
    let listOpen: 'ul' | 'ol' | null = null;
    let codeOpen = false;
    let codeLang = '';
    let codeLines: string[] = [];
    let paragraph: string[] = [];

    const flushParagraph = () => {
      if (paragraph.length) {
        out.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
        paragraph = [];
      }
    };
    const closeList = () => {
      if (listOpen) {
        out.push(`</${listOpen}>`);
        listOpen = null;
      }
    };
    const closeCode = () => {
      if (codeOpen) {
        out.push(
          `<pre class="md-code"><code data-lang="${escapeHtml(codeLang)}">${escapeHtml(codeLines.join('\n'))}</code></pre>`
        );
        codeOpen = false;
        codeLang = '';
        codeLines = [];
      }
    };

    for (const line of lines) {
      const fence = line.match(/^```(\w*)\s*$/);
      if (fence) {
        if (codeOpen) {
          closeCode();
        } else {
          flushParagraph();
          closeList();
          codeOpen = true;
          codeLang = fence[1] || '';
        }
        continue;
      }
      if (codeOpen) {
        codeLines.push(line);
        continue;
      }
      if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) {
        flushParagraph();
        closeList();
        out.push('<hr/>');
        continue;
      }
      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        flushParagraph();
        closeList();
        const level = Math.min(heading[1].length + 2, 6);
        out.push(`<h${level}>${renderInline(heading[2].trim())}</h${level}>`);
        continue;
      }
      const unordered = line.match(/^\s*[-*]\s+(.*)$/);
      const ordered = line.match(/^\s*\d+\.\s+(.*)$/);
      if (unordered || ordered) {
        flushParagraph();
        const tag = unordered ? 'ul' : 'ol';
        if (listOpen && listOpen !== tag) closeList();
        if (!listOpen) {
          out.push(`<${tag}>`);
          listOpen = tag;
        }
        out.push(`<li>${renderInline((unordered?.[1] ?? ordered?.[1] ?? '').trim())}</li>`);
        continue;
      }
      if (!line.trim()) {
        flushParagraph();
        closeList();
        continue;
      }
      closeList();
      paragraph.push(line.trim());
    }
    flushParagraph();
    closeCode();
    closeList();
    return this.sanitizer.bypassSecurityTrustHtml(out.join(''));
  }
}
