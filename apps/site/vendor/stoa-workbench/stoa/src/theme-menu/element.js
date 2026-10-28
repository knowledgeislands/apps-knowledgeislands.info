// @ts-check
// <stoa-theme-menu>: the theme menu a build wrote. A menu button opens a
// panel of `menuitemradio` options; the arrow keys, Home and End move
// through them, and Escape, a click outside or focus leaving closes it, with
// focus back on the trigger. The panel keeps within the viewport and scrolls
// inside itself when it is taller than the room under the trigger.
//
// Choosing a theme fires `stoa-theme-change`, which bubbles and can be
// cancelled, with `{ theme, previous }`. Unless a listener cancels it, the
// menu hands the request to the active Theme Engine. Without one it sets the theme on `<html>` and keeps it under `storage-key`. A site
// whose pre-paint script reads that key sets the theme before first paint;
// the menu reads `<html>` and marks what is set.
//
// Attributes: `attribute` (`data-theme` by default), `default`, the theme
// when `<html>` names none, and `storage-key`.

import { initStoaTheme, stoaTheme } from '../theme-engine/engine.js'

/** @param {string} key */
function read(key) {
  try {
    return localStorage.getItem(key)
  } catch (_e) {
    return null
  }
}

/**
 * @param {string} key
 * @param {string} value
 */
function store(key, value) {
  try {
    localStorage.setItem(key, value)
  } catch (_e) {
    /* Private browsing, or storage disabled: the choice just won't persist. */
  }
}

const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

export class StoaThemeMenu extends Base {
  /** @type {AbortController | undefined} */
  #abort
  /** @type {string | undefined} */
  #pendingValue
  /** @type {MutationObserver | undefined} */
  #observer

  get #attribute() {
    return this.getAttribute('attribute') || 'data-theme'
  }

  get #trigger() {
    return /** @type {HTMLButtonElement | null} */ (this.querySelector('.theme-menu__trigger'))
  }

  get #panel() {
    return /** @type {HTMLElement | null} */ (this.querySelector('.theme-menu__panel'))
  }

  get #options() {
    return [.../** @type {NodeListOf<HTMLElement>} */ (this.querySelectorAll('.theme-menu__option'))]
  }

  /** The ids the menu offers, in its order. */
  get themes() {
    return this.#options.map((o) => o.dataset.themeValue ?? '')
  }

  /** The current theme: what `<html>` names, else the default. */
  get value() {
    const set = stoaTheme.active ? stoaTheme.state?.theme : document.documentElement.getAttribute(this.#attribute)
    const themes = this.themes
    if (set && themes.includes(set)) return set
    return this.getAttribute('default') || themes[0] || ''
  }

  /** Chooses a theme, as a reader's click does. */
  set value(theme) {
    if (!this.#abort) {
      this.#pendingValue = theme
      return
    }
    this.#choose(theme)
  }

  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    const trigger = this.#trigger
    const panel = this.#panel
    if (!trigger || !panel) return
    if (Object.hasOwn(this, 'value')) {
      const value = this.value
      delete (/** @type {any} */ (this).value)
      this.#pendingValue = value
    }
    initStoaTheme()
    this.#abort = new AbortController()
    const listen = { signal: this.#abort.signal }
    // A stored choice the pre-paint script did not apply, as on a page without one.
    const key = this.getAttribute('storage-key')
    const stored = key && read(key)
    if (
      !stoaTheme.active &&
      stored &&
      this.themes.includes(stored) &&
      !document.documentElement.hasAttribute(this.#attribute)
    ) {
      document.documentElement.setAttribute(this.#attribute, stored)
    }
    if (this.#pendingValue !== undefined) {
      const value = this.#pendingValue
      this.#pendingValue = undefined
      this.#choose(value)
    }
    this.#mark()
    this.#observer = new MutationObserver(() => this.#mark())
    this.#observer.observe(document.documentElement, { attributes: true, attributeFilter: [this.#attribute] })
    trigger.disabled = false
    trigger.hidden = false
    document.addEventListener('stoa-theme-applied', () => this.#mark(), listen)

    trigger.addEventListener('click', () => (panel.hidden ? this.show() : this.close(true)), listen)
    trigger.addEventListener(
      'keydown',
      (event) => {
        if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
          event.preventDefault()
          this.show()
        }
      },
      listen
    )
    panel.addEventListener(
      'click',
      (event) => {
        if (/** @type {Element} */ (event.target).closest('[data-theme-reset]')) {
          if (stoaTheme.active) stoaTheme.reset()
          this.close(true)
          return
        }
        const option = /** @type {HTMLElement | null} */ (
          /** @type {Element} */ (event.target).closest('.theme-menu__option')
        )
        if (!option) return
        this.#choose(option.dataset.themeValue ?? '')
        this.close(true)
      },
      listen
    )
    panel.addEventListener(
      'keydown',
      (event) => {
        const options = this.#options
        const at = options.indexOf(/** @type {HTMLElement} */ (event.target))
        if (at < 0) return
        /** @type {number | undefined} */
        let next
        if (event.key === 'ArrowDown') next = (at + 1) % options.length
        else if (event.key === 'ArrowUp') next = (at - 1 + options.length) % options.length
        else if (event.key === 'Home') next = 0
        else if (event.key === 'End') next = options.length - 1
        if (next === undefined) return
        event.preventDefault()
        options[next].focus()
      },
      listen
    )
    document.addEventListener('keydown', (event) => event.key === 'Escape' && this.close(true), listen)
    document.addEventListener(
      'click',
      (event) => !panel.hidden && !event.composedPath().includes(this) && this.close(false),
      listen
    )
    document.addEventListener(
      'focusin',
      (event) => !panel.hidden && !this.contains(/** @type {Node} */ (event.target)) && this.close(false),
      listen
    )
    window.addEventListener('resize', () => this.#fit(), listen)
  }

  disconnectedCallback() {
    this.#observer?.disconnect()
    this.#observer = undefined
    if (this.#trigger) {
      this.#trigger.disabled = true
      this.#trigger.hidden = true
    }
    this.close()
    this.#abort?.abort()
    this.#abort = undefined
  }

  /** Opens the panel, with focus on the current theme. */
  show() {
    const panel = this.#panel
    if (!panel?.hidden) return
    panel.hidden = false
    this.#trigger?.setAttribute('aria-expanded', 'true')
    this.#fit()
    const options = this.#options
    ;(options.find((o) => o.getAttribute('aria-checked') === 'true') ?? options[0])?.focus()
  }

  /** @param {boolean} [refocus]  Return focus to the trigger. */
  close(refocus = false) {
    const panel = this.#panel
    if (!panel || panel.hidden) return
    panel.hidden = true
    this.#trigger?.setAttribute('aria-expanded', 'false')
    if (refocus) this.#trigger?.focus()
  }

  /** @param {string} theme */
  #choose(theme) {
    if (!this.themes.includes(theme)) return
    if (stoaTheme.active) {
      stoaTheme.set({ theme })
      this.#mark()
      return
    }
    const previous = this.value
    const event = new CustomEvent('stoa-theme-change', {
      bubbles: true,
      cancelable: true,
      detail: { theme, previous }
    })
    if (this.dispatchEvent(event)) {
      document.documentElement.setAttribute(this.#attribute, theme)
      const key = this.getAttribute('storage-key')
      if (key) store(key, theme)
    }
    this.#mark()
  }

  /** The tick shows the current theme. */
  #mark() {
    const value = this.value
    for (const option of this.#options) {
      option.setAttribute('aria-checked', String(option.dataset.themeValue === value))
    }
  }

  /** Keeps the open panel within the viewport, scrolling inside itself. */
  #fit() {
    const panel = this.#panel
    if (!panel || panel.hidden) return
    panel.style.maxHeight = ''
    const top = panel.getBoundingClientRect().top
    panel.style.maxHeight = `${Math.max(0, window.innerHeight - top - 12)}px`
  }
}

/** Defines <stoa-theme-menu> once. */
export function defineStoaThemeMenu(name = 'stoa-theme-menu') {
  if (!customElements.get(name)) customElements.define(name, StoaThemeMenu)
}
