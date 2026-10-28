// @ts-check
import { solarEnabled } from './core.js'
import { initStoaTheme, stoaTheme } from './engine.js'
import { SOLAR_PHASES, solarState } from './solar.js'

const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

class ThemeSwitch extends Base {
  /** @type {AbortController | undefined} */
  #abort
  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    initStoaTheme()
    this.#abort = new AbortController()
    const listen = { signal: this.#abort.signal }
    document.addEventListener('stoa-theme-applied', () => this.#mark(), listen)
    this.addEventListener(
      'click',
      (event) => {
        const button = /** @type {Element | null} */ (event.target)?.closest('button[data-theme-choice]')
        const value = button?.getAttribute('data-theme-choice')
        if (!value || !stoaTheme.active) return
        const axis = this.getAttribute('axis')
        if (axis) stoaTheme.set({ axes: { [axis]: value } })
        else stoaTheme.set({ modePreference: /** @type {import('./core.js').ModePreference} */ (value) })
      },
      listen
    )
    this.#mark()
  }
  disconnectedCallback() {
    this.#abort?.abort()
    this.#abort = undefined
    this.hidden = true
  }
  #mark() {
    const axis = this.getAttribute('axis')
    const state = stoaTheme.state
    this.hidden =
      !stoaTheme.active ||
      (!!axis && (!stoaTheme.system?.axes?.some((a) => a.id === axis) || stoaTheme.offer?.axes?.[axis]?.show === false))
    const value = axis ? state?.axes[axis] : state?.modePreference
    for (const button of this.querySelectorAll('[data-theme-choice]'))
      button.setAttribute('aria-pressed', String(button.getAttribute('data-theme-choice') === value))
  }
}
export class StoaModeSwitch extends ThemeSwitch {}
export class StoaAxisSwitch extends ThemeSwitch {}
/** @param {string} [name] */
export function defineStoaModeSwitch(name = 'stoa-mode-switch') {
  if (!customElements.get(name)) customElements.define(name, StoaModeSwitch)
  defineStoaSolarDial()
}
/** @param {string} [name] */
export function defineStoaAxisSwitch(name = 'stoa-axis-switch') {
  if (!customElements.get(name)) customElements.define(name, StoaAxisSwitch)
}

/** Today's sunrise and sunset, and where they are for. @param {import('./solar.js').SolarState} solar */
function solarTimes(solar) {
  const hhmm = (/** @type {number | null} */ m) =>
    m === null ? '—' : `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
  const where = solar.place.source === 'device' ? 'your location' : `${solar.place.name}, from your time zone`
  return solar.times.sunrise === null
    ? `No sunrise or sunset today for ${where}.`
    : `Sunrise ${hhmm(solar.times.sunrise)} · Sunset ${hhmm(solar.times.sunset)} · for ${where}`
}

/**
 * `<stoa-solar-dial>`: drag across the day's phases to hold one; Follow the sun releases it. It selects Solar as
 * it holds. It shows while the engine runs with Solar on, and redraws on `stoa-theme-applied` and
 * `stoa-solar-phase`.
 */
export class StoaSolarDial extends Base {
  /** @type {AbortController | undefined} */
  #abort
  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    initStoaTheme()
    this.#abort = new AbortController()
    const listen = { signal: this.#abort.signal }
    for (const name of ['stoa-theme-applied', 'stoa-solar-phase'])
      document.addEventListener(name, () => this.#mark(), listen)
    // Dragging scrubs through the day: a preview the page can draw, without holding anything. Letting go snaps to
    // the nearest phase and holds it. The arrow keys step from phase to phase.
    this.addEventListener(
      'input',
      (event) => {
        const range = /** @type {Element | null} */ (event.target)?.closest?.('[data-solar-range]')
        if (!(range instanceof HTMLInputElement) || !stoaTheme.active) return
        const position = Number(range.value)
        this.#scrubbing = true
        const phase = SOLAR_PHASES[Math.round(position) % SOLAR_PHASES.length]
        range.setAttribute('aria-valuetext', phase?.label ?? '')
        const label = this.querySelector('[data-solar-label]')
        if (label && phase) label.textContent = phase.label
        this.dispatchEvent(
          new CustomEvent('stoa-solar-preview', {
            bubbles: true,
            detail: {
              position,
              phase: phase?.code ?? null,
              solar: solarScrub(position, stoaTheme.system?.solar?.sky)
            }
          })
        )
      },
      listen
    )
    this.addEventListener(
      'change',
      (event) => {
        const range = /** @type {Element | null} */ (event.target)?.closest?.('[data-solar-range]')
        if (!(range instanceof HTMLInputElement) || !stoaTheme.active) return
        const position = Math.round(Number(range.value))
        const index = position % SOLAR_PHASES.length
        range.value = String(position)
        this.#scrubbing = false
        this.dispatchEvent(
          new CustomEvent('stoa-solar-preview', {
            bubbles: true,
            detail: { position, phase: null, solar: null }
          })
        )
        stoaTheme.set({ modePreference: 'solar', held: SOLAR_PHASES[index]?.code ?? null })
      },
      listen
    )
    this.addEventListener(
      'keydown',
      (event) => {
        const range = /** @type {Element | null} */ (event.target)?.closest?.('[data-solar-range]')
        const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -4, PageUp: 4 }
        if (!(range instanceof HTMLInputElement) || !stoaTheme.active) return
        const key = /** @type {KeyboardEvent} */ (event).key
        // Steps wrap round the day: on from the last phase is midnight again.
        const count = SOLAR_PHASES.length
        const now = Math.round(Number(range.value)) % count
        const next =
          key === 'Home'
            ? 0
            : key === 'End'
              ? count - 1
              : key in steps
                ? (((now + steps[/** @type {keyof typeof steps} */ (key)]) % count) + count) % count
                : null
        if (next === null) return
        event.preventDefault()
        range.value = String(next)
        range.dispatchEvent(new Event('change', { bubbles: true }))
      },
      listen
    )
    this.addEventListener(
      'change',
      (event) => {
        const follow = /** @type {Element | null} */ (event.target)?.closest?.('[data-solar-follow]')
        if (!(follow instanceof HTMLInputElement) || !stoaTheme.active) return
        const phase = stoaTheme.state?.solar?.phase ?? null
        stoaTheme.set({ modePreference: 'solar', held: follow.checked ? null : phase })
      },
      listen
    )
    this.addEventListener(
      'click',
      (event) => {
        if (/** @type {Element | null} */ (event.target)?.closest('[data-solar-locate]') && stoaTheme.active)
          stoaTheme.locate()
      },
      listen
    )
    this.#mark()
  }
  disconnectedCallback() {
    this.#abort?.abort()
    this.#abort = undefined
    this.hidden = true
  }
  /** Whether the reader is dragging the dial: the theme's own updates then leave the thumb and label alone. */
  #scrubbing = false
  #mark() {
    const system = stoaTheme.system
    this.hidden = !stoaTheme.active || !system || !solarEnabled(system)
    const state = stoaTheme.state
    const solar = state?.solar
    const live = state?.modePreference === 'solar'
    const index = SOLAR_PHASES.findIndex((p) => p.code === (state?.held ?? solar?.phase))
    const phase = SOLAR_PHASES[index]
    const range = this.querySelector('[data-solar-range]')
    if (this.#scrubbing) return
    if (range instanceof HTMLInputElement && index >= 0) {
      // Midnight sits at both ends; one let go at the end stays there.
      if (!(index === 0 && Number(range.value) === SOLAR_PHASES.length)) range.value = String(index)
      range.setAttribute('aria-valuetext', phase.label)
    }
    const label = this.querySelector('[data-solar-label]')
    if (label) label.textContent = live && phase ? phase.label : 'Drag to choose a time of day'
    const held = this.querySelector('[data-solar-held]')
    if (held instanceof HTMLElement) held.hidden = !(live && state?.held)
    const follow = this.querySelector('[data-solar-follow]')
    if (follow instanceof HTMLInputElement) follow.checked = live && !state?.held
    const times = this.querySelector('[data-solar-times]')
    if (times) times.textContent = solar ? solarTimes(solar) : ''
    const locate = this.querySelector('[data-solar-locate]')
    if (locate instanceof HTMLElement) locate.hidden = !('geolocation' in navigator) || solar?.place.source === 'device'
  }
}
/** @param {string} [name] */
export function defineStoaSolarDial(name = 'stoa-solar-dial') {
  if (!customElements.get(name)) customElements.define(name, StoaSolarDial)
}

/**
 * The sky at any point along the dial, between the phases' held moments: elevation and the position through the day
 * or night are interpolated between the two neighbouring phases. A preview for drawing only; nothing is held.
 * @param {number} position 0 (solar midnight) to the last phase, fractional while dragging
 * @param {'simulated' | 'accurate'} [sky]
 * @returns {import('./solar.js').SolarState}
 */
export function solarScrub(position, sky = 'simulated') {
  // Positions run from 0 (solar midnight) to the number of phases, which is the next solar midnight: the track
  // covers the whole day, so the evening runs on through the night to midnight instead of stopping at twilight.
  const count = SOLAR_PHASES.length
  const p = Math.max(0, Math.min(count, position))
  const at = (/** @type {number} */ i) => solarState(new Date(), { sky, held: SOLAR_PHASES[i % count].code })
  // One continuous angle round the sky: 0 at sunrise, π at sunset, 2π at the next sunrise. Unwrapped so the dial
  // runs forward from solar midnight (1.5π) through sunrise (2π) and sunset (3π) to late evening twilight.
  const angle = (/** @type {import('./solar.js').SolarState} */ s) => {
    const a = s.daylight ? Math.PI * s.fraction : Math.PI + Math.PI * s.fraction
    return a < Math.PI * 1.5 ? a + 2 * Math.PI : a
  }
  const i = Math.min(count - 1, Math.floor(p))
  const j = i + 1
  const a = at(i)
  const b = at(j)
  const t = p - i
  // The next midnight is a full turn on from this one.
  const end = angle(b) + (j === count ? 2 * Math.PI : 0)
  const ang = angle(a) + (end - angle(a)) * t
  const turn = ((ang % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)
  const daylight = turn <= Math.PI + 1e-9
  const near = SOLAR_PHASES[Math.round(p) % count].code
  return {
    ...a,
    phase: /** @type {import('./solar.js').SolarPhase} */ (near),
    held: null,
    elevation: a.elevation + (b.elevation - a.elevation) * t,
    daylight,
    rising: turn >= Math.PI * 1.5 || turn < Math.PI * 0.5,
    fraction: daylight ? turn / Math.PI : (turn - Math.PI) / Math.PI
  }
}
