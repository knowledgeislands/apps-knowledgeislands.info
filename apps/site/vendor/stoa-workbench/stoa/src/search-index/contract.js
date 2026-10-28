// @ts-check
// The Search Index Contract: the one JSON file the Command Bar fetches the
// first time it opens, built at build time from the same data the pages read.
//
// An entry carries only what its page already shows: a name, its code, a
// short context line and the badges the page lists. A site supplies its own
// kinds and entries; the commons adds the pages and checks the whole.

/**
 * @typedef {object} SearchEntry
 * @property {string} k  Kind, one of the index's `kinds`.
 * @property {string} t  The name a reader sees.
 * @property {string} u  Root-relative URL, with a fragment where the entry is a row.
 * @property {string} [c]  The entry's own code, such as `A`, `CDN` or `Q-12`.
 * @property {string[]} [a]  Other names it is known by, matched but not shown.
 * @property {string} [d]  One line of context shown under the name.
 * @property {string[]} [b]  Badges the result shows, each `<group>:<code>` in the index's `badges`.
 */

/**
 * @typedef {object} SearchKind
 * @property {string} key
 * @property {string} label  The group's heading in the Command Bar.
 */

/**
 * @typedef {object} SearchIndex
 * @property {SearchKind[]} kinds  In the order the Command Bar groups them.
 * @property {Record<string, Record<string, string>>} badges  Ready-made badge HTML by group and code.
 * @property {SearchEntry[]} entries
 */

/**
 * A page from the Eleventy collection, as far as the index reads it.
 * @typedef {object} IndexPage
 * @property {string | false} url
 * @property {string | false} [outputPath]
 * @property {{ title?: string, commandBarTitle?: string, commandBar?: boolean, description?: string,
 *   sectionTitle?: string, sectionOrder?: number, order?: number }} data
 */

/**
 * @typedef {object} PageEntryOptions
 * @property {Iterable<string>} [exclude]  URLs listed under a kind of their own, so not again as pages.
 * @property {(sectionTitle: string) => string} [section]  The context line for a page in a section; defaults to the section's title.
 */

export const PAGE_KIND = /** @type {const} */ ({ key: 'page', label: 'Pages' })

/** A page's URL as the site links it, without a trailing `index.html`. */
const pageUrl = (/** @type {string} */ url) => url.replace(/index\.html$/, '')

/**
 * One entry per published HTML page. Pages without a section come first, by
 * URL, then sectioned pages in their menu order. A page without a title of its
 * own, such as a home page, may name itself with `commandBarTitle`; one that
 * sets `commandBar: false` stays out, and so does the 404 page.
 * @param {IndexPage[]} pages
 * @param {PageEntryOptions} [options]
 * @returns {SearchEntry[]}
 */
export function pageEntries(pages, options = {}) {
  const exclude = new Set(options.exclude ?? [])
  const section = options.section ?? ((title) => title)
  /** @param {IndexPage} p */
  const rank = (p) => [p.data.sectionOrder ?? -1, p.data.order ?? 99]
  const ordered = pages
    .filter((p) => p.url && p.outputPath && String(p.outputPath).endsWith('.html') && p.data.commandBar !== false)
    .sort((a, b) => {
      const [as, ao] = rank(a)
      const [bs, bo] = rank(b)
      return as - bs || ao - bo || String(a.url).localeCompare(String(b.url))
    })
  /** @type {SearchEntry[]} */
  const entries = []
  const seen = new Set()
  for (const page of ordered) {
    const url = pageUrl(String(page.url))
    const title = page.data.commandBarTitle ?? page.data.title
    if (!title || url === '/404.html' || exclude.has(url) || seen.has(url)) continue
    seen.add(url)
    entries.push({
      k: PAGE_KIND.key,
      t: title,
      u: url,
      ...(page.data.sectionTitle ? { d: section(page.data.sectionTitle) } : {}),
      ...(page.data.description ? { a: [page.data.description] } : {})
    })
  }
  return entries
}

/**
 * Every problem with an index: unknown kinds and badges, repeated URLs, URLs
 * that are not root-relative, and markup or email addresses in the text, which
 * no page shows as plain text. An empty list is a valid index.
 * @param {SearchIndex} index
 * @returns {string[]}
 */
export function indexProblems(index) {
  /** @type {string[]} */
  const problems = []
  const kinds = new Set(index.kinds.map((k) => k.key))
  if (kinds.size !== index.kinds.length) problems.push('kinds: a key is repeated')
  const urls = new Set()
  for (const e of index.entries) {
    const at = `${e.k} "${e.t}"`
    if (!kinds.has(e.k)) problems.push(`${at}: unknown kind ${e.k}`)
    if (!e.t) problems.push(`${e.k} ${e.u}: no name`)
    if (!/^\/[^/]/.test(e.u) && e.u !== '/') problems.push(`${at}: URL ${e.u} is not root-relative`)
    if (urls.has(e.u)) problems.push(`${at}: URL ${e.u} is repeated`)
    urls.add(e.u)
    for (const field of [e.t, e.c, e.d, ...(e.a ?? [])]) {
      if (field && /[<>]/.test(field)) problems.push(`${at}: markup in "${field}"`)
      if (field && /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(field)) problems.push(`${at}: an email address`)
    }
    for (const badge of e.b ?? []) {
      const [group, code] = badge.split(':')
      if (!index.badges[group]?.[code]) problems.push(`${at}: unknown badge ${badge}`)
    }
  }
  return problems
}

/**
 * The index from a site's kinds, badges and entries, with its pages added
 * first, checked; it throws on any problem.
 * @param {{ kinds: SearchKind[], badges?: SearchIndex['badges'], entries: SearchEntry[], pages?: IndexPage[],
 *   pageOptions?: PageEntryOptions }} parts
 * @returns {SearchIndex}
 */
export function buildIndex(parts) {
  const pages = parts.pages ? pageEntries(parts.pages, parts.pageOptions) : []
  const kinds =
    parts.kinds.some((k) => k.key === PAGE_KIND.key) || !pages.length ? parts.kinds : [PAGE_KIND, ...parts.kinds]
  /** @type {SearchIndex} */
  const index = { kinds, badges: parts.badges ?? {}, entries: [...pages, ...parts.entries] }
  const problems = indexProblems(index)
  if (problems.length) throw new Error(`search index:\n  ${problems.join('\n  ')}`)
  return index
}
