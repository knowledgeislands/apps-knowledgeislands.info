// @ts-check
import { renderPageFoot, renderSiteFooter } from './render.js'
/** @typedef {import('./render.js').PageFootConfig} PageFootConfig */
/** @typedef {PageFootConfig} PageFootData */
/**
 * Page-data reads use independent top-level *Key mappings; false prevents access.
 * Defaults match renderer field names, except idKey, which is disabled.
 * Paired shortcode bodies supply notes; fallback notes use notesKey.
 * @param {import('../internal/eleventy.js').StoaEleventyConfig & {addPairedShortcode: (name: string, callback: (...args: any[]) => string) => void, addFilter: (name: string, callback: (...args: any[]) => string) => void}} config
 * @param {Omit<PageFootConfig, 'notes' | 'sources' | 'pendingUpdates'> & { notesKey?: string | false, sourcesKey?: string | false, pendingUpdatesKey?: string | false, canonicalNoteKey?: string | false, showCanonicalNoteAloneKey?: string | false, resolveSourceKey?: string | false, headingsKey?: string | false, idKey?: string | false }} [options]
 */
export default function stoaPageFoot(config, options = {}) {
  /** @param {Record<string, any>} page @returns {PageFootData} */
  const pageData = (page) => {
    /** @type {PageFootData} */
    const data = {}
    if (options.notesKey !== false && page[options.notesKey ?? 'notes'] !== undefined)
      data.notes = page[options.notesKey ?? 'notes']
    if (options.sourcesKey !== false && page[options.sourcesKey ?? 'sources'] !== undefined)
      data.sources = page[options.sourcesKey ?? 'sources']
    if (options.pendingUpdatesKey !== false && page[options.pendingUpdatesKey ?? 'pendingUpdates'] !== undefined)
      data.pendingUpdates = page[options.pendingUpdatesKey ?? 'pendingUpdates']
    if (options.canonicalNoteKey !== false && page[options.canonicalNoteKey ?? 'canonicalNote'] !== undefined)
      data.canonicalNote = page[options.canonicalNoteKey ?? 'canonicalNote']
    if (
      options.showCanonicalNoteAloneKey !== false &&
      page[options.showCanonicalNoteAloneKey ?? 'showCanonicalNoteAlone'] !== undefined
    )
      data.showCanonicalNoteAlone = page[options.showCanonicalNoteAloneKey ?? 'showCanonicalNoteAlone']
    if (options.resolveSourceKey !== false && page[options.resolveSourceKey ?? 'resolveSource'] !== undefined)
      data.resolveSource = page[options.resolveSourceKey ?? 'resolveSource']
    if (options.headingsKey !== false && page[options.headingsKey ?? 'headings'] !== undefined)
      data.headings = page[options.headingsKey ?? 'headings']
    if (options.idKey && page[options.idKey] !== undefined) data.id = page[options.idKey]
    return data
  }
  config.addPairedShortcode(
    'stoaPageFoot',
    /** @this {{ctx?: Record<string, any>}} */ function (
      /** @type {string} */ notes,
      /** @type {Record<string, any> | undefined} */ data
    ) {
      const page = data ?? this.ctx ?? {}
      return renderPageFoot({ ...options, ...pageData(page), notes })
    }
  )
  config.addShortcode('stoaSiteFooter', renderSiteFooter)
  config.addFilter(
    'stoaPageFootFallback',
    (/** @type {string} */ content, /** @type {Record<string, any>} */ data = {}) =>
      content.includes('data-page-foot') ? '' : renderPageFoot({ ...options, ...pageData(data) })
  )
}
