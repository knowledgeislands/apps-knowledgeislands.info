// @ts-check
// <stoa-shortcuts-help>: the keyboard shortcuts dialog, drawn from the
// Shortcut Registry, so it lists exactly what the page answers to. It
// registers `?` itself. Attributes: `help-url` and `help-label` for a help
// page under the lists, `title` for its heading.
//
// It opens on `?`, on any `[data-shortcuts-open]` button, and on
// `show(opener)`; focus returns to the opener when it closes. Opening it
// fires `stoa-shortcuts-open` on the document, so an open Command Bar
// closes first.

import { shortcutRegistry } from './registry.js'
import { renderShortcutLists, renderShortcutsHelp } from './render.js'

const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

export class StoaShortcutsHelp extends Base {
  /** @type {AbortController | undefined} */
  #abort
  /** @type {Element | null} */
  #opener = null
  /** @type {(() => void)[]} */
  #undo = []

  get dialog() {
    return /** @type {HTMLDialogElement | null} */ (this.querySelector('dialog'))
  }

  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    this.#abort = new AbortController()
    const listen = { signal: this.#abort.signal }
    const registry = shortcutRegistry()
    this.#undo.push(
      registry.register({
        id: 'shortcuts.show',
        keys: ['?'],
        group: 'Anywhere on the site',
        label: 'Show these shortcuts, when you are not typing in a field',
        run: () => this.show()
      })
    )
    if (!this.dialog) {
      this.innerHTML = renderShortcutsHelp(
        registry.groups(),
        {
          title: this.getAttribute('title') || undefined,
          helpUrl: this.getAttribute('help-url') || undefined,
          helpLabel: this.getAttribute('help-label') || undefined
        },
        registry.labels
      )
    }
    const draw = () => {
      const lists = this.querySelector('[data-shortcuts-lists]')
      if (lists) lists.innerHTML = renderShortcutLists(registry.groups(), registry.labels)
    }
    draw()
    this.#undo.push(registry.subscribe(draw))

    const dialog = /** @type {HTMLDialogElement} */ (this.dialog)
    dialog.addEventListener('click', (event) => event.target === dialog && dialog.close(), listen)
    dialog.addEventListener('close', () => this.#restore(), listen)
    this.addEventListener(
      'click',
      (event) => {
        if (/** @type {Element} */ (event.target).closest('[data-shortcuts-close]')) dialog.close()
      },
      listen
    )
    document.addEventListener(
      'click',
      (event) => {
        if (/** @type {Element} */ (event.target).closest?.('[data-shortcuts-open]')) this.show()
      },
      listen
    )
    document.addEventListener('stoa-command-bar-open', () => dialog.open && dialog.close(), listen)
  }

  disconnectedCallback() {
    this.close()
    this.#abort?.abort()
    this.#abort = undefined
    for (const undo of this.#undo.splice(0)) undo()
  }

  /**
   * Opens the dialog; focus returns to `opener` when it closes.
   * @param {Element | null} [opener]
   */
  show(opener) {
    const dialog = this.dialog
    if (!dialog || dialog.open) return
    document.dispatchEvent(new CustomEvent('stoa-shortcuts-open'))
    this.#opener = opener ?? document.activeElement
    dialog.showModal()
  }

  close() {
    if (this.dialog?.open) this.dialog.close()
  }

  #restore() {
    const opener = /** @type {HTMLElement | null} */ (this.#opener)
    this.#opener = null
    if (opener && document.contains(opener) && typeof opener.focus === 'function') opener.focus()
  }
}

/** Defines <stoa-shortcuts-help> once. */
export function defineStoaShortcutsHelp(name = 'stoa-shortcuts-help') {
  if (!customElements.get(name)) customElements.define(name, StoaShortcutsHelp)
}
