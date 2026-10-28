// @ts-check
// The Command Bar's matching, as plain functions, so tests run them without a
// browser. What the reference site wrote in (the kinds an empty query offers,
// the kinds whose code the badge already shows, the badges) is configuration.

/** @typedef {import('../search-index/contract.js').SearchEntry} SearchEntry */
/** @typedef {import('../search-index/contract.js').SearchKind} SearchKind */

/**
 * An entry the bar can find: one from the index, or one of the bar's own
 * commands, which runs instead of opening a URL.
 * @typedef {Omit<SearchEntry, 'u'> & { u?: string, run?: () => void }} BarEntry
 */

/**
 * @typedef {object} PreparedEntry
 * @property {BarEntry} entry
 * @property {string} code
 * @property {string} title
 * @property {string} aliases
 * @property {string} detail
 */

/**
 * @typedef {object} SearchGroup
 * @property {string} key
 * @property {string} label
 * @property {number} total
 * @property {number} best
 * @property {number} rank
 * @property {{ entry: BarEntry, score: number, order: number }[]} hits
 */

/** @typedef {{ groups: SearchGroup[], total: number, shown: number }} SearchResult */

/**
 * @typedef {object} SearchOptions
 * @property {number} [perGroup]  Results shown per group; 6 by default.
 * @property {string[]} [emptyKinds]  The kinds an empty query offers as places to start; pages by default.
 */

export const PER_GROUP = 6

/**
 * Lower case, without accents, so "Zürich" and "zurich" meet.
 * @param {unknown} s
 */
export function fold(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

/**
 * Whether `token` starts a word in `text`: at the start or after a space or mark.
 * @param {string} text
 * @param {string} token
 */
export function startsWord(text, token) {
  let at = text.indexOf(token)
  while (at >= 0) {
    if (at === 0 || /[\s(\-–—/·:,.'‘“]/.test(text.charAt(at - 1))) return true
    at = text.indexOf(token, at + 1)
  }
  return false
}

/**
 * A fuzzy match: the token's letters in order, close together, as "sovrn" in
 * "sovereign". The tightest run counts; one longer than twice the token is
 * noise. Scores 1 to 60, tighter is higher.
 * @param {string} text
 * @param {string} token
 */
export function subsequence(text, token) {
  if (token.length < 2) return 0
  let best = 0
  let start = text.indexOf(token.charAt(0))
  while (start >= 0) {
    let at = start
    for (const ch of token.slice(1)) {
      at = text.indexOf(ch, at + 1)
      if (at < 0) return best
    }
    const span = at - start + 1
    if (span <= token.length * 2) best = Math.max(best, Math.round(60 * (token.length / span)))
    start = text.indexOf(token.charAt(0), start + 1)
  }
  return best
}

/**
 * Folds an entry's searchable fields once, when the index arrives.
 * @param {BarEntry} entry
 * @returns {PreparedEntry}
 */
export function prepare(entry) {
  return {
    entry,
    code: fold(entry.c),
    title: fold(entry.t),
    aliases: fold((entry.a || []).join(' · ')),
    detail: fold(entry.d)
  }
}

/**
 * How well one query token matches a prepared entry; 0 is no match.
 * @param {PreparedEntry} p
 * @param {string} token
 */
export function tokenScore(p, token) {
  let score = 0
  if (p.code) {
    if (p.code === token) score = Math.max(score, 1000)
    else if (p.code.indexOf(token) === 0) score = Math.max(score, 600)
    else if (p.code.indexOf(token) > 0) score = Math.max(score, 300)
  }
  if (p.title === token) score = Math.max(score, 500)
  else if (p.title.indexOf(token) === 0) score = Math.max(score, 400)
  else if (startsWord(p.title, token)) score = Math.max(score, 300)
  else if (p.title.indexOf(token) > 0) score = Math.max(score, 150)
  if (p.aliases) {
    if (startsWord(p.aliases, token)) score = Math.max(score, 200)
    else if (p.aliases.indexOf(token) > 0) score = Math.max(score, 100)
  }
  if (p.detail) {
    if (startsWord(p.detail, token)) score = Math.max(score, 80)
    else if (p.detail.indexOf(token) > 0) score = Math.max(score, 40)
  }
  if (score) return score
  return Math.max(subsequence(p.title, token), subsequence(p.code, token))
}

/**
 * A prepared entry's score for a whole query; 0 when any word misses.
 * @param {PreparedEntry} p
 * @param {string} query
 */
export function scoreEntry(p, query) {
  const q = fold(query).trim()
  if (!q) return 0
  const tokens = q.split(/\s+/)
  let total = 0
  for (const token of tokens) {
    const s = tokenScore(p, token)
    if (!s) return 0
    total += s
  }
  // The words together as a phrase in the name or an alias, such as
  // "Scenario C", rank above the same words scattered.
  if (tokens.length > 1 && (startsWord(p.title, q) || startsWord(p.aliases, q))) total += 300
  return total
}

/**
 * Searches the prepared entries and groups the results by kind. Groups are
 * ordered by their best result, each holding up to `perGroup`. An empty
 * query gives the starting list: the `emptyKinds`, in the index's order.
 * @param {PreparedEntry[]} prepared
 * @param {SearchKind[]} kinds
 * @param {string} query
 * @param {SearchOptions} [options]
 * @returns {SearchResult}
 */
export function search(prepared, kinds, query, options = {}) {
  const limit = options.perGroup || PER_GROUP
  const start = new Set(options.emptyKinds ?? ['page'])
  const empty = !fold(query).trim()
  /** @type {Record<string, SearchGroup['hits']>} */
  const byKind = {}
  let total = 0
  prepared.forEach((p, i) => {
    const score = empty ? (start.has(p.entry.k) ? 1 : 0) : scoreEntry(p, query)
    if (!score) return
    total++
    if (!byKind[p.entry.k]) byKind[p.entry.k] = []
    byKind[p.entry.k].push({ entry: p.entry, score, order: i })
  })
  /** @type {SearchGroup[]} */
  const groups = []
  kinds.forEach((kind, k) => {
    const hits = byKind[kind.key]
    if (!hits) return
    hits.sort((a, b) => b.score - a.score || a.order - b.order)
    groups.push({
      key: kind.key,
      label: kind.label,
      total: hits.length,
      best: hits[0].score,
      rank: k,
      hits: hits.slice(0, limit)
    })
  })
  if (!empty) groups.sort((a, b) => b.best - a.best || a.rank - b.rank)
  const shown = groups.reduce((n, g) => n + g.hits.length, 0)
  return { groups, total, shown }
}

/**
 * The status line for a result set.
 * @param {{ total: number, shown: number }} result
 * @param {string} query
 */
export function statusText(result, query) {
  if (!fold(query).trim()) return `Type to search. ${result.shown} places to start.`
  if (!result.total) return 'No results.'
  const noun = result.total === 1 ? 'result' : 'results'
  return result.shown < result.total
    ? `${result.total} ${noun}, best ${result.shown} shown.`
    : `${result.total} ${noun}.`
}

/**
 * The badge HTML a result shows, in the order the entry lists them; unknown
 * badges are left out (the index check already refuses them).
 * @param {BarEntry} entry
 * @param {Record<string, Record<string, string>>} badges
 */
export function badgesFor(entry, badges) {
  return (entry.b ?? [])
    .map((b) => {
      const at = b.indexOf(':')
      return badges[b.slice(0, at)]?.[b.slice(at + 1)] ?? ''
    })
    .join('')
}

/**
 * Whether a result shows its code beside its name; not for kinds whose badge
 * already is the code.
 * @param {BarEntry} entry
 * @param {Iterable<string>} hiddenCodeKinds
 */
export function showsCode(entry, hiddenCodeKinds) {
  return !!entry.c && !new Set(hiddenCodeKinds).has(entry.k)
}
