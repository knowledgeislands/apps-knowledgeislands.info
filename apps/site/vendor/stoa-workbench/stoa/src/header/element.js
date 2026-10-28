// @ts-check
import { installHeaderIdentity } from './identity.js'

const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

export class StoaHeader extends Base {
  /** @type {AbortController | undefined} */
  #abort
  /** @type {ResizeObserver | undefined} */
  #resize
  /** @type {string | undefined} */
  #previousOffset
  #lastOffset = ''

  /** @param {string} selector */
  #button(selector) {
    return /** @type {HTMLButtonElement | null} */ (this.querySelector(selector))
  }

  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    const burger = this.#button('[data-header-burger]')
    if (!burger) return
    this.#abort = new AbortController()
    const options = { signal: this.#abort.signal }
    installHeaderIdentity(this, this.#abort.signal)
    this.#previousOffset = document.documentElement.style.getPropertyValue('--stoa-sticky-top')
    this.setAttribute('data-ready', '')
    burger.addEventListener(
      'click',
      () => {
        this.#closeGroups()
        this.#expand(!this.hasAttribute('data-expanded'))
      },
      options
    )
    for (const button of this.querySelectorAll('[data-header-group-toggle]')) {
      button.addEventListener(
        'click',
        () => {
          const open = button.getAttribute('aria-expanded') !== 'true'
          this.#closeGroups()
          button.setAttribute('aria-expanded', String(open))
          button.closest('[data-header-group]')?.toggleAttribute('data-open', open)
        },
        options
      )
    }
    this.addEventListener(
      'keydown',
      (event) => {
        if (event.key !== 'Escape' || event.defaultPrevented) return
        const open = this.#button('[data-header-group][data-open] [data-header-group-toggle]')
        if (open) {
          this.#closeGroups()
          open.focus()
        } else if (this.hasAttribute('data-expanded')) {
          this.#expand(false)
          burger.focus()
        } else return
        event.preventDefault()
        event.stopPropagation()
      },
      options
    )
    this.addEventListener(
      'focusout',
      (event) => {
        const target = /** @type {Element | null} */ (event.target)
        const group = target?.closest('[data-header-group]')
        if (group && !group.contains(/** @type {Node | null} */ (event.relatedTarget))) {
          group.removeAttribute('data-open')
          group.querySelector('button')?.setAttribute('aria-expanded', 'false')
        }
      },
      options
    )
    document.addEventListener(
      'click',
      (event) => {
        if (!event.composedPath().includes(this)) {
          this.#closeGroups()
          this.#expand(false)
        }
      },
      options
    )
    const measure = () => {
      if (!this.isConnected) return
      if (getComputedStyle(burger).display === 'none' && this.hasAttribute('data-expanded')) {
        this.#expand(false)
        this.#closeGroups()
      }
      const offset = `${this.getBoundingClientRect().height}px`
      if (offset !== this.#lastOffset) {
        document.documentElement.style.setProperty('--stoa-sticky-top', offset)
        this.#lastOffset = offset
      }
    }
    this.#resize = new ResizeObserver(measure)
    this.#resize.observe(this, { box: 'border-box' })
    measure()
  }

  /** @param {boolean} expanded */
  #expand(expanded) {
    this.toggleAttribute('data-expanded', expanded)
    this.#button('[data-header-burger]')?.setAttribute('aria-expanded', String(expanded))
  }

  #closeGroups() {
    for (const group of this.querySelectorAll('[data-header-group]')) {
      group.removeAttribute('data-open')
      group.querySelector('button')?.setAttribute('aria-expanded', 'false')
    }
  }

  disconnectedCallback() {
    this.#abort?.abort()
    this.#abort = undefined
    this.#resize?.disconnect()
    this.#resize = undefined
    this.#closeGroups()
    this.#expand(false)
    this.removeAttribute('data-ready')
    const style = document.documentElement.style
    if (this.#lastOffset && style.getPropertyValue('--stoa-sticky-top') === this.#lastOffset) {
      if (this.#previousOffset) style.setProperty('--stoa-sticky-top', this.#previousOffset)
      else style.removeProperty('--stoa-sticky-top')
    }
    this.#lastOffset = ''
  }
}

/** Defines the light-DOM Header frame once. */
export function defineStoaHeader(name = 'stoa-header') {
  if (!customElements.get(name)) customElements.define(name, StoaHeader)
}
