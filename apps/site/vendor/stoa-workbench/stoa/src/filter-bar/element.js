// @ts-check
// <stoa-filter-bar>: filters the items a build wrote, by `key:value`
// pills and free words, with quick filters drawn from the items, a ✕ that
// clears every filter, a help overlay with examples, and the query kept in
// the URL so a filtered view can be linked. It draws no content of its own.
//
// What it reads, inside its scope (the element named by `scope`, else its
// nearest `[data-filter-scope]`, else the page):
//   [data-filter-item]   an item, carrying `data-f-<key>="value"` per field
//   [data-filter-count]  a counter: "all", or "key:value" over `data-f-<key>`
//   [data-filter-shown]  the shown count: the total, or "n of m"
//   [data-filter-empty]  shown only when no item matches
//
// Attributes: `value-separator` opts into split field values; data-filter-text
// on an item overrides its searchable text. `fields` (space separated), `scope`, and `param`, the URL
// parameter the query is kept in (`q` by default; empty for none). Each
// change fires `stoa-filter-change`, which bubbles, with the query and the
// counts, for anything else on the page that follows the filter.

import { activeFilters, commitTokens, matches, norm, parseQuery, quickValues, shownText, togglePill } from './core.js'

/** @typedef {import('./core.js').QuickValue} QuickValue */

const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

export class StoaFilterBar extends Base {
  /** @type {AbortController | undefined} */
  #abort
  /** @type {string[]} */
  #pills = []
  /** @type {HTMLElement[]} */
  #items = []
  /** @type {Map<string, HTMLButtonElement>} */
  #quick = new Map()
  /** @type {string | null} The overlay that is open: 'qf', 'help' or none. */
  #open = null
  #pointerInBar = false
  #placeholder = ''
  /** @type {string | undefined} */
  #pendingQuery
  #initialized = false

  get fields() {
    return (this.getAttribute('fields') || '')
      .split(/[\s,]+/)
      .map(norm)
      .filter(Boolean)
  }

  /** Field values stay scalar unless a separator is explicitly configured. */
  /** @param {HTMLElement} item @param {string} key */
  #values(item, key) {
    const raw = item.getAttribute(`data-f-${key}`)
    const separator = this.getAttribute('value-separator')
    return separator
      ? (raw ?? '')
          .split(separator)
          .map((v) => v.trim())
          .filter(Boolean)
      : raw
  }

  get #param() {
    const p = this.getAttribute('param')
    return p === null ? 'q' : p
  }

  /** @param {string} selector */
  #el(selector) {
    return /** @type {HTMLElement | null} */ (this.querySelector(selector))
  }

  get #input() {
    return /** @type {HTMLInputElement} */ (this.#el('[data-filter-input]'))
  }

  get #scope() {
    const id = this.getAttribute('scope')
    return (id && document.getElementById(id)) || this.closest('[data-filter-scope]') || document
  }

  /** The whole query: the pills, then whatever is still typed. */
  get query() {
    return this.#pendingQuery ?? [...this.#pills, this.#input?.value ?? ''].join(' ').trim()
  }

  /** Replaces the whole query. */
  set query(value) {
    if (!this.#abort) {
      this.#pendingQuery = value
      return
    }
    this.#pills = []
    if (this.#input) this.#input.value = value
    this.#commit(true)
    this.#apply()
  }

  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    const input = this.#input
    const bar = this.#el('[data-filter-bar]')
    const row = this.#el('[data-filter-row]')
    const box = this.#el('[data-filter-box]')
    if (!input || !bar || !row || !box) return
    // Replay a property assigned while this was still an unknown element.
    if (Object.hasOwn(this, 'query')) {
      const value = this.query
      delete (/** @type {any} */ (this).query)
      this.#pendingQuery = value
    }
    this.#abort = new AbortController()
    const listen = { signal: this.#abort.signal }
    this.#placeholder = input.placeholder
    this.#items = [.../** @type {NodeListOf<HTMLElement>} */ (this.#scope.querySelectorAll('[data-filter-item]'))]
    this.#drawQuick()

    input.addEventListener(
      'input',
      () => {
        this.#commit(false)
        this.#apply()
      },
      listen
    )
    input.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Enter') {
          e.preventDefault()
          if (this.#commit(true)) this.#apply()
        } else if (
          e.key === 'Backspace' &&
          this.#pills.length &&
          input.selectionStart === 0 &&
          input.selectionEnd === 0
        ) {
          // Backspace at the start of the box takes the last pill back as text.
          e.preventDefault()
          const tok = /** @type {string} */ (this.#pills.pop())
          input.value = input.value ? `${tok} ${input.value}` : tok
          input.setSelectionRange(tok.length, tok.length)
          this.#apply()
        }
      },
      listen
    )
    // Leaving the box finishes a half-typed token, but not when the focus or
    // pointer goes to a control in the bar: redrawing the pills there would
    // replace the button being pressed. Those controls commit for themselves.
    row.addEventListener('pointerdown', () => (this.#pointerInBar = true), listen)
    document.addEventListener('pointerup', () => setTimeout(() => (this.#pointerInBar = false)), listen)
    input.addEventListener(
      'blur',
      (e) => {
        if (this.#pointerInBar || row.contains(/** @type {Node | null} */ (e.relatedTarget))) return
        if (this.#commit(true)) this.#apply()
      },
      listen
    )
    // A click on the box's padding, or between pills, lands in the input.
    box.addEventListener('click', (e) => e.target === box && input.focus(), listen)
    this.#el('[data-filter-clear]')?.addEventListener(
      'click',
      () => {
        this.#pills = []
        input.value = ''
        input.focus()
        this.#apply()
      },
      listen
    )
    for (const name of ['qf', 'help']) {
      this.#toggle(name)?.addEventListener(
        'click',
        () => (this.#open === name ? this.#closePop(true) : this.#showPop(name)),
        listen
      )
    }
    this.#el('[data-filter-close]')?.addEventListener('click', () => this.#closePop(true), listen)
    // An example replaces the whole query.
    for (const b of /** @type {NodeListOf<HTMLElement>} */ (this.querySelectorAll('[data-query]'))) {
      b.addEventListener(
        'click',
        () => {
          this.#closePop(false)
          this.query = b.dataset.query ?? ''
          input.focus()
        },
        listen
      )
    }
    // composedPath(), not target: a pill's ✕ is detached by the time its click gets here.
    document.addEventListener(
      'click',
      (e) => {
        if (this.#open && !e.composedPath().includes(row)) this.#closePop(false)
      },
      listen
    )
    document.addEventListener(
      'keydown',
      (e) => {
        if (e.key === 'Escape') this.#closePop(true)
      },
      listen
    )

    // A shared link opens with its filter applied: the parameter is read once, on load.
    const param = this.#param
    input.value =
      this.#pendingQuery ??
      (this.#initialized ? this.query : (param && new URLSearchParams(location.search).get(param)) || '')
    this.#pendingQuery = undefined
    this.#pills = []
    this.#initialized = true
    this.#commit(true)
    bar.hidden = false
    this.#apply(false)
  }

  disconnectedCallback() {
    this.#closePop(false)
    this.#pointerInBar = false
    this.#abort?.abort()
    this.#abort = undefined
  }

  /** Re-reads the items, for a list drawn after the bar upgraded. */
  refresh() {
    this.#items = [.../** @type {NodeListOf<HTMLElement>} */ (this.#scope.querySelectorAll('[data-filter-item]'))]
    this.#drawQuick()
    this.#apply(false)
  }

  /** @param {string} name */
  #toggle(name) {
    return this.#el(`[data-filter-toggle="${name}"]`)
  }

  /** @param {string} name */
  #pop(name) {
    return this.#el(`[data-filter-pop="${name}"]`)
  }

  /**
   * Moves finished tokens out of the input into pills.
   * @param {boolean} all  Also the last token, though no space follows it.
   */
  #commit(all) {
    const input = this.#input
    const next = commitTokens(input.value, this.#pills, this.fields, all)
    if (!next.moved) return false
    this.#pills = next.pills
    input.value = next.typed
    return true
  }

  /** Each field's values, taken from the items so the offer always tracks the data. */
  #drawQuick() {
    this.#quick.clear()
    for (const group of this.querySelectorAll('.filter-bar__qf-chips')) group.replaceChildren()
    for (const group of /** @type {NodeListOf<HTMLElement>} */ (this.querySelectorAll('[data-qf-field]'))) {
      const key = group.dataset.qfField ?? ''
      /** @type {QuickValue[]} */
      let vocabulary = []
      try {
        vocabulary = JSON.parse(group.dataset.qfValues || '[]')
      } catch (_e) {
        /* No vocabulary: the values stand as they are. */
      }
      const values = quickValues(
        this.#items.flatMap((r) => this.#values(r, key)),
        vocabulary
      )
      group.hidden = values.length < 2
      if (group.hidden) continue
      const chips = /** @type {HTMLElement} */ (group.querySelector('.filter-bar__qf-chips'))
      for (const { value, text } of values) {
        const chip = document.createElement('button')
        chip.type = 'button'
        chip.className = 'filter-bar__qf-chip'
        chip.textContent = text
        const token = `${key}:${value}`
        chip.dataset.qf = token
        chip.addEventListener('click', () => {
          this.#commit(true)
          this.#pills = togglePill(this.#pills, token)
          this.#apply()
        })
        this.#quick.set(`${key}:${norm(value)}`, chip)
        chips.append(chip)
      }
    }
    // A bar with nothing to offer shows no quick-filter icon.
    const none = this.#quick.size === 0
    const toggle = this.#toggle('qf')
    if (toggle) toggle.hidden = none
    const help = this.#el('[data-qf-help]')
    if (help) help.hidden = none
  }

  #drawPills() {
    const list = this.#el('[data-filter-pills]')
    if (!list) return
    const input = this.#input
    list.hidden = this.#pills.length === 0
    list.replaceChildren(
      ...this.#pills.map((tok, i) => {
        const p = parseQuery(tok, this.fields)[0]
        const pill = document.createElement('li')
        pill.className = 'filter-bar__pill'
        const text = document.createElement('span')
        text.className = 'filter-bar__pill-text'
        const field = document.createElement('span')
        field.className = 'filter-bar__pill-field'
        field.textContent = p.kind === 'field' ? `${p.field}:` : ''
        text.append(field, p.kind === 'field' ? p.values.join(', ') : p.token)
        const x = document.createElement('button')
        x.type = 'button'
        x.className = 'filter-bar__pill-x'
        x.textContent = '✕'
        x.title = 'Remove filter'
        x.setAttribute('aria-label', `Remove filter ${tok}`)
        x.addEventListener('click', () => {
          this.#pills = this.#pills.filter((_, j) => j !== i)
          this.#commit(true)
          input.focus()
          this.#apply()
        })
        pill.append(text, x)
        return pill
      })
    )
    list.scrollLeft = list.scrollWidth
    input.placeholder = this.#pills.length ? 'Add a filter…' : this.#placeholder
    const clear = this.#el('[data-filter-clear]')
    if (clear) clear.hidden = !this.query
  }

  /** @param {string} name */
  #showPop(name) {
    this.#closePop(false)
    const pop = this.#pop(name)
    if (!pop) return
    this.#open = name
    pop.hidden = false
    this.#toggle(name)?.setAttribute('aria-expanded', 'true')
    // Focus the overlay itself, so Tab continues into it and a screen reader
    // starts at its top rather than at its first button.
    pop.focus()
  }

  /**
   * Closes the open overlay; returns whether one was open.
   * @param {boolean} refocus
   */
  #closePop(refocus) {
    if (!this.#open) return false
    const name = this.#open
    this.#open = null
    const pop = this.#pop(name)
    if (pop) pop.hidden = true
    const toggle = this.#toggle(name)
    toggle?.setAttribute('aria-expanded', 'false')
    if (refocus) toggle?.focus()
    return true
  }

  /** @param {boolean} [announce]  Fire `stoa-filter-change`; not on load. */
  #apply(announce = true) {
    const query = this.query
    const parsed = parseQuery(query, this.fields)
    const shown = this.#items.filter((item) => {
      const show = matches(
        { field: (k) => this.#values(item, k), text: item.getAttribute('data-filter-text') ?? item.textContent ?? '' },
        parsed
      )
      item.hidden = !show
      return show
    })
    this.#drawPills()
    const active = activeFilters(parsed)
    for (const [token, chip] of this.#quick) {
      chip.setAttribute('aria-pressed', String(active.has(token)))
    }
    this.#recount(shown)
    // Keep the parameter in step, replacing the history entry rather than
    // adding one per keystroke. An empty filter removes it.
    const param = this.#param
    if (param) {
      const url = new URL(location.href)
      if (query) url.searchParams.set(param, query)
      else url.searchParams.delete(param)
      if (url.href !== location.href) history.replaceState(history.state, '', url)
    }
    if (announce) {
      this.dispatchEvent(
        new CustomEvent('stoa-filter-change', {
          bubbles: true,
          detail: { query, shown: shown.length, total: this.#items.length }
        })
      )
    }
  }

  /** @param {HTMLElement[]} shown */
  #recount(shown) {
    const scope = this.#scope
    for (const counter of /** @type {NodeListOf<HTMLElement>} */ (scope.querySelectorAll('[data-filter-count]'))) {
      const spec = counter.dataset.filterCount ?? 'all'
      if (spec === 'all') {
        counter.textContent = String(shown.length)
        continue
      }
      const [key, value] = spec.split(':')
      counter.textContent = String(
        shown.filter((r) => [this.#values(r, key)].flat().some((v) => norm(v) === norm(value))).length
      )
    }
    for (const count of scope.querySelectorAll('[data-filter-shown]')) {
      count.textContent = shownText(shown.length, this.#items.length)
    }
    for (const empty of /** @type {NodeListOf<HTMLElement>} */ (scope.querySelectorAll('[data-filter-empty]'))) {
      empty.hidden = shown.length > 0
    }
  }
}

/** Defines <stoa-filter-bar> once. */
export function defineStoaFilterBar(name = 'stoa-filter-bar') {
  if (!customElements.get(name)) customElements.define(name, StoaFilterBar)
}
