/**
 * @module app/polyfills
 * @description Angular runtime polyfills loaded before `main.ts`. Sets up `zone.js` and
 * `reflect-metadata`, applies the zone flags computed by the build, exposes the legacy
 * `window.global` alias used by some decaf/CLI runtime assumptions, and shims the
 * `Buffer`/`process` globals (empty `process.env` with DEBUG unset) so isomorphic
 * tooling does not crash in the browser.
 */

import './zone-flags';

import 'zone.js';

import 'reflect-metadata';

((globalThis as any).window as any).global = (globalThis as any).window;
(globalThis as any).global = (globalThis as any).global || globalThis.window;
(globalThis as any).Buffer = (globalThis as any).Buffer || [];
(globalThis as any).process = (globalThis as any).process || {
  env: { DEBUG: undefined },
  version: '',
};
