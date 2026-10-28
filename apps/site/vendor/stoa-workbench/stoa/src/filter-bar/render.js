// @ts-check
// The Filter Bar's markup, as a pure function for a site's build. The bar is
// hidden until the element upgrades it: without script the full list is the
// page. One box holds the active `key:value` filters as pills, then the ✕
// clear, the quick-filter and help icons; the quick filters and the help drop
// down over the content below.

import { esc } from '../internal/html.js'

/** @typedef {import('./core.js').QuickValue} QuickValue */

/**
 * One field the items carry as `data-f-<key>`.
 * @typedef {object} FilterField
 * @property {string} key  Lower case; the `key` in `key:value`.
 * @property {string} label  The quick filters' heading for the field.
 * @property {boolean} [quick]  Offer its values as quick filters; true by default.
 * @property {QuickValue[]} [values]  The quick filters' words and order, such as a status vocabulary.
 */

/**
 * @typedef {object} FilterBarConfig
 * @property {string} id  Names the bar's overlays; unique on the page.
 * @property {FilterField[]} fields
 * @property {string} [placeholder]  The input's placeholder.
 * @property {string} [label]  The input's accessible name.
 * @property {{ query: string, text: string }[]} [examples]  Queries the help offers to apply.
 * @property {string} [scope]  The id of the element whose items it filters; else its nearest `[data-filter-scope]`, else the page.
 * @property {string} [valueSeparator] Optional separator for multi-valued data-f-* attributes.
 * @property {string | false} [param]  The URL parameter the query is kept in; `q` by default, `false` for none.
 */

export const FILTER_DEFAULTS = /** @type {const} */ ({
  placeholder: 'Filter…',
  label: 'Filter: type field:value tokens or words',
  param: 'q'
})

/** The quick-filter icon, a funnel. */
const FUNNEL =
  '<svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true"><path d="M2 3h12l-4.5 5.5V13l-3 1.5V8.5z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>'

/**
 * <stoa-filter-bar> with its markup.
 * @param {FilterBarConfig} config
 */
export function renderFilterBar(config) {
  const id = esc(config.id)
  const fields = config.fields
  const keys = fields.map((f) => f.key.toLowerCase())
  const placeholder = config.placeholder ?? FILTER_DEFAULTS.placeholder
  const param = config.param === false ? '' : (config.param ?? FILTER_DEFAULTS.param)
  /** @type {[string, string | undefined][]} */
  const attrs = [
    ['fields', keys.join(' ')],
    ['scope', config.scope],
    ['value-separator', config.valueSeparator],
    ['param', param === FILTER_DEFAULTS.param ? undefined : param]
  ]
  const attributes = attrs
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ` ${k}="${esc(String(v))}"`)
    .join('')

  const groups = fields
    .filter((f) => f.quick !== false)
    .map((f) => {
      const key = esc(f.key.toLowerCase())
      const vocabulary = f.values ? ` data-qf-values="${esc(JSON.stringify(f.values))}"` : ''
      return `<div class="filter-bar__qf-group" role="group" aria-labelledby="${id}-qf-${key}" data-qf-field="${key}"${vocabulary} hidden><span class="filter-bar__qf-label" id="${id}-qf-${key}">${esc(f.label)}</span><div class="filter-bar__qf-chips"></div></div>`
    })
    .join('\n        ')

  const first = keys[0] ?? 'field'
  const examples = config.examples?.length
    ? `
      <p class="filter-bar__examples-label">Examples — select one to apply it:</p>
      <ul class="filter-bar__examples">
        ${config.examples
          .map(
            (e) =>
              `<li><button type="button" class="filter-bar__example" data-query="${esc(e.query)}"><code>${esc(e.query)}</code><span>${esc(e.text)}</span></button></li>`
          )
          .join('\n        ')}
      </ul>`
    : ''

  return `<stoa-filter-bar${attributes}>
<div class="filter-bar" data-filter-bar hidden>
  <div class="filter-bar__row" data-filter-row>
    <div class="filter-bar__box" data-filter-box>
      <i data-lucide="search" class="filter-bar__icon" aria-hidden="true"></i>
      <ul class="filter-bar__pills" data-filter-pills aria-label="Active filters" hidden></ul>
      <input type="text" class="filter-bar__input" data-filter-input aria-label="${esc(config.label ?? FILTER_DEFAULTS.label)}" placeholder="${esc(placeholder)}" autocomplete="off" spellcheck="false">
      <span class="filter-bar__tools">
        <button type="button" class="filter-bar__tool" data-filter-clear aria-label="Clear all filters" title="Clear all filters" hidden>✕</button>
        <button type="button" class="filter-bar__tool" data-filter-toggle="qf" aria-label="Quick filters" title="Quick filters" aria-expanded="false" aria-controls="${id}-qf">${FUNNEL}</button>
        <button type="button" class="filter-bar__tool" data-filter-toggle="help" aria-label="Filter help" title="Filter help" aria-expanded="false" aria-controls="${id}-help">?</button>
      </span>
    </div>
    <div class="filter-bar__pop" id="${id}-qf" data-filter-pop="qf" tabindex="-1" role="region" aria-label="Quick filters" hidden>
      <div class="filter-bar__quick">
        ${groups}
      </div>
    </div>
    <div class="filter-bar__pop filter-bar__hint" id="${id}-help" data-filter-pop="help" tabindex="-1" role="region" aria-label="Filter help" hidden>
      <button type="button" class="filter-bar__pop-close" data-filter-close aria-label="Close filter help" title="Close help">✕</button>
      <p>
        Type <code>field:value</code> tokens separated by spaces; each becomes a pill. Fields:
        ${keys.map((k) => `<code>${esc(k)}</code>`).join(' ')}.
        Repeat a field or use commas (<code>${esc(first)}:a,b</code>) to match any of its values; bare words search every column.
        <span data-qf-help>Select a quick filter to add it to the bar, and select it again, or its pill’s ✕, to take it off.</span>
        Backspace in an empty box takes the last pill back for editing.
      </p>${examples}
    </div>
  </div>
</div>
</stoa-filter-bar>`
}
