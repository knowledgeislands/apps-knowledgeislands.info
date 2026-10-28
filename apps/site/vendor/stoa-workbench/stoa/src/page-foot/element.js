// @ts-check
const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

/** Preserves static light-DOM content; upgrades only the optional help link. */
export class StoaPageFoot extends Base {
  /** @type {AbortController | undefined} */
  #abort
  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    this.#abort = new AbortController()
    this.addEventListener(
      'click',
      (event) => {
        const link = event.target instanceof Element ? event.target.closest('[data-stoa-foot-shortcuts]') : null
        if (
          !link ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey
        )
          return
        const help = /** @type {import('../shortcuts/element.js').StoaShortcutsHelp | null} */ (
          this.ownerDocument.querySelector('stoa-shortcuts-help')
        )
        if (!help?.dialog || typeof help.show !== 'function') return
        event.preventDefault()
        event.stopPropagation()
        help.show(link)
      },
      { signal: this.#abort.signal }
    )
  }
  disconnectedCallback() {
    this.#abort?.abort()
    this.#abort = undefined
  }
}

/** Defines the host once. @param {string} [name] */
export function defineStoaPageFoot(name = 'stoa-page-foot') {
  if (!customElements.get(name)) customElements.define(name, StoaPageFoot)
}
