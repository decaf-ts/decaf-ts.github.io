/**
 * @module app/zone-flags
 * @description Zone.js runtime flags applied before the zone polyfill. Guards Angular
 * change detection against running for Web Component `customElements` lifecycle
 * callbacks (which would otherwise trigger change detection per registry event).
 */

(window as any).__Zone_disable_customElements = true;
