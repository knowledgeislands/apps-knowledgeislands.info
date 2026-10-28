// @ts-check
// The Shortcut Registry: one keydown listener for the whole page, and the one
// list of shortcuts that <stoa-shortcuts-help> shows, so a shortcut and its
// help never drift apart.
//
// Keys are written as the reader presses them: `Super+K`, `/`, `?`, `Enter`.
// Super is Command on macOS and the Windows or Super key elsewhere, where
// Ctrl stands in for it too, since a system may keep the Super key for itself.
// A bare key never takes a key from a field the reader is typing in.
//
// The global set is fixed: Super+K and `/` open the Command Bar, and `?`
// shows the shortcuts. A unit adds its own under its own scope.

/**
 * @typedef {object} Shortcut
 * @property {string} id  Unique, such as `command-bar.toggle`.
 * @property {string[]} keys  Each a way to press it, such as `Super+K`.
 * @property {string} group  The heading it is listed under.
 * @property {string} label  What it does, in words.
 * @property {string} [scope]  `global` (the default) is dispatched by the registry; any other scope, such as a
 *   dialog's own keys, is listed only and its unit handles the keys itself.
 * @property {(event: KeyboardEvent) => void} [run]
 */

/**
 * @typedef {object} KeyLabels
 * @property {string} key  The Super key's label: ⌘ or Ctrl.
 * @property {string} keyName  Its name for assistive technology.
 * @property {string} shortcut  Super+K, as the platform writes it.
 * @property {string} also  The Windows or Super key, named beside Ctrl off macOS; empty on macOS.
 * @property {string} title  The Command Bar button's tooltip.
 * @property {string} aria  The Command Bar button's aria-keyshortcuts.
 */

/**
 * The parts of a keydown the registry reads, so tests need no browser.
 * @typedef {Pick<KeyboardEvent, 'key'> & Partial<Pick<KeyboardEvent, 'metaKey' | 'ctrlKey' | 'altKey' | 'shiftKey' |
 *   'defaultPrevented' | 'isComposing'>>} KeyPress
 */

/** @param {string | undefined | null} platform */
export function isMac(platform) {
  return /mac|iphone|ipad|ipod/i.test(String(platform || ''))
}

/**
 * The platform's names for the Super shortcut, the one source for the
 * button's hint, tooltip and ARIA and the shortcuts list. Off macOS the Ctrl
 * key leads and the Windows or Super key is named beside it.
 * @param {string | undefined | null} platform
 * @returns {KeyLabels}
 */
export function keyLabels(platform) {
  if (isMac(platform)) {
    return { key: '⌘', keyName: 'Command', shortcut: '⌘K', also: '', title: 'Search (⌘K)', aria: 'Meta+K /' }
  }
  const also = /win/i.test(String(platform || '')) ? 'Windows' : 'Super'
  return {
    key: 'Ctrl',
    keyName: 'Control',
    shortcut: 'Ctrl K',
    also,
    title: `Search (Ctrl K or ${also} K)`,
    aria: 'Control+K Meta+K /'
  }
}

/**
 * Whether an element takes typing, so a bare key belongs to it.
 * @param {any} el
 */
export function isEditable(el) {
  if (!el) return false
  if (el.isContentEditable) return true
  const tag = el.tagName
  if (tag === 'TEXTAREA' || tag === 'SELECT') return true
  if (tag !== 'INPUT') return false
  return !/^(button|checkbox|color|file|hidden|image|radio|range|reset|submit)$/i.test(el.type || 'text')
}

/**
 * Whether a keydown is one written key, such as `Super+K` or `/`.
 * @param {KeyPress} event
 * @param {string} keys
 * @param {boolean} mac
 * @param {boolean} editable  Focus is in a field.
 */
export function matchesKeys(event, keys, mac, editable) {
  if (event.defaultPrevented || event.isComposing) return false
  const parts = keys.split('+')
  const key = /** @type {string} */ (parts.pop())
  const mods = new Set(parts.map((m) => m.toLowerCase()))
  const pressed = event.key.length === 1 ? event.key.toLowerCase() : event.key
  const wanted = key.length === 1 ? key.toLowerCase() : key
  if (pressed !== wanted) return false
  if (mods.has('super')) {
    if (event.altKey || event.shiftKey) return false
    if (event.metaKey && !event.ctrlKey) return true
    return !!event.ctrlKey && !event.metaKey && !mac
  }
  // A bare key: never with a modifier other than the Shift its character needs, never from a field.
  return !event.metaKey && !event.ctrlKey && !event.altKey && !editable
}

/** The fixed global shortcuts, by the action each names. */
export const GLOBAL_KEYS = /** @type {const} */ ({ toggle: 'Super+K', open: '/', shortcuts: '?' })

/**
 * Which of the fixed global shortcuts a keydown is: `toggle` (Super+K),
 * `open` (`/`), `shortcuts` (`?`) or null.
 * @param {KeyPress} event
 * @param {boolean} mac
 * @param {boolean} editable
 * @returns {keyof typeof GLOBAL_KEYS | null}
 */
export function shortcutFor(event, mac, editable) {
  for (const [action, keys] of /** @type {[keyof typeof GLOBAL_KEYS, string][]} */ (Object.entries(GLOBAL_KEYS))) {
    if (matchesKeys(event, keys, mac, editable)) return action
  }
  return null
}

export class ShortcutRegistry {
  /** @type {Map<string, Shortcut>} */
  #shortcuts = new Map()
  /** @type {Set<() => void>} */
  #listeners = new Set()

  /** @param {string | undefined | null} [platform] */
  constructor(platform) {
    this.mac = isMac(platform)
    this.labels = keyLabels(platform)
  }

  /**
   * Adds a shortcut, replacing one with the same id; returns its removal.
   * @param {Shortcut} shortcut
   */
  register(shortcut) {
    this.#shortcuts.set(shortcut.id, shortcut)
    this.#changed()
    return () => {
      if (this.#shortcuts.get(shortcut.id) === shortcut) {
        this.#shortcuts.delete(shortcut.id)
        this.#changed()
      }
    }
  }

  /** Every shortcut, in the order registered. */
  list() {
    return [...this.#shortcuts.values()]
  }

  /**
   * The shortcuts under their group headings, groups in the order first seen.
   * @returns {{ group: string, shortcuts: Shortcut[] }[]}
   */
  groups() {
    /** @type {Map<string, Shortcut[]>} */
    const groups = new Map()
    for (const s of this.#shortcuts.values()) {
      const list = groups.get(s.group) ?? []
      list.push(s)
      groups.set(s.group, list)
    }
    return [...groups].map(([group, shortcuts]) => ({ group, shortcuts }))
  }

  /**
   * Calls `listener` whenever the list changes; returns its removal.
   * @param {() => void} listener
   */
  subscribe(listener) {
    this.#listeners.add(listener)
    return () => this.#listeners.delete(listener)
  }

  /**
   * Runs the global shortcut a keydown is, if any; true when one ran.
   * @param {KeyboardEvent} event
   */
  handle(event) {
    const editable = isEditable(event.target)
    for (const s of this.#shortcuts.values()) {
      if ((s.scope ?? 'global') !== 'global' || !s.run) continue
      if (s.keys.some((k) => matchesKeys(event, k, this.mac, editable))) {
        event.preventDefault()
        s.run(event)
        return true
      }
    }
    return false
  }

  /**
   * Listens on `target` with the one keydown listener; returns its removal.
   * @param {EventTarget} target
   */
  attach(target) {
    const listener = (/** @type {Event} */ event) => {
      this.handle(/** @type {KeyboardEvent} */ (event))
    }
    target.addEventListener('keydown', listener)
    return () => target.removeEventListener('keydown', listener)
  }

  #changed() {
    for (const listener of this.#listeners) listener()
  }
}

/** @type {ShortcutRegistry | undefined} */
let pageRegistry

/** The page's one registry, listening on the document from first use. */
export function shortcutRegistry() {
  if (!pageRegistry) {
    const nav = /** @type {any} */ (globalThis.navigator)
    pageRegistry = new ShortcutRegistry(nav?.userAgentData?.platform || nav?.platform)
    if (typeof document !== 'undefined') pageRegistry.attach(document)
  }
  return pageRegistry
}
