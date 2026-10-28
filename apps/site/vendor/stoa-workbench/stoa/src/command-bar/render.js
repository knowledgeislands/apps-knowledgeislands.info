// @ts-check
// The Command Bar's markup, as pure functions for a site's build: the trigger
// button a site places in its header (as many as its layouts need), and
// <stoa-command-bar> holding the dialog. Without script neither opens and
// the triggers stay hidden; every page is still reached through the menus.

import { esc } from '../internal/html.js'

/**
 * @typedef {object} CommandBarConfig
 * @property {string} [placeholder]  The input's placeholder; names what can be found.
 * @property {string} [label]  The input's accessible name.
 * @property {string[]} [emptyKinds]  The kinds an empty query offers; pages by default.
 * @property {string[]} [hiddenCodeKinds]  Kinds whose code the badge already shows, so not again as text.
 * @property {number} [perGroup]  Results shown per group.
 * @property {string} [indexUrl]  Root-relative URL of the index; `/assets/command-bar-index.json` by default.
 * @property {string} [base]  The site's root, which the index and every result URL resolve against; `/` by
 *   default. Set it when the site is served from a folder rather than a host's root.
 * @property {string} [helpUrl]  A help page linked from the bar's foot.
 * @property {string} [helpLabel]  That link's words; "Help" by default.
 */

export const DEFAULTS = /** @type {const} */ ({
  placeholder: 'Search this site',
  label: 'Search the site',
  indexUrl: '/assets/command-bar-index.json'
})

/** @param {string[] | undefined} list */
const words = (list) => (list?.length ? list.join(' ') : undefined)

/**
 * The trigger button. It is hidden until the script shows it.
 * @param {{ modifier?: string, id?: string, label?: string }} [options]
 */
export function renderCommandBarTrigger(options = {}) {
  const cls = ['command-bar-trigger', options.modifier].filter(Boolean).join(' ')
  return `<button type="button" class="${esc(cls)}"${options.id ? ` id="${esc(options.id)}"` : ''} data-command-bar-open aria-haspopup="dialog" aria-controls="command-bar" aria-keyshortcuts="Meta+K Control+K /" hidden>
  <svg class="command-bar-trigger__icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
  <span class="command-bar-trigger__label">${esc(options.label ?? 'Search')}</span>
  <kbd class="command-bar-trigger__key" data-super-shortcut aria-hidden="true">Ctrl K</kbd>
</button>`
}

/**
 * <stoa-command-bar> with its dialog. Place it once, at the end of the body.
 * @param {CommandBarConfig} [config]
 */
export function renderCommandBar(config = {}) {
  /** @type {[string, string | number | undefined][]} */
  const attrs = [
    ['index-url', config.indexUrl],
    ['base', config.base],
    ['empty-kinds', words(config.emptyKinds)],
    ['hidden-code-kinds', words(config.hiddenCodeKinds)],
    ['per-group', config.perGroup]
  ]
  const attributes = attrs
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ` ${k}="${esc(String(v))}"`)
    .join('')
  const help = config.helpUrl
    ? `\n        <a href="${esc(config.helpUrl)}" class="command-bar__text-button">${esc(config.helpLabel ?? 'Help')}</a>`
    : ''
  return `<stoa-command-bar${attributes}>
<dialog class="command-bar" id="command-bar" aria-labelledby="command-bar-title">
  <div class="command-bar__panel">
    <h2 class="visually-hidden" id="command-bar-title">Command Bar</h2>
    <div class="command-bar__field">
      <svg class="command-bar__search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input class="command-bar__input" id="command-bar-input" type="text"
             role="combobox" aria-expanded="false" aria-controls="command-bar-list" aria-autocomplete="list"
             aria-label="${esc(config.label ?? DEFAULTS.label)}" aria-describedby="command-bar-keys"
             placeholder="${esc(config.placeholder ?? DEFAULTS.placeholder)}"
             autocomplete="off" autocapitalize="off" spellcheck="false" enterkeyhint="go">
      <button type="button" class="command-bar__close" data-command-bar-close aria-label="Close the Command Bar">
        <kbd>Esc</kbd>
      </button>
    </div>
    <div class="command-bar__list" id="command-bar-list" role="listbox" aria-label="Results"></div>
    <p class="command-bar__status" id="command-bar-status" role="status" aria-live="polite" aria-atomic="true"></p>
    <div class="command-bar__foot">
      <p class="command-bar__keys" id="command-bar-keys">
        <span><kbd aria-label="Up">↑</kbd><kbd aria-label="Down">↓</kbd> to move</span>
        <span><kbd>Enter</kbd> to open</span>
        <span><kbd>Esc</kbd> to close</span>
      </p>
      <p class="command-bar__more">
        <button type="button" class="command-bar__text-button" data-shortcuts-open>Keyboard shortcuts <kbd>?</kbd></button>${help}
      </p>
    </div>
  </div>
</dialog>
</stoa-command-bar>`
}
