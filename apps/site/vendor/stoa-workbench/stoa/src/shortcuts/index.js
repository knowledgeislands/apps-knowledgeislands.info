// @ts-check
// @externalise candidate
// The Shortcut Registry: one keydown listener, the fixed global shortcuts,
// and <stoa-shortcuts-help>, which lists what the page answers to.

export { defineStoaShortcutsHelp, StoaShortcutsHelp } from './element.js'
export {
  GLOBAL_KEYS,
  isEditable,
  isMac,
  keyLabels,
  matchesKeys,
  ShortcutRegistry,
  shortcutFor,
  shortcutRegistry
} from './registry.js'
export { ANY_PLATFORM, keysHtml, renderShortcutLists, renderShortcutsHelp } from './render.js'

/** @typedef {import('./registry.js').Shortcut} Shortcut */
/** @typedef {import('./registry.js').KeyLabels} KeyLabels */
