// @ts-check
/** The reader's mode selection. `time` is the 0.19 name for `solar`, read as `solar`.
 * @typedef {'system' | 'light' | 'dark' | 'solar'} ModePreference */
/** @typedef {{sky?: 'simulated' | 'accurate', hold?: boolean, location?: 'timezone' | 'ask'}} SolarConfig */
/** @typedef {{id: string, attribute: string, values: {id: string, label: string, title?: string}[], default: string, label: string}} ThemeAxis */
/** @typedef {{id: string, attribute?: string, themes: import('../theme-menu/render.js').ThemeOption[], keyPrefix: string, mode?: {default?: ModePreference | 'time', offer?: ModePreference[], time?: boolean}, solar?: SolarConfig, axes?: ThemeAxis[], previousKeys?: Record<string, string>, retiredKeys?: string[], themeColor?: boolean}} ThemeSystem */
/* Every key the engine keeps is the system's keyPrefix plus a fixed name: theme, mode, mode-phase, mode-place and
 * each axis id. previousKeys maps those names to keys a site used before; the engine moves a reader's choice across
 * once. */
/** @typedef {{themes?: string[], default?: string, axes?: Record<string, {show: boolean, default?: string}>}} ThemeOffer */
/** @typedef {{system: ThemeSystem, offer?: ThemeOffer}} ThemeConfig */
/** @typedef {{theme: string, mode: 'light' | 'dark', modePreference: ModePreference, axes: Record<string, string>, held?: string | null, solar?: import('./solar.js').SolarState}} ThemeState */
/** @typedef {{theme?: string, modePreference?: ModePreference, axes?: Record<string, string>, held?: string | null}} ThemeChoice */

/** Validate once at build/initialisation; no site identity enters the engine.
 * @param {ThemeConfig} config
 */
export function validateThemeConfig(config) {
  const { system, offer = {} } = config
  const identifier = /^[a-zA-Z0-9_-]+$/
  const unique = (/** @type {string[]} */ values, /** @type {string} */ label) => {
    if (values.some((v) => !v) || new Set(values).size !== values.length)
      throw new Error(`Invalid or duplicate ${label}`)
  }
  if (!system.id || !system.themes.length) throw new Error('A theme system needs an id and themes')
  const ids = system.themes.map((t) => t.id)
  unique(ids, 'theme ids')
  if (ids.some((id) => !identifier.test(id)) || system.themes.some((t) => !t.name))
    throw new Error('Invalid theme descriptor')
  const themes = offer.themes ?? ids
  unique(themes, 'offered themes')
  if (!themes.length || themes.some((id) => !ids.includes(id)) || !themes.includes(offer.default ?? themes[0]))
    throw new Error('Invalid theme offer or default')
  const axes = system.axes ?? []
  unique(
    axes.map((a) => a.id),
    'axis ids'
  )
  const attributes = [
    system.attribute ?? 'data-theme',
    'data-mode',
    'data-mode-preference',
    ...axes.map((a) => a.attribute)
  ]
  unique(attributes, 'attributes')
  if (attributes.some((a) => !/^data-[a-z][a-z0-9-]*$/.test(a)))
    throw new Error('Theme attributes must be data-* names')
  if (typeof system.keyPrefix !== 'string' || !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*-$/.test(system.keyPrefix))
    throw new Error('A theme system needs a keyPrefix such as "site-": lower case, ending in a hyphen')
  if ('storageKey' in system || (system.mode && 'storageKey' in system.mode) || axes.some((a) => 'storageKey' in a))
    throw new Error('storageKey is gone: the engine names its keys from system.keyPrefix')
  if (axes.some((a) => ['theme', 'mode', 'mode-phase', 'mode-place'].includes(a.id)))
    throw new Error('An axis id cannot be theme, mode, mode-phase or mode-place: its key would clash')
  const named = storageKeys(system)
  const keys = Object.values(named)
  unique(keys, 'storage keys')
  const previous = Object.entries(system.previousKeys ?? {})
  if (previous.some(([name, key]) => !(name in named) || !key || keys.includes(key)))
    throw new Error('previousKeys maps a name the engine keeps to a key no longer in use')
  unique(system.retiredKeys ?? [], 'retired keys')
  if (system.retiredKeys?.some((key) => keys.includes(key))) throw new Error('A live key cannot be retired')
  const offered = modePreferences(system)
  if (
    !offered.length ||
    new Set(offered).size !== offered.length ||
    offered.some((m) => !['system', 'light', 'dark', 'solar'].includes(m))
  )
    throw new Error('Invalid mode offer')
  if (system.mode?.default && !offered.includes(system.mode.default === 'time' ? 'solar' : system.mode.default))
    throw new Error('Invalid mode default')
  if (system.solar) {
    const { sky = 'simulated', location = 'timezone' } = system.solar
    if (!['simulated', 'accurate'].includes(sky) || !['timezone', 'ask'].includes(location))
      throw new Error('Invalid solar configuration')
    if (!offered.includes('solar')) throw new Error('Solar configuration needs solar in the mode offer')
  }
  for (const axis of axes) {
    unique(
      axis.values.map((v) => v.id),
      'axis values'
    )
    const values = axis.values.map((v) => v.id)
    if (
      !identifier.test(axis.id) ||
      !axis.label ||
      !values.length ||
      values.some((v) => !identifier.test(v)) ||
      axis.values.some((v) => !v.label) ||
      !values.includes(axis.default) ||
      !values.includes(offer.axes?.[axis.id]?.default ?? axis.default)
    )
      throw new Error(`Invalid axis ${axis.id}`)
  }
  if (Object.keys(offer.axes ?? {}).some((id) => !axes.some((a) => a.id === id)))
    throw new Error('Unknown offered axis')
  return config
}

/** Whether a system turns Solar on: by a `solar` block, by offering it, or by the 0.19 `mode.time` flag.
 * @param {ThemeSystem} system
 */
export function solarEnabled(system) {
  return Boolean(system.solar || system.mode?.time || system.mode?.offer?.includes('solar'))
}

/** The mode selections a system offers, in order: its own `mode.offer`, or System, Light and Dark, with Solar
 * when Solar is on.
 * @param {ThemeSystem} system @returns {ModePreference[]}
 */
export function modePreferences(system) {
  if (system.mode?.offer) return [...system.mode.offer]
  return solarEnabled(system) ? ['system', 'light', 'dark', 'solar'] : ['system', 'light', 'dark']
}

/** The selection a reader starts with: the configured default, or System when offered, or the first offered.
 * @param {ThemeSystem} system @returns {ModePreference}
 */
export function defaultModePreference(system) {
  const offered = modePreferences(system)
  const wanted = system.mode?.default === 'time' ? 'solar' : system.mode?.default
  return wanted && offered.includes(wanted) ? wanted : offered.includes('system') ? 'system' : offered[0]
}

/** Approximate sunrise, sunset and solar altitude for a date, from the reader's time zone only (never
 * geolocation). Self-contained: it also runs verbatim in the generated pre-paint script.
 * @param {Date} date
 * @returns {{rise: number, set: number, noon: number, day: boolean, altitude: number, minutes: number, latitude: number}}
 * Minutes are local minutes after midnight.
 */
export function daylight(date) {
  /** @type {Record<string, [number, number]>} */
  const zones = {
    'Europe/London': [51.5, -0.13],
    'Europe/Dublin': [53.35, -6.26],
    'Europe/Lisbon': [38.72, -9.14],
    'Europe/Brussels': [50.85, 4.35],
    'Europe/Amsterdam': [52.37, 4.9],
    'Europe/Paris': [48.86, 2.35],
    'Europe/Berlin': [52.52, 13.4],
    'Europe/Madrid': [40.42, -3.7],
    'Europe/Rome': [41.9, 12.5],
    'Europe/Stockholm': [59.33, 18.07],
    'Europe/Helsinki': [60.17, 24.94],
    'Europe/Athens': [37.98, 23.73],
    'America/New_York': [40.71, -74],
    'America/Chicago': [41.88, -87.63],
    'America/Denver': [39.74, -104.99],
    'America/Los_Angeles': [34.05, -118.24],
    'America/Toronto': [43.65, -79.38],
    'Asia/Dubai': [25.2, 55.27],
    'Asia/Kolkata': [28.61, 77.21],
    'Asia/Singapore': [1.35, 103.82],
    'Asia/Tokyo': [35.68, 139.69],
    'Australia/Sydney': [-33.87, 151.21],
    'Pacific/Auckland': [-36.85, 174.76]
  }
  let zone = ''
  try {
    zone = Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch {}
  const offset = -date.getTimezoneOffset()
  const [lat, lng] = zones[zone] ?? [50, (offset / 60) * 15]
  const r = Math.PI / 180
  const n = Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 864e5)
  const decl = -23.44 * Math.cos(((2 * Math.PI) / 365) * (n + 10))
  const b = (2 * Math.PI * (n - 81)) / 364
  const eot = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b)
  const noon = 720 - 4 * lng - eot + offset
  const c = (Math.sin(-0.833 * r) - Math.sin(lat * r) * Math.sin(decl * r)) / (Math.cos(lat * r) * Math.cos(decl * r))
  const half = (Math.acos(Math.max(-1, Math.min(1, c))) / r) * 4
  const minutes = date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60
  const altitude =
    Math.asin(
      Math.sin(lat * r) * Math.sin(decl * r) +
        Math.cos(lat * r) * Math.cos(decl * r) * Math.cos(((minutes - noon) / 4) * r)
    ) / r
  return { rise: noon - half, set: noon + half, noon, day: altitude > -0.833, altitude, minutes, latitude: lat }
}

/** This self-contained function also runs verbatim in the generated pre-paint script.
 * @param {ThemeConfig} config
 * @param {(key: string) => string | null} read
 * @param {boolean} dark  Whether the browser reports a dark preference, for System.
 * @param {ThemeChoice} [choice]
 * @param {boolean | ((held: string | null, place: {latitude: number, longitude: number} | null) => import('./solar.js').SolarState)} [sun]
 *   For Solar: a function giving the solar state for a held phase (or null) and a chosen place (or null). A plain
 *   boolean, whether it is daylight, is accepted for simple callers and tests.
 * @returns {ThemeState}
 */
export function resolveTheme(config, read, dark, choice = {}, sun = true) {
  const { system, offer = {} } = config
  const themes = offer.themes ?? system.themes.map((t) => t.id)
  const wanted = choice.theme ?? read(`${system.keyPrefix}theme`)
  const theme = wanted && themes.includes(wanted) ? wanted : (offer.default ?? themes[0])
  const solarOn = Boolean(system.solar || system.mode?.time || system.mode?.offer?.includes('solar'))
  /** @type {string[]} */
  const offered = system.mode?.offer ?? (solarOn ? ['system', 'light', 'dark', 'solar'] : ['system', 'light', 'dark'])
  const named = (/** @type {string | null | undefined} */ value) => (value === 'time' ? 'solar' : value)
  const fallbackWanted = named(system.mode?.default)
  const fallback =
    fallbackWanted && offered.includes(fallbackWanted)
      ? fallbackWanted
      : offered.includes('system')
        ? 'system'
        : offered[0]
  const preference = named(choice.modePreference ?? (system.mode ? read(`${system.keyPrefix}mode`) : null))
  const modePreference = /** @type {ModePreference} */ (
    preference && offered.includes(preference) ? preference : fallback
  )
  const axes = Object.fromEntries(
    (system.axes ?? []).map((axis) => {
      const settings = offer.axes?.[axis.id]
      const fallback = settings?.default ?? axis.default
      const value =
        settings?.show === false ? fallback : (choice.axes?.[axis.id] ?? read(`${system.keyPrefix}${axis.id}`))
      return [axis.id, value && axis.values.some((v) => v.id === value) ? value : fallback]
    })
  )
  /** @type {ThemeState} */
  const state = { theme, mode: 'light', modePreference, axes }
  if (modePreference === 'system') state.mode = dark ? 'dark' : 'light'
  else if (modePreference === 'light' || modePreference === 'dark') state.mode = modePreference
  if (solarOn && system.mode) {
    // A held phase only counts where the site lets readers hold one.
    const stored = 'held' in choice ? choice.held : read(`${system.keyPrefix}mode-phase`)
    state.held = system.solar?.hold === false ? null : stored || null
    if (modePreference === 'solar') {
      let place = null
      try {
        const saved = JSON.parse(read(`${system.keyPrefix}mode-place`) || 'null')
        if (saved && Number.isFinite(saved.latitude) && Number.isFinite(saved.longitude)) place = saved
      } catch {}
      const solar = typeof sun === 'function' ? sun(state.held ?? null, place) : null
      if (solar) {
        state.solar = solar
        state.held = solar.held
        state.mode = solar.daylight ? 'light' : 'dark'
      } else state.mode = sun ? 'light' : 'dark'
    }
  }
  return state
}

/** Shared attribute application, including an explicit preference for first-paint controls. With Solar on, the
 * root also carries `data-solar-phase`, `data-solar-held` and the `--sun-elevation` and `--sun-fraction`
 * custom properties while Solar is the selection.
 * @param {ThemeConfig} config
 * @param {ThemeState} state
 * @param {HTMLElement} root
 */
export function applyTheme(config, state, root) {
  root.setAttribute(config.system.attribute ?? 'data-theme', state.theme)
  root.setAttribute('data-mode', state.mode)
  root.setAttribute('data-mode-preference', state.modePreference)
  for (const axis of config.system.axes ?? []) root.setAttribute(axis.attribute, state.axes[axis.id])
  const solar = state.solar
  if (solar) {
    root.setAttribute('data-solar-phase', solar.phase)
    if (solar.held) root.setAttribute('data-solar-held', solar.held)
    else root.removeAttribute('data-solar-held')
    root.style.setProperty('--sun-elevation', solar.elevation.toFixed(2))
    root.style.setProperty('--sun-fraction', solar.fraction.toFixed(4))
  } else if (config.system.solar || config.system.mode?.time || config.system.mode?.offer?.includes('solar')) {
    root.removeAttribute('data-solar-phase')
    root.removeAttribute('data-solar-held')
    root.style.removeProperty('--sun-elevation')
    root.style.removeProperty('--sun-fraction')
  }
}

/**
 * A preview of the site in a given theme, mode or held phase, from the page's address: `?preview-theme=dusk`,
 * `&preview-mode=dark` (system, light, dark or solar) and `&preview-phase=sunset`. When any is present the page
 * is a preview: it reads only these values, never the reader's stored choices, and keeps any change it makes in
 * memory, so a review page or workbench can show many combinations side by side without touching each other or
 * the reader's settings. Returns the values by storage key, or null when the page is not a preview. Self-contained,
 * for the pre-paint script.
 * @param {string} search The page's `location.search`.
 * @param {ThemeSystem} system
 * @returns {Record<string, string> | null}
 */
export function previewValues(search, system) {
  if (!search || !/preview-(theme|mode|phase)=/.test(search)) return null
  const params = new URLSearchParams(search)
  const theme = params.get('preview-theme')
  const mode = params.get('preview-mode')
  const phase = params.get('preview-phase')
  if (theme === null && mode === null && phase === null) return null
  /** @type {Record<string, string>} */
  const values = {}
  const key = (/** @type {string} */ name) => `${system.keyPrefix}${name}`
  if (theme) values[key('theme')] = theme
  if (system.mode && mode) values[key('mode')] = mode
  if (system.mode && phase) {
    values[key('mode')] = values[key('mode')] || 'solar'
    values[key('mode-phase')] = phase
  }
  return values
}

/** The keys a theme system keeps, by name: theme, and with a mode, mode, mode-phase and mode-place, then each axis
 * id. Each is the system's keyPrefix plus the name.
 * @param {ThemeSystem} system
 * @returns {Record<string, string>}
 */
export function storageKeys(system) {
  const names = [
    'theme',
    ...(system.mode ? ['mode', 'mode-phase', 'mode-place'] : []),
    ...(system.axes ?? []).map((a) => a.id)
  ]
  return Object.fromEntries(names.map((name) => [name, `${system.keyPrefix}${name}`]))
}
