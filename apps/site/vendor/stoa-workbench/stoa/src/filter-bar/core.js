// @ts-check
// The Filter Bar's query, as plain functions: parsing, matching, moving
// finished tokens into pills and ordering the quick filters. The element
// calls them in the browser; the tests call them directly.
//
// A query is whitespace-separated tokens, each either `key:value` (commas
// give alternatives, matched exactly against that field) or a bare word
// matched anywhere in the item's text. Every token must match.

/**
 * @typedef {{ kind: 'field', field: string, values: string[], token: string }
 *   | { kind: 'free', value: string, token: string }} QueryToken
 */

/**
 * An item as the query reads it: its field values by key, and its text.
 * @typedef {object} FilterItem
 * @property {(key: string) => string | string[] | null | undefined} field
 * @property {string} text
 */

/**
 * A quick filter's vocabulary entry: the key a field holds and the word shown.
 * @typedef {object} QuickValue
 * @property {string} key
 * @property {string} [label]
 * @property {number} [order]
 */

/** @param {unknown} s */
export const norm = (s) =>
  String(s ?? '')
    .trim()
    .toLowerCase()

/**
 * The query as tokens. A `key:value` token whose key is not a field is a free word.
 * @param {string | null | undefined} raw
 * @param {string[]} fields
 * @returns {QueryToken[]}
 */
export function parseQuery(raw, fields) {
  return String(raw || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((token) => {
      const m = token.match(/^([a-zA-Z][\w-]*):(.+)$/)
      if (m && fields.includes(m[1].toLowerCase())) {
        const values = m[2].split(',').map(norm).filter(Boolean)
        if (values.length) return { kind: 'field', field: m[1].toLowerCase(), values, token }
      }
      return { kind: 'free', value: norm(token), token }
    })
}

/**
 * Whether an item meets every token.
 * @param {FilterItem} item
 * @param {QueryToken[]} parsed
 */
export function matches(item, parsed) {
  const text = norm(item.text)
  return parsed.every((p) =>
    p.kind === 'field'
      ? p.values.some((v) => [item.field(p.field)].flat().some((field) => norm(field) === v))
      : text.includes(p.value)
  )
}

/**
 * Whether one token is a finished `key:value` filter, which becomes a pill.
 * @param {string} token
 * @param {string[]} fields
 */
export const isFieldToken = (token, fields) => parseQuery(token, fields)[0]?.kind === 'field'

/**
 * Moves the finished `key:value` tokens out of the typed text into the pills.
 * Unless `all` is set, the last token is still being typed until a space
 * follows it. Free words stay as text. A pill already held is not repeated.
 * @param {string} typed  The input's value.
 * @param {string[]} pills  The pills already held.
 * @param {string[]} fields
 * @param {boolean} all
 * @returns {{ pills: string[], typed: string, moved: boolean }}
 */
export function commitTokens(typed, pills, fields, all) {
  const parts = typed.split(/\s+/)
  const typing = all ? null : /** @type {string} */ (parts.pop())
  const next = [...pills]
  /** @type {string[]} */
  const free = []
  let moved = false
  for (const tok of parts.filter(Boolean)) {
    if (isFieldToken(tok, fields)) {
      if (!next.some((t) => norm(t) === norm(tok))) next.push(tok)
      moved = true
    } else {
      free.push(tok)
    }
  }
  if (!moved) return { pills, typed, moved }
  if (typing !== null) free.push(typing)
  return { pills: next, typed: free.join(' '), moved }
}

/**
 * Adds a pill, or takes it off if it is already held, as a quick filter does.
 * @param {string[]} pills
 * @param {string} token
 */
export function togglePill(pills, token) {
  const at = pills.findIndex((t) => norm(t) === norm(token))
  return at >= 0 ? pills.filter((_, i) => i !== at) : [...pills, token]
}

/**
 * The quick filters one field offers: the values its items hold, in the
 * vocabulary's order and words, then any value the vocabulary lacks in
 * natural order. A value with a space cannot be a token, so it is left out.
 * @param {Iterable<string | null | undefined>} values  The field's value on each item.
 * @param {QuickValue[]} [vocabulary]
 * @returns {{ value: string, text: string }[]}
 */
export function quickValues(values, vocabulary = []) {
  const present = new Set([...values].filter((v) => v && !/\s/.test(v)).map(String))
  const known = vocabulary
    .map((v, i) => ({ value: String(v.key), text: v.label || String(v.key), order: v.order ?? i }))
    .filter((v, i, all) => present.has(v.value) && all.findIndex((w) => w.value === v.value) === i)
    .sort((a, b) => a.order - b.order)
  const rest = [...present]
    .filter((v) => !known.some((k) => k.value === v))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((v) => ({ value: v, text: v }))
  return [...known.map(({ value, text }) => ({ value, text })), ...rest]
}

/**
 * The `field:value` pairs the query holds, so a quick filter reads as active
 * however the same filter was typed.
 * @param {QueryToken[]} parsed
 */
export const activeFilters = (parsed) =>
  new Set(parsed.flatMap((p) => (p.kind === 'field' ? p.values.map((v) => `${p.field}:${v}`) : [])))

/**
 * The shown count: the total alone when nothing is hidden, else "n of m".
 * @param {number} shown
 * @param {number} total
 */
export const shownText = (shown, total) => (shown === total ? `${total}` : `${shown} of ${total}`)
