// @ts-check
// <stoa-command-bar>: the Command Bar. Super+K opens it on every platform
// (Cmd+K on macOS, the Windows or Super key elsewhere where the system passes
// it on, and Ctrl+K off macOS too); "/" opens it when focus is not in a field;
// and any `[data-command-bar-open]` button opens it for touch and mouse. The
// index is fetched the first time the bar opens, so it costs nothing on a page
// that never uses it.
//
// The bar is a modal <dialog>: it traps focus and closes on Escape, and focus
// returns to whatever opened it. The input is an ARIA combobox over a listbox
// of grouped options, moved through with the arrow keys while focus stays in
// the input; a status line says how many results there are.
//
// Attributes: `index-url`, `empty-kinds` and `hidden-code-kinds` (space
// separated), `per-group`, and `base`, the site's root when its pages link
// relatively. Opening the bar fires `stoa-command-bar-open` on the document.

import { shortcutRegistry } from '../shortcuts/registry.js'
import { badgesFor, prepare, search, showsCode, statusText } from './core.js'
import { DEFAULTS } from './render.js'

/** @typedef {import('./core.js').BarEntry} BarEntry */
/** @typedef {import('./core.js').PreparedEntry} PreparedEntry */
/** @typedef {import('../search-index/contract.js').SearchIndex} SearchIndex */
/** @typedef {import('../search-index/contract.js').SearchKind} SearchKind */

const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

/** @param {string | null} value */
const list = (value) => (value ? value.split(/\s+/).filter(Boolean) : undefined)

export class StoaCommandBar extends Base {
  /** @type {AbortController | undefined} */
  #abort
  /** @type {(() => void)[]} */
  #undo = []
  /** @type {SearchKind[] | null} */
  #kinds = null
  /** @type {PreparedEntry[] | null} */
  #prepared = null
  /** @type {SearchIndex['badges']} */
  #badges = {}
  /** @type {Promise<void> | null} */
  #loading = null
  /** @type {{ el: HTMLElement, entry: BarEntry }[]} */
  #options = []
  #active = -1
  /** @type {Element | null} */
  #opener = null
  #leaving = false
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #announce

  get #dialog() {
    return /** @type {HTMLDialogElement} */ (this.querySelector('dialog'))
  }
  get #input() {
    return /** @type {HTMLInputElement} */ (this.querySelector('.command-bar__input'))
  }
  get #list() {
    return /** @type {HTMLElement} */ (this.querySelector('[role="listbox"]'))
  }
  get #status() {
    return /** @type {HTMLElement} */ (this.querySelector('[role="status"]'))
  }

  /** The site's root, which root-relative URLs resolve against. */
  get #base() {
    return new URL(this.getAttribute('base') || '/', location.href).href
  }

  /**
   * A root-relative URL as this site serves it; on file: a folder gets its index.html.
   * @param {string} u
   */
  resolveUrl(u) {
    const parts = /^\/([^#]*)(#.*)?$/.exec(u)
    if (!parts) return u
    let path = parts[1]
    if (location.protocol === 'file:' && (path === '' || /\/$/.test(path))) path += 'index.html'
    return this.#base + path + (parts[2] || '')
  }

  connectedCallback() {
    const dialog = this.#dialog
    if (!this.isConnected || this.#abort || !dialog || typeof dialog.showModal !== 'function') return
    this.#abort = new AbortController()
    const listen = { signal: this.#abort.signal }
    const registry = shortcutRegistry()
    const keys = registry.labels

    // The platform's key, in the trigger hint and the shortcuts list.
    for (const el of document.querySelectorAll('[data-super-shortcut]')) el.textContent = keys.shortcut
    for (const trigger of document.querySelectorAll('[data-command-bar-open]')) {
      const button = /** @type {HTMLElement} */ (trigger)
      button.setAttribute('aria-keyshortcuts', keys.aria)
      button.title = keys.title
      button.hidden = false
    }

    this.#undo.push(
      registry.register({
        id: 'command-bar.toggle',
        keys: ['Super+K'],
        group: 'Anywhere on the site',
        label: 'Open or close the Command Bar',
        run: () => (dialog.open ? this.close() : this.open())
      }),
      registry.register({
        id: 'command-bar.open',
        keys: ['/'],
        group: 'Anywhere on the site',
        label: 'Open the Command Bar, when you are not typing in a field',
        run: () => this.open()
      }),
      registry.register({
        id: 'command-bar.move',
        keys: ['ArrowUp', 'ArrowDown'],
        scope: 'command-bar',
        group: 'In the Command Bar',
        label: 'Move between results'
      }),
      registry.register({
        id: 'command-bar.activate',
        keys: ['Enter'],
        scope: 'command-bar',
        group: 'In the Command Bar',
        label: 'Open the result'
      }),
      registry.register({
        id: 'command-bar.close',
        keys: ['Escape'],
        scope: 'command-bar',
        group: 'In the Command Bar',
        label: 'Close, and return to where you were'
      })
    )

    const input = this.#input
    input.addEventListener('input', () => this.#render(), listen)
    input.addEventListener(
      'keydown',
      (event) => {
        if (event.isComposing) return
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          const n = this.#options.length
          if (!n) return
          const step = event.key === 'ArrowDown' ? 1 : -1
          this.#setActive((this.#active + step + n) % n, true)
        } else if (event.key === 'Enter') {
          event.preventDefault()
          this.#activate(this.#active)
        }
      },
      listen
    )
    // A click on the backdrop, outside the panel, closes the dialog.
    dialog.addEventListener('click', (event) => event.target === dialog && dialog.close(), listen)
    dialog.addEventListener('close', () => this.#restore(), listen)
    this.addEventListener(
      'click',
      (event) => {
        if (/** @type {Element} */ (event.target).closest('[data-command-bar-close]')) this.close()
      },
      listen
    )
    document.addEventListener(
      'click',
      (event) => {
        if (/** @type {Element} */ (event.target).closest?.('[data-command-bar-open]')) this.open()
      },
      listen
    )
    document.addEventListener('stoa-shortcuts-open', () => this.close(), listen)
    // A jump to a row on the page already open: move focus to the row, so the
    // keyboard carries on from the result.
    window.addEventListener('hashchange', () => this.#focusTarget(), listen)
  }

  disconnectedCallback() {
    this.close()
    clearTimeout(this.#announce)
    this.#abort?.abort()
    this.#loading = null
    this.#abort = undefined
    for (const undo of this.#undo.splice(0)) undo()
  }

  open() {
    const dialog = this.#dialog
    if (dialog.open) return
    document.dispatchEvent(new CustomEvent('stoa-command-bar-open'))
    this.#opener = document.activeElement
    this.#leaving = false
    dialog.showModal()
    this.#input.focus()
    this.#input.select()
    if (this.#prepared) this.#render()
    else this.#load()
  }

  close() {
    if (this.#dialog.open) this.#dialog.close()
  }

  /** Hands over to the shortcuts dialog, which returns focus to the bar's opener. */
  #showShortcuts() {
    const opener = this.#opener
    this.#leaving = true
    this.close()
    this.#leaving = false
    const help = /** @type {any} */ (document.querySelector('stoa-shortcuts-help'))
    help?.show?.(opener)
  }

  // Focus goes back to what opened the bar; a jump to a result instead leaves
  // it to the page, which moves to the result's row.
  #restore() {
    if (this.#leaving) return
    const opener = /** @type {HTMLElement | null} */ (this.#opener)
    this.#opener = null
    if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus()
  }

  #load() {
    if (this.#loading) return this.#loading
    this.#status.textContent = 'Loading the index…'
    const url = this.resolveUrl(this.getAttribute('index-url') || DEFAULTS.indexUrl)
    // The bar's own command, found by searching for it like anything else.
    /** @type {BarEntry[]} */
    const commands = [
      { k: 'command', t: 'Show keyboard shortcuts', a: ['keys', 'help', '?'], run: () => this.#showShortcuts() }
    ]
    const signal = this.#abort?.signal
    this.#loading = fetch(url, { credentials: 'same-origin', signal })
      .then((res) => {
        if (!res.ok) throw new Error(String(res.status))
        return res.json()
      })
      .then((/** @type {SearchIndex} */ index) => {
        if (signal?.aborted) return
        this.#kinds = [...index.kinds, { key: 'command', label: 'Commands' }]
        this.#badges = index.badges ?? {}
        this.#prepared = [...index.entries, ...commands].map(prepare)
        this.#render()
      })
      .catch(() => {
        if (signal?.aborted) return
        this.#loading = null
        this.#status.textContent = 'The search index could not be loaded. Every page is still in the menus.'
      })
    return this.#loading
  }

  #render() {
    if (!this.#prepared || !this.#kinds) return
    const input = this.#input
    const listbox = this.#list
    const query = input.value
    const perGroup = Number(this.getAttribute('per-group')) || undefined
    const result = search(this.#prepared, this.#kinds, query, {
      perGroup,
      emptyKinds: list(this.getAttribute('empty-kinds'))
    })
    const hiddenCodes = list(this.getAttribute('hidden-code-kinds')) ?? []
    listbox.textContent = ''
    this.#options = []
    result.groups.forEach((group, g) => {
      const wrap = document.createElement('div')
      wrap.className = 'command-bar__group'
      wrap.setAttribute('role', 'group')
      wrap.setAttribute('aria-labelledby', `command-bar-group-${g}`)
      const label = span('command-bar__group-label', group.label)
      label.id = `command-bar-group-${g}`
      label.setAttribute('role', 'presentation')
      wrap.appendChild(label)
      for (const hit of group.hits) {
        const entry = hit.entry
        const option = document.createElement(entry.u ? 'a' : 'div')
        option.className = 'command-bar__option'
        option.id = `command-bar-option-${this.#options.length}`
        option.setAttribute('role', 'option')
        option.setAttribute('aria-selected', 'false')
        option.tabIndex = -1
        if (entry.u) /** @type {HTMLAnchorElement} */ (option).href = this.resolveUrl(entry.u)
        const badges = badgesFor(entry, this.#badges)
        if (badges) {
          const p = span('command-bar__pills', '')
          p.innerHTML = badges // ready-made by the site's build, with the index
          option.appendChild(p)
        }
        const text = span('command-bar__text', '')
        const line = span('command-bar__line', '')
        line.appendChild(span('command-bar__name', entry.t))
        if (showsCode(entry, hiddenCodes)) line.appendChild(span('command-bar__code', /** @type {string} */ (entry.c)))
        text.appendChild(line)
        if (entry.d) text.appendChild(span('command-bar__detail', entry.d))
        option.appendChild(text)
        option.addEventListener('mousemove', () => this.#setActive(this.#indexOf(option), false))
        option.addEventListener('click', (e) => {
          const event = /** @type {MouseEvent} */ (e)
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return
          event.preventDefault()
          this.#activate(this.#indexOf(option))
        })
        this.#options.push({ el: option, entry })
        wrap.appendChild(option)
      }
      listbox.appendChild(wrap)
    })
    input.setAttribute('aria-expanded', String(this.#options.length > 0))
    this.#setActive(this.#options.length ? 0 : -1, true)
    // The visible count follows every keystroke; screen readers hear it once typing pauses.
    clearTimeout(this.#announce)
    const words = statusText(result, query)
    this.#announce = setTimeout(() => {
      this.#status.textContent = words
    }, 250)
  }

  /** @param {HTMLElement} el */
  #indexOf(el) {
    return this.#options.findIndex((o) => o.el === el)
  }

  /**
   * @param {number} i
   * @param {boolean} scroll
   */
  #setActive(i, scroll) {
    const options = this.#options
    if (this.#active >= 0 && options[this.#active]) options[this.#active].el.setAttribute('aria-selected', 'false')
    this.#active = i
    if (i < 0 || !options[i]) {
      this.#input.removeAttribute('aria-activedescendant')
      return
    }
    options[i].el.setAttribute('aria-selected', 'true')
    this.#input.setAttribute('aria-activedescendant', options[i].el.id)
    if (scroll) options[i].el.scrollIntoView({ block: 'nearest' })
  }

  /** @param {number} i */
  #activate(i) {
    const option = this.#options[i]
    if (!option) return
    if (option.entry.run) {
      option.entry.run()
      return
    }
    this.#leaving = true
    this.#dialog.close()
    location.href = /** @type {HTMLAnchorElement} */ (option.el).href
  }

  #focusTarget() {
    const id = decodeURIComponent(location.hash.slice(1))
    const target = id && document.getElementById(id)
    if (!target || !this.#leaving) return
    this.#leaving = false
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
    target.focus({ preventScroll: true })
  }
}

/**
 * @param {string} cls
 * @param {string} text
 */
function span(cls, text) {
  const el = document.createElement('span')
  el.className = cls
  el.textContent = text
  return el
}

/** Defines <stoa-command-bar> once. */
export function defineStoaCommandBar(name = 'stoa-command-bar') {
  if (!customElements.get(name)) customElements.define(name, StoaCommandBar)
}
