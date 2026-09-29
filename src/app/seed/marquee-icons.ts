/**
 * @module app/seed/marquee-icons
 * @description Inline SVG icon vocabulary for the homepage brands and modules
 * marquees. The authored `assets/data/marquee.json` stores semantic icon names
 * (lucide-style) and this module owns the name -> inline SVG map, so the marquees
 * render without any external network asset. Unknown names fall back to a neutral
 * mark.
 */

/**
 * @description Wraps an icon body in a 24x24 stroke SVG using `currentColor`.
 * @function wrap
 * @param {string} inner - The inner SVG markup of the icon.
 * @returns {string} The complete inline SVG markup.
 * @memberOf module:app/seed/marquee-icons
 */
function wrap(inner: string): string {
  return `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

/**
 * @const MARQUEE_ICONS
 * @description Map of semantic icon name to inline SVG markup used by the
 * homepage marquees.
 * @type {Record<string, string>}
 * @memberOf module:app/seed/marquee-icons
 */
export const MARQUEE_ICONS: Record<string, string> = {
  'archive-box': wrap('<rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8"/><path d="M10 12h4"/>'),
  'arrow-path': wrap('<path d="M4 12a8 8 0 0 1 13.5-5.8L20 8"/><path d="M20 4v4h-4"/><path d="M20 12a8 8 0 0 1-13.5 5.8L4 16"/><path d="M4 20v-4h4"/>'),
  'arrows-exchange': wrap('<path d="M4 7h13"/><path d="M14 4l3 3-3 3"/><path d="M20 17H7"/><path d="M10 14l-3 3 3 3"/>'),
  'atom-symbol': wrap('<circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><ellipse cx="12" cy="12" rx="9" ry="3.5"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)"/>'),
  bolt: wrap('<path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/>'),
  'circle-stack': wrap('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v6c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>'),
  cloud: wrap('<path d="M6.5 19a4.5 4.5 0 0 1 0-9 6 6 0 0 1 11.6 1.5A3.5 3.5 0 0 1 18 19z"/>'),
  'code-bracket': wrap('<path d="M8 6 3 12l5 6"/><path d="M16 6l5 6-5 6"/><path d="M13 5l-2 14"/>'),
  coffee: wrap('<path d="M4 9h12v4a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4z"/><path d="M16 10h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M6 21h10"/>'),
  cube: wrap('<path d="M12 2 21 7v10l-9 5-9-5V7z"/><path d="M3 7l9 5 9-5"/><path d="M12 12v10"/>'),
  cylinder: wrap('<ellipse cx="12" cy="6" rx="8" ry="3"/><path d="M4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
  database: wrap('<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
  'device-phone-mobile': wrap('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>'),
  flask: wrap('<path d="M9 3h6"/><path d="M10 3v6L5 18a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/><path d="M7.5 15h9"/>'),
  'globe-alt': wrap('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.5 2.5 15 0 18-2.5-3-2.5-15.5 0-18z"/>'),
  layers: wrap('<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/><path d="M3 17l9 5 9-5"/>'),
  link: wrap('<path d="M9.5 14.5l5-5"/><path d="M8 12l-2 2a3.5 3.5 0 0 0 5 5l2-2"/><path d="M16 12l2-2a3.5 3.5 0 0 0-5-5l-2 2"/>'),
  list: wrap('<path d="M8 6h12"/><path d="M8 12h12"/><path d="M8 18h12"/><path d="M4 6h.01"/><path d="M4 12h.01"/><path d="M4 18h.01"/>'),
  lock: wrap('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
  'lock-closed': wrap('<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'),
  'paint-brush': wrap('<path d="M14 3l7 7-8 8-4-4z"/><path d="M9 14l-5 5a2 2 0 0 0 3 3l5-5"/>'),
  play: wrap('<path d="M7 4l13 8-13 8z"/>'),
  plug: wrap('<path d="M9 3v6"/><path d="M15 3v6"/><path d="M7 9h10v3a5 5 0 0 1-10 0z"/><path d="M12 17v4"/>'),
  'puzzle-piece': wrap('<path d="M10 3a2 2 0 0 1 4 0v1h4a1 1 0 0 1 1 1v4h1a2 2 0 0 1 0 4h-1v4a1 1 0 0 1-1 1h-4v-1a2 2 0 0 0-4 0v1H6a1 1 0 0 1-1-1v-4H4a2 2 0 0 1 0-4h1V5a1 1 0 0 1 1-1h4z"/>'),
  rss: wrap('<path d="M5 5a14 14 0 0 1 14 14"/><path d="M5 11a8 8 0 0 1 8 8"/><circle cx="6" cy="18" r="1.4" fill="currentColor" stroke="none"/>'),
  'server-stack': wrap('<rect x="3" y="4" width="18" height="6" rx="1"/><rect x="3" y="14" width="18" height="6" rx="1"/><path d="M7 7h.01"/><path d="M7 17h.01"/>'),
  share: wrap('<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.2 10.8l7.6-3.6"/><path d="M8.2 13.2l7.6 3.6"/>'),
  'shield-check': wrap('<path d="M12 3l8 3v6c0 4.5-3.4 7.7-8 9-4.6-1.3-8-4.5-8-9V6z"/><path d="M9 12l2 2 4-4"/>'),
  sparkles: wrap('<path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z"/><path d="M18 15l.8 2.2L21 18l-2.2.8L18 21l-.8-2.2L15 18l2.2-.8z"/>'),
  'squares-2x2': wrap('<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>'),
  swatch: wrap('<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l6-6 4 4 3-3 5 5"/>'),
  'table-cells': wrap('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18"/><path d="M3 15h18"/><path d="M9 10v10"/>'),
  terminal: wrap('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 9l3 3-3 3"/><path d="M13 15h4"/>'),
  wrench: wrap('<path d="M15 4a4 4 0 0 0 5 5l-8.5 8.5a2.8 2.8 0 0 1-4-4z"/><path d="M15 4l5 5"/>'),
};

/**
 * @const NEUTRAL_MARK
 * @description Neutral fallback inline SVG used when an authored icon name is not
 * part of {@link MARQUEE_ICONS}.
 * @type {string}
 * @memberOf module:app/seed/marquee-icons
 */
export const NEUTRAL_MARK = wrap('<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/>');

/**
 * @description Resolves an authored semantic icon name to inline SVG markup.
 * @summary Falls back to the neutral mark for unknown or empty names so the
 * marquee never renders a broken image.
 * @function resolveMarqueeIcon
 * @param {string} name - The semantic icon name from `assets/data/marquee.json`.
 * @returns {string} The inline SVG markup.
 * @memberOf module:app/seed/marquee-icons
 */
export function resolveMarqueeIcon(name: string): string {
  if (!name) return NEUTRAL_MARK;
  return MARQUEE_ICONS[name] || NEUTRAL_MARK;
}
