// @ts-check
import { applyTheme, previewValues, resolveTheme, solarEnabled, storageKeys, validateThemeConfig } from './core.js'
import { solarState } from './solar.js'

/** One active theme system per document. */
export class StoaThemeEngine {
  /** @type {import('./core.js').ThemeConfig | undefined} */
  #config
  /** @type {import('./core.js').ThemeState | undefined} */
  #state
  /** @type {AbortController | undefined} */
  #abort
  /** @type {MediaQueryList | undefined} */
  #media
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #timer
  /** A snapshot, so event listeners cannot mutate the engine. */
  get state() {
    return this.#state && structuredClone(this.#state)
  }
  get offer() {
    return this.#config && structuredClone(this.#config.offer ?? {})
  }
  get system() {
    return this.#config && structuredClone(this.#config.system)
  }
  get active() {
    return !!this.#abort
  }
  /** Values from the address when the page is a preview (see `previewValues`), kept in memory, never stored.
   * @type {Record<string, string> | null} */
  #preview = null
  /** Whether the page is a preview: its theme, mode or phase come from the address and nothing is stored. */
  get previewing() {
    return this.#preview !== null
  }
  /** @param {string} key */
  #read(key) {
    if (this.#preview) return key in this.#preview ? this.#preview[key] : null
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  }
  /** @param {string} key @param {string | null | undefined} value */
  #write(key, value) {
    if (this.#preview) {
      if (value === null || value === undefined) delete this.#preview[key]
      else this.#preview[key] = String(value)
      return
    }
    try {
      if (value === null || value === undefined) localStorage.removeItem(key)
      else localStorage.setItem(key, String(value))
    } catch {
      /* Storage is optional. */
    }
  }

  /** @param {import('./core.js').ThemeConfig} config */
  init(config) {
    validateThemeConfig(config)
    if (this.active) throw new Error('A theme system is already active; destroy it before replacing it')
    this.#config = structuredClone(config)
    this.#preview = typeof location === 'undefined' ? null : previewValues(location.search, config.system)
    this.#abort = new AbortController()
    this.#media = matchMedia('(prefers-color-scheme: dark)')
    const listen = { signal: this.#abort.signal }
    if (!this.#preview) {
      // Move a reader's choices from the keys a site used before, once, then clear those and any retired keys.
      for (const [name, old] of Object.entries(config.system.previousKeys ?? {})) {
        const key = `${config.system.keyPrefix}${name}`
        const value = this.#read(old)
        if (value !== null && this.#read(key) === null) this.#write(key, value)
        this.#write(old, null)
      }
      for (const key of config.system.retiredKeys ?? []) this.#write(key, null)
    }
    this.#apply(this.#resolve(), 'load')
    document.addEventListener(
      'visibilitychange',
      () => {
        if (document.visibilityState === 'visible' && this.#state?.modePreference === 'solar')
          this.#apply(this.#resolve(this.#state), 'solar')
      },
      listen
    )
    this.#media.addEventListener(
      'change',
      () => {
        if (this.#state?.modePreference === 'system') this.#apply(this.#resolve(this.#state), 'system')
      },
      listen
    )
    const keys = Object.values(storageKeys(config.system))
    window.addEventListener(
      'storage',
      (event) => {
        if (this.#preview || (event.storageArea && event.storageArea !== this.#storage())) return
        if (event.key === null || keys.includes(event.key)) this.#apply(this.#resolve(), 'storage')
      },
      listen
    )
    // While the Solar dial is dragged, the page takes the look of the previewed moment: light or dark by daylight,
    // with its phase and sun. Nothing is stored; letting go restores the chosen state or holds the new phase.
    document.addEventListener(
      'stoa-solar-preview',
      (event) => {
        const solar = /** @type {CustomEvent} */ (event).detail?.solar
        const state = this.#state
        if (!state || !this.#config) return
        const root = document.documentElement
        if (solar) {
          applyTheme(
            this.#config,
            { ...state, modePreference: 'solar', mode: solar.daylight ? 'light' : 'dark', held: null, solar },
            root
          )
          root.setAttribute('data-solar-preview', '')
        } else {
          root.removeAttribute('data-solar-preview')
          applyTheme(this.#config, state, root)
        }
      },
      listen
    )
    // External controls may dispatch the same cancellable request themselves.
    document.addEventListener(
      'stoa-theme-change',
      (event) => {
        if (this.#ownRequest) return
        queueMicrotask(() => {
          if (event.defaultPrevented || !this.active) return
          const detail = /** @type {CustomEvent} */ (event).detail
          if (detail?.reset === true) this.#reset()
          else this.#choose(detail)
        })
      },
      listen
    )
    return this
  }

  #ownRequest = false
  /** Requests a choice; cancellation anywhere on document stops it.
   * @param {import('./core.js').ThemeChoice} choice
   */
  set(choice) {
    if (!this.active) return false
    const event = new CustomEvent('stoa-theme-change', {
      bubbles: true,
      cancelable: true,
      detail: { ...structuredClone(choice), previous: this.state }
    })
    this.#ownRequest = true
    let accepted
    try {
      accepted = document.dispatchEvent(event)
    } finally {
      this.#ownRequest = false
    }
    if (accepted) this.#choose(choice)
    return accepted
  }

  /** Returns to the site's defaults: forgets the reader's theme, mode, held phase and axis choices (a place they
   * shared for Solar stays). A cancellable `stoa-theme-change` with `{ reset: true }` asks first, as `set` does.
   * @returns {boolean} whether the reset happened
   */
  reset() {
    if (!this.active) return false
    const event = new CustomEvent('stoa-theme-change', {
      bubbles: true,
      cancelable: true,
      detail: { reset: true, previous: this.state }
    })
    this.#ownRequest = true
    let accepted
    try {
      accepted = document.dispatchEvent(event)
    } finally {
      this.#ownRequest = false
    }
    if (accepted) this.#reset()
    return accepted
  }
  #reset() {
    const system = /** @type {import('./core.js').ThemeSystem} */ (this.#config?.system)
    const keys = storageKeys(system)
    for (const [name, key] of Object.entries(keys)) if (name !== 'mode-place') this.#write(key, null)
    this.#apply(this.#resolve(), 'reset')
  }

  destroy() {
    clearTimeout(this.#timer)
    this.#abort?.abort()
    this.#abort = undefined
    this.#config = undefined
    this.#state = undefined
    this.#media = undefined
  }

  #storage() {
    try {
      return localStorage
    } catch {
      return undefined
    }
  }
  /** @param {import('./core.js').ThemeChoice} [choice] */
  #resolve(choice) {
    return resolveTheme(
      /** @type {import('./core.js').ThemeConfig} */ (this.#config),
      (key) => this.#read(key),
      this.#media?.matches ?? false,
      choice,
      (held, place) => solarState(this.now(), { sky: this.#config?.system.solar?.sky, held, place })
    )
  }
  /** @param {import('./core.js').ThemeChoice} choice */
  #choose(choice) {
    if (!choice || typeof choice !== 'object') return
    const previous = /** @type {import('./core.js').ThemeState} */ (this.#state)
    const state = this.#resolve({ ...previous, ...choice, axes: { ...previous.axes, ...choice.axes } })
    const system = /** @type {import('./core.js').ThemeSystem} */ (this.#config?.system)
    const writes = [
      ...(choice.theme !== undefined ? [[`${system.keyPrefix}theme`, state.theme]] : []),
      ...(choice.modePreference !== undefined && system.mode
        ? [[`${system.keyPrefix}mode`, state.modePreference]]
        : []),
      ...(choice.held !== undefined && system.mode && solarEnabled(system)
        ? [[`${system.keyPrefix}mode-phase`, state.held ?? null]]
        : []),
      ...(system.axes ?? [])
        .filter((a) => choice.axes?.[a.id] !== undefined)
        .map((a) => [`${system.keyPrefix}${a.id}`, state.axes[a.id]])
    ]
    for (const [key, value] of writes)
      this.#write(String(key), value === null || value === undefined ? null : String(value))
    this.#apply(state, 'choice')
  }
  /** The clock the engine follows; a workbench or test may replace it to scrub through a day. */
  now = () => new Date()

  /** Ask the browser for the reader's location, once, for exact sunrise and sunset; stored on this site, rounded
   * to about ten kilometres. Resolves to whether a place was saved.
   * @returns {Promise<boolean>}
   */
  locate() {
    const system = this.#config?.system
    if (!this.active || !system?.mode || !navigator.geolocation) return Promise.resolve(false)
    const key = `${system.keyPrefix}mode-place`
    return new Promise((resolve) =>
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const round = (/** @type {number} */ n) => Math.round(n * 10) / 10
          this.#write(
            key,
            JSON.stringify({ latitude: round(position.coords.latitude), longitude: round(position.coords.longitude) })
          )
          if (this.#state) this.#apply(this.#resolve(this.#state), 'solar')
          resolve(true)
        },
        () => resolve(false),
        { maximumAge: 864e5, timeout: 15e3 }
      )
    )
  }

  /** Re-resolve every minute while Solar follows the sun, announcing phase changes and the moments between them. */
  #schedule() {
    clearTimeout(this.#timer)
    const solar = this.#state?.solar
    if (this.#state?.modePreference !== 'solar' || !solar || solar.held || !this.active) return
    this.#timer = setTimeout(() => {
      if (document.visibilityState !== 'hidden' && this.#state) this.#apply(this.#resolve(this.#state), 'solar')
      else this.#schedule()
    }, 60e3)
  }
  /** The moment crossed between two solar states, if any.
   * @param {import('./solar.js').SolarState | undefined} before @param {import('./solar.js').SolarState | undefined} after
   */
  #moment(before, after) {
    if (!before || !after || before.held || after.held) return null
    if (!before.daylight && after.daylight) return 'sunrise'
    if (before.daylight && !after.daylight) return 'sunset'
    if (before.rising && !after.rising) return after.daylight ? 'solar-noon' : null
    if (!before.rising && after.rising) return after.daylight ? null : 'solar-midnight'
    return null
  }
  /** @param {import('./core.js').ThemeState} state @param {'choice' | 'system' | 'storage' | 'load' | 'solar' | 'reset'} cause */
  #apply(state, cause) {
    const config = /** @type {import('./core.js').ThemeConfig} */ (this.#config)
    const before = this.#state?.solar
    this.#state = state
    this.#schedule()
    applyTheme(config, state, document.documentElement)
    if (config.system.themeColor) {
      let meta = document.querySelector('meta[name="theme-color"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'theme-color')
        document.head.append(meta)
      }
      meta.setAttribute(
        'content',
        getComputedStyle(document.documentElement).getPropertyValue('--stoa-background').trim()
      )
    }
    document.dispatchEvent(new CustomEvent('stoa-theme-applied', { detail: { ...this.state, cause } }))
    const after = state.solar
    if (after && cause !== 'load' && before?.phase !== after.phase)
      document.dispatchEvent(
        new CustomEvent('stoa-solar-phase', {
          detail: { phase: after.phase, previous: before?.phase ?? null, solar: structuredClone(after) }
        })
      )
    const moment = this.#moment(before, after)
    if (moment)
      document.dispatchEvent(
        new CustomEvent('stoa-solar-moment', { detail: { moment, solar: structuredClone(after) } })
      )
  }
}
export const stoaTheme = new StoaThemeEngine()

/** Initialise from the generated JSON block, once the head and styles exist. */
export function initStoaTheme() {
  if (stoaTheme.active) return stoaTheme
  const config = document.getElementById('stoa-theme-config')?.textContent
  if (config) stoaTheme.init(JSON.parse(config))
  return stoaTheme
}
