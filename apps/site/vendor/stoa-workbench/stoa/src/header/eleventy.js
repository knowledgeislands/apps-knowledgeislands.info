// @ts-check
import { renderHeader } from './render.js'

/** The paired body supplies the optional end slot; search and preferences are passed as build markup.
 * @param {import('../internal/eleventy.js').StoaEleventyConfig & {addPairedShortcode: (name: string, callback: (...args: any[]) => string) => void}} config
 */
export default function stoaHeader(config) {
  config.addPairedShortcode(
    'stoaHeader',
    (
      /** @type {string} */ content,
      /** @type {import('./render.js').HeaderConfig} */ header,
      /** @type {import('./render.js').HeaderSlots} */ slots = {}
    ) => renderHeader(header, { ...slots, end: content.trim() || slots.end })
  )
}
