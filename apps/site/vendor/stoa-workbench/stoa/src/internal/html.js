// @ts-check
// HTML escaping shared by the units' renderers and elements.

/** @type {Record<string, string>} */
const ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }

/**
 * Text made safe for HTML content and attribute values.
 * @param {unknown} value
 */
export const esc = (value) => String(value).replace(/[&<>"']/g, (c) => ENTITIES[c])
