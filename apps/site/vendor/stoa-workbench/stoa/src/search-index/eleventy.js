// @ts-check
// The Search Index as an Eleventy plugin: it writes the index the Command Bar
// fetches, once, as a virtual template, from the site's own entries and every
// page in `collections.all`.
//
//   import stoaSearchIndex from 'stoa/search-index/eleventy'
//   eleventyConfig.addPlugin(stoaSearchIndex, {
//     kinds: [{ key: 'person', label: 'People' }],
//     entries: (data) => data.people.map((p) => ({ k: 'person', t: p.name, u: `/people/${p.id}/` }))
//   })

import { buildIndex } from './contract.js'

/** @typedef {import('./contract.js').SearchKind} SearchKind */
/** @typedef {import('./contract.js').SearchEntry} SearchEntry */
/** @typedef {import('./contract.js').SearchIndex} SearchIndex */
/** @typedef {import('./contract.js').PageEntryOptions} PageEntryOptions */

/**
 * @typedef {object} StoaSearchIndexOptions
 * @property {SearchKind[]} [kinds]  The site's kinds; pages come first unless placed here.
 * @property {(data: any) => SearchEntry[]} [entries]  The site's entries, from the global data.
 * @property {(data: any) => SearchIndex['badges']} [badges]  Ready-made badge HTML by group and code.
 * @property {(data: any) => PageEntryOptions} [pages]  Which pages are listed under a kind of their own, and their context line.
 * @property {string} [path]  Where the index is written; `/assets/command-bar-index.json` by default.
 */

export const INDEX_PATH = '/assets/command-bar-index.json'

/**
 * @param {import('../internal/eleventy.js').StoaEleventyConfig} eleventyConfig
 * @param {StoaSearchIndexOptions} [options]
 */
export default function stoaSearchIndex(eleventyConfig, options = {}) {
  if (!eleventyConfig.addTemplate) throw new Error('Stoa virtual templates require Eleventy 3.1 or later')
  eleventyConfig.addTemplate('stoa-search-index.11ty.js', {
    data: { permalink: options.path ?? INDEX_PATH, layout: false, eleventyExcludeFromCollections: true },
    render: (/** @type {any} */ data) =>
      JSON.stringify(
        buildIndex({
          kinds: options.kinds ?? [],
          badges: options.badges?.(data),
          entries: options.entries?.(data) ?? [],
          pages: data.collections.all,
          pageOptions: options.pages?.(data)
        })
      )
  })
}
