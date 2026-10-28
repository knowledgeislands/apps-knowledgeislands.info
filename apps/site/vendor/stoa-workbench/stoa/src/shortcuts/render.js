// @ts-check
// The keyboard shortcuts dialog's markup, as pure functions, from the
// registry's groups. Before the script runs, Super is written for every
// platform at once ("Ctrl K or Windows or Super K"); the element relabels it
// for the reader's.

import { esc } from '../internal/html.js'

/** @typedef {import('./registry.js').Shortcut} Shortcut */
/** @typedef {import('./registry.js').KeyLabels} KeyLabels */

/** The labels before the reader's platform is known. */
export const ANY_PLATFORM = /** @type {KeyLabels} */ ({
  key: 'Ctrl',
  keyName: 'Control',
  shortcut: 'Ctrl K',
  also: 'Windows or Super',
  title: 'Search',
  aria: 'Control+K Meta+K /'
})

/** Names for keys whose character is not their name. */
const KEY_NAMES = /** @type {Record<string, [string, string]>} */ ({
  ArrowUp: ['↑', 'Up'],
  ArrowDown: ['↓', 'Down'],
  ArrowLeft: ['←', 'Left'],
  ArrowRight: ['→', 'Right'],
  Escape: ['Esc', 'Escape']
})

/** @param {string} key */
const kbd = (key) => {
  const named = KEY_NAMES[key]
  return named
    ? `<kbd aria-label="${named[1]}">${named[0]}</kbd>`
    : `<kbd>${esc(key.length === 1 ? key.toUpperCase() : key)}</kbd>`
}

/**
 * One way to press a shortcut, as `<kbd>` keys.
 * @param {string} keys  Such as `Super+K`, `/` or `ArrowUp`.
 * @param {KeyLabels} labels
 */
export function keysHtml(keys, labels) {
  const parts = keys.split('+')
  const key = /** @type {string} */ (parts.pop())
  if (!parts.some((m) => m.toLowerCase() === 'super')) return [...parts, key].map(kbd).join(' ')
  const also = `<span data-super-also${labels.also ? '' : ' hidden'}> or <kbd data-super-also-key>${esc(labels.also)}</kbd> ${kbd(key)}</span>`
  return `<kbd data-super-key aria-label="${esc(labels.keyName)}">${esc(labels.key)}</kbd> ${kbd(key)}${also}`
}

/**
 * The dialog's lists, one per group.
 * @param {{ group: string, shortcuts: Shortcut[] }[]} groups
 * @param {KeyLabels} [labels]
 */
export function renderShortcutLists(groups, labels = ANY_PLATFORM) {
  return groups
    .map(
      ({ group, shortcuts }) => `<h3 class="shortcuts__group">${esc(group)}</h3>
    <dl class="shortcuts__list">
      ${shortcuts.map((s) => `<div><dt>${s.keys.map((k) => keysHtml(k, labels)).join(' ')}</dt><dd>${esc(s.label)}</dd></div>`).join('\n      ')}
    </dl>`
    )
    .join('\n    ')
}

/**
 * @typedef {object} ShortcutsHelpOptions
 * @property {string} [title]  The dialog's heading; "Keyboard shortcuts" by default.
 * @property {string} [helpUrl]  A help page to link under the lists.
 * @property {string} [helpLabel]  That link's words.
 */

/**
 * The whole dialog, for <stoa-shortcuts-help> to hold.
 * @param {{ group: string, shortcuts: Shortcut[] }[]} groups
 * @param {ShortcutsHelpOptions} [options]
 * @param {KeyLabels} [labels]
 */
export function renderShortcutsHelp(groups, options = {}, labels = ANY_PLATFORM) {
  const title = options.title ?? 'Keyboard shortcuts'
  const note = options.helpUrl
    ? `\n    <p class="shortcuts__note"><a href="${esc(options.helpUrl)}">${esc(options.helpLabel ?? 'Help')}</a></p>`
    : ''
  return `<dialog class="command-bar command-bar--shortcuts" aria-labelledby="stoa-shortcuts-title">
  <div class="command-bar__panel">
    <div class="shortcuts__head">
      <h2 class="shortcuts__title" id="stoa-shortcuts-title">${esc(title)}</h2>
      <button type="button" class="command-bar__close" data-shortcuts-close aria-label="Close the ${esc(title.toLowerCase())}">
        <kbd>Esc</kbd>
      </button>
    </div>
    <div data-shortcuts-lists>
    ${renderShortcutLists(groups, labels)}
    </div>${note}
  </div>
</dialog>`
}
