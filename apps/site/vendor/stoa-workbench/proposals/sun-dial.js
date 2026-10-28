// PROPOSAL, not shipped: the Sun Dial as a ring or a track, with a lunar preview. It lives in the workbench so it
// can be tried against the real Theme Engine before anything reaches Stoa or a site. See proposals/sun-dial.md.
//
// Solar: one turn is one day, solar midnight at the bottom, sunrise on the left, solar noon at the top and sunset on
// the right, clockwise like a clock. The ring has no end stop: turning on past midnight goes into the next day, and
// the moon moves on a day for each turn. Lunar: one turn is one lunation, new moon at the bottom and full moon at
// the top, in sixteenths. The Track view lays the same turn out straight, midnight to midnight or new to new. The
// sky beside or inside shows the sun or the moon, where it is, and the phase's name.

import { solarScrub } from '../stoa/src/theme-engine/element.js'
import { stoaTheme } from '../stoa/src/theme-engine/engine.js'
import { SOLAR_PHASES, solarState } from '../stoa/src/theme-engine/solar.js'

const TAU = 2 * Math.PI
const SYNODIC = 29.530588853
const COUNT = SOLAR_PHASES.length
const wrap = (/** @type {number} */ a) => ((a % TAU) + TAU) % TAU

/** The moon's age in days at a date: days since a known new moon, modulo the synodic month. */
export const moonAge = (/** @type {Date} */ date) =>
  ((((date.getTime() - Date.UTC(2000, 0, 6, 18, 14)) / 864e5) % SYNODIC) + SYNODIC) % SYNODIC

/** The lunar phases, eight of them, named as people name them. */
export const LUNAR_PHASES = /** @type {const} */ ([
  { code: 'new-moon', label: 'New moon' },
  { code: 'waxing-crescent', label: 'Waxing crescent' },
  { code: 'first-quarter', label: 'First quarter' },
  { code: 'waxing-gibbous', label: 'Waxing gibbous' },
  { code: 'full-moon', label: 'Full moon' },
  { code: 'waning-gibbous', label: 'Waning gibbous' },
  { code: 'last-quarter', label: 'Last quarter' },
  { code: 'waning-crescent', label: 'Waning crescent' }
])

/** The moon at an age in days: its phase, how much of it is lit and whether it is waxing. New moon, the quarters
 * and full moon are moments; the crescents and gibbous moons are the periods between them, as the solar phases
 * are moments and periods. */
export function lunarState(/** @type {number} */ age) {
  const cycle = wrap((age / SYNODIC) * TAU) / TAU
  const quarter = cycle * 4
  const nearest = Math.round(quarter)
  // Within half a day of a quarter, name the moment; otherwise the period the moon is in.
  const moment = Math.abs(quarter - nearest) * (SYNODIC / 4) < 0.5
  return {
    age: cycle * SYNODIC,
    cycle,
    illumination: (1 - Math.cos(cycle * TAU)) / 2,
    waxing: cycle < 0.5,
    phase: LUNAR_PHASES[moment ? (nearest % 4) * 2 : Math.floor(quarter) * 2 + 1]
  }
}
/** The lunar dial snaps to sixteenths: the four moments, the four periods' middles and a stop between each. */
export const LUNAR_STOPS = 16

/* Each phase's place round the dial, in radians from solar midnight. The engine's scrub gives where the sun is
   round the sky; one turn of the dial is one turn of the sky, so midnight, sunrise, noon and sunset fall at the
   bottom, left, top and right, and the twilights bunch near the horizon as they do in the sky. */
const turnOf = (/** @type {{daylight: boolean, fraction: number}} */ s) =>
  s.daylight ? Math.PI * s.fraction : Math.PI + Math.PI * s.fraction
const ANGLES = Array.from({ length: COUNT + 1 }, (_, i) =>
  i === COUNT ? TAU : wrap(turnOf(solarScrub(i)) - 1.5 * Math.PI)
)
/** The scrub position (0 to the phase count) at an angle from solar midnight. */
export function positionAt(/** @type {number} */ angle) {
  const a = wrap(angle)
  for (let i = 0; i < COUNT; i++)
    if (a <= ANGLES[i + 1]) return i + (a - ANGLES[i]) / Math.max(1e-9, ANGLES[i + 1] - ANGLES[i])
  return COUNT
}
/** The phase to name at a scrub position: a moment when close to it, otherwise the period the sky is in, with
 * Night for the evening's dark after late twilight. */
export function phaseAt(/** @type {number} */ position, /** @type {number} */ elevation) {
  const near = Math.round(position) % COUNT
  if (SOLAR_PHASES[near].kind === 'moment' && Math.abs(position - Math.round(position)) < 0.2) return SOLAR_PHASES[near]
  if (elevation < -18 && position > COUNT / 2) return SOLAR_PHASES[1]
  const i = Math.floor(position + 1e-6) % COUNT
  return SOLAR_PHASES[i].kind === 'period' ? SOLAR_PHASES[i] : SOLAR_PHASES[(i + 1) % COUNT]
}
/** The angle of a phase from solar midnight. */
export const angleOf = (/** @type {number} */ index) => ANGLES[index]

/** Local clock minutes at an angle, from the day's real solar midnight, sunrise, noon and sunset. */
function clockAt(/** @type {number} */ angle, /** @type {any} */ times) {
  const marks = [
    times.solarMidnight,
    times.sunrise ?? times.solarNoon - 360,
    times.solarNoon,
    times.sunset ?? times.solarNoon + 360,
    times.solarMidnight + 1440
  ]
  for (let k = 1; k < marks.length; k++) if (marks[k] < marks[k - 1]) marks[k] += 1440
  const q = (wrap(angle) / TAU) * 4
  const k = Math.min(3, Math.floor(q))
  return (((marks[k] + (marks[k + 1] - marks[k]) * (q - k)) % 1440) + 1440) % 1440
}
const hhmm = (/** @type {number} */ m) =>
  `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(Math.round(m % 60) % 60).padStart(2, '0')}`

const SVG = 'http://www.w3.org/2000/svg'
const R = 112 // ring radius; the ring's view box is 300 × 300 round the centre, with room outside for the labels
const C = 150
const TRACK = { x0: 14, x1: 306 } // the track's ends in its 320-wide view box

const SOLAR_RING = [
  '#0c1433 0deg',
  '#1d2a5c 50deg',
  '#e7a07c 85deg',
  '#f5cf7c 100deg',
  '#9fd2f2 140deg',
  '#9fd2f2 220deg',
  '#f4b96a 260deg',
  '#c0607a 275deg',
  '#2b3270 310deg',
  '#0c1433 360deg'
]
const LUNAR_RING = ['#0b0f1e 0deg', '#3a4466 90deg', '#c9d2ea 180deg', '#3a4466 270deg', '#0b0f1e 360deg']

export class WbSunDial extends HTMLElement {
  #abort = new AbortController()
  /** Total angle turned, unbounded: whole turns are days (Solar) or lunations (Lunar). */
  #total = 0
  #mode = /** @type {'solar' | 'lunar'} */ ('solar')
  #view = /** @type {'dial' | 'track'} */ ('dial')
  #dragging = false
  #pointerAngle = 0
  /** The moon's age when the dial was opened; turning the solar dial moves it on a day per turn. */
  #baseAge = moonAge(new Date())
  #reduced = matchMedia('(prefers-reduced-motion: reduce)')

  connectedCallback() {
    this.innerHTML = this.#markup()
    const listen = { signal: this.#abort.signal }
    const ringSvg = /** @type {SVGSVGElement} */ (this.querySelector('[data-view-dial] svg'))
    const trackSvg = /** @type {SVGSVGElement} */ (this.querySelector('[data-view-track] svg.wb-sun-dial__track'))
    /** The angle under the pointer: round the ring's centre, or along the track from midnight. */
    const angleFrom = (/** @type {PointerEvent} */ e) => {
      if (this.#view === 'dial') {
        const box = ringSvg.getBoundingClientRect()
        // The ring's centre in the view box (-50 -12 400 324) is at 150, 150.
        const cx = box.left + ((C + 50) / 400) * box.width
        const cy = box.top + ((C + 12) / 324) * box.height
        return wrap(Math.atan2(-(e.clientX - cx), e.clientY - cy))
      }
      const box = trackSvg.getBoundingClientRect()
      const x = ((e.clientX - box.left) / box.width) * 320
      return Math.max(0, Math.min(1, (x - TRACK.x0) / (TRACK.x1 - TRACK.x0))) * TAU
    }
    const start = (/** @type {PointerEvent} */ e) => {
      const knob = /** @type {SVGElement} */ (this.querySelector(`[data-view-${this.#view}] [data-knob]`))
      this.#dragging = true
      knob.setPointerCapture(e.pointerId)
      knob.focus({ preventScroll: true })
      const a = angleFrom(e)
      // A press on the ring or track jumps there; a press on the knob carries on from where it is.
      if (!(/** @type {Element} */ (e.currentTarget).hasAttribute('data-knob'))) this.#moveTo(a)
      this.#pointerAngle = a
      this.#update(true)
      e.preventDefault()
    }
    const move = (/** @type {PointerEvent} */ e) => {
      if (!this.#dragging) return
      const a = angleFrom(e)
      if (this.#view === 'dial') {
        // The shortest way round from the last angle, so turning past midnight carries on into the next day.
        this.#total += Math.atan2(Math.sin(a - this.#pointerAngle), Math.cos(a - this.#pointerAngle))
      } else this.#moveTo(a, true)
      this.#pointerAngle = a
      this.#update(true)
    }
    const end = () => {
      if (!this.#dragging) return
      this.#dragging = false
      this.#settle()
    }
    for (const el of this.querySelectorAll('[data-knob], [data-hit]')) {
      el.addEventListener('pointerdown', start, listen)
      el.addEventListener('pointermove', move, listen)
      el.addEventListener('pointerup', end, listen)
      el.addEventListener('pointercancel', end, listen)
    }
    this.addEventListener(
      'keydown',
      (e) => {
        if (!(/** @type {Element} */ (e.target).hasAttribute?.('data-knob'))) return
        const solar = this.#mode === 'solar'
        const step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 4, PageDown: -4 }[e.key]
        if (step !== undefined) this.#step(step)
        else if (e.key === 'Home') this.#jump(0)
        else if (e.key === 'End')
          this.#jump(solar ? angleOf(SOLAR_PHASES.findIndex((p) => p.code === 'solar-noon')) : Math.PI)
        else return
        e.preventDefault()
      },
      listen
    )
    for (const button of this.querySelectorAll('[data-mode]'))
      button.addEventListener(
        'click',
        () => this.#setMode(/** @type {'solar' | 'lunar'} */ (button.getAttribute('data-mode'))),
        listen
      )
    for (const button of this.querySelectorAll('[data-view]'))
      button.addEventListener(
        'click',
        () => {
          this.#view = /** @type {'dial' | 'track'} */ (button.getAttribute('data-view'))
          this.#show()
        },
        listen
      )
    this.querySelector('[data-now]')?.addEventListener(
      'click',
      () => {
        this.#setMode('solar', false)
        this.#baseAge = moonAge(new Date())
        this.dispatchEvent(
          new CustomEvent('stoa-solar-preview', { bubbles: true, detail: { position: 0, phase: null, solar: null } })
        )
        if (stoaTheme.active) stoaTheme.set({ modePreference: 'solar', held: null })
        const solar = stoaTheme.state?.solar
        this.#total = solar ? wrap(turnOf(solar) - 1.5 * Math.PI) : 0
        this.#update(false)
      },
      listen
    )
    // Start where the engine is: the held phase, or the sun now.
    const solar = stoaTheme.state?.solar
    this.#total = solar ? wrap(turnOf(solar) - 1.5 * Math.PI) : 0
    this.#paint()
    this.#show()
  }
  disconnectedCallback() {
    this.#abort.abort()
    this.#abort = new AbortController()
  }

  /** Switch between turning through the day and through the month, keeping the moon where it was. */
  #setMode(/** @type {'solar' | 'lunar'} */ mode, settle = true) {
    if (mode === this.#mode) return
    const age = this.#age()
    this.#mode = mode
    if (mode === 'lunar') this.#total = lunarState(age).cycle * TAU
    else {
      this.#baseAge = age
      const solar = stoaTheme.state?.solar
      this.#total = solar ? wrap(turnOf(solar) - 1.5 * Math.PI) : 0
    }
    for (const b of this.querySelectorAll('[data-mode]'))
      b.setAttribute('aria-pressed', String(b.getAttribute('data-mode') === mode))
    this.#paint()
    this.#update(true)
    if (settle) this.#settle()
  }
  /** Show the ring or the track; the sky moves to whichever is shown. */
  #show() {
    for (const b of this.querySelectorAll('[data-view]'))
      b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === this.#view))
    for (const v of ['dial', 'track']) {
      const view = /** @type {HTMLElement} */ (this.querySelector(`[data-view-${v}]`))
      view.hidden = v !== this.#view
    }
    const sky = /** @type {SVGElement} */ (this.querySelector('[data-skygroup]'))
    const home = /** @type {SVGElement} */ (
      this.querySelector(this.#view === 'dial' ? '[data-sky-in-dial]' : '[data-sky-in-track]')
    )
    home.append(sky)
    this.#update(false)
  }
  /** Move to an angle within the current turn (the track has ends: it does not carry into the next turn). */
  #moveTo(/** @type {number} */ angle, clamp = false) {
    const turn = Math.floor(this.#total / TAU)
    if (clamp) this.#total = turn * TAU + Math.min(TAU - 1e-6, angle)
    else this.#total += Math.atan2(Math.sin(angle - wrap(this.#total)), Math.cos(angle - wrap(this.#total)))
  }

  #age() {
    return this.#mode === 'lunar' ? (this.#total / TAU) * SYNODIC : this.#baseAge + Math.floor(this.#total / TAU)
  }
  /** Step by solar phases or lunar sixteenths, wrapping on round. */
  #step(/** @type {number} */ n) {
    if (this.#mode === 'lunar') {
      const stop = TAU / LUNAR_STOPS
      this.#total = (Math.round(this.#total / stop) + n) * stop
    } else {
      const turn = Math.floor(this.#total / TAU)
      const now = Math.round(positionAt(this.#total)) % COUNT
      let next = now + n
      const turns = Math.floor(next / COUNT)
      next = ((next % COUNT) + COUNT) % COUNT
      this.#total = (turn + turns) * TAU + angleOf(next)
    }
    this.#update(true)
    this.#settle()
  }
  #jump(/** @type {number} */ angle) {
    this.#total = Math.floor(this.#total / TAU) * TAU + angle
    this.#update(true)
    this.#settle()
  }
  /** Let go: Solar holds the nearest phase, as the straight dial does; Lunar snaps to the nearest sixteenth and
   * keeps the moonlight it shows. */
  #settle() {
    if (this.#mode === 'solar') {
      const index = Math.round(positionAt(this.#total)) % COUNT
      const turn = Math.floor(this.#total / TAU)
      this.#total = turn * TAU + angleOf(index)
      this.dispatchEvent(
        new CustomEvent('stoa-solar-preview', { bubbles: true, detail: { position: index, phase: null, solar: null } })
      )
      if (stoaTheme.active) stoaTheme.set({ modePreference: 'solar', held: SOLAR_PHASES[index].code })
      this.#update(false)
    } else {
      const stop = TAU / LUNAR_STOPS
      this.#total = Math.round(this.#total / stop) * stop
      this.#update(true)
    }
  }

  /** Redraw the knob and sky, announce the value and, while turning, preview the page. */
  #update(/** @type {boolean} */ preview) {
    const solarMode = this.#mode === 'solar'
    const a = wrap(this.#total)
    for (const knob of this.querySelectorAll('[data-knob]')) {
      if (knob.closest('[data-view-dial]')) knob.setAttribute('transform', `rotate(${(a * 180) / Math.PI} ${C} ${C})`)
      else knob.setAttribute('transform', `translate(${(TRACK.x0 + (a / TAU) * (TRACK.x1 - TRACK.x0)).toFixed(2)} 0)`)
    }
    const moon = lunarState(this.#age())
    const position = solarMode ? positionAt(a) : 0
    const solar = solarScrub(position, stoaTheme.system?.solar?.sky)
    const phase = solarMode ? phaseAt(position, solar.elevation) : null
    const times = solarState(new Date()).times
    const offset = Math.floor(this.#total / TAU)
    const when =
      !solarMode || offset === 0
        ? ''
        : offset === 1
          ? 'Tomorrow'
          : offset === -1
            ? 'Yesterday'
            : offset > 0
              ? `In ${offset} days`
              : `${-offset} days ago`
    const moonUp = this.#drawSky(solar, moon, solarMode)
    const lit = `${Math.round(moon.illumination * 100)}% lit`
    const moonWords = `${lit}, ${moon.waxing ? 'waxing' : 'waning'}`
    const title = this.querySelector('[data-title]')
    const detail = this.querySelector('[data-detail]')
    if (title) title.textContent = solarMode ? (phase?.label ?? '') : moon.phase.label
    if (detail)
      detail.textContent = solarMode
        ? `${hhmm(clockAt(a, times))}${when ? ` · ${when}` : ''} · ${solar.elevation >= 0 ? `sun ${Math.round(solar.elevation)}° up` : `moon ${moonWords}`}`
        : `${moonWords} · day ${Math.round(moon.age)} of 29½`
    for (const knob of this.querySelectorAll('[data-knob]')) {
      knob.setAttribute(
        'aria-valuetext',
        solarMode
          ? `${phase?.label}, about ${hhmm(clockAt(a, times))}${when ? `, ${when.toLowerCase()}` : ''}`
          : `${moon.phase.label}, ${moonWords}, day ${Math.round(moon.age)}`
      )
      knob.setAttribute('aria-valuenow', solarMode ? String(Math.round(clockAt(a, times))) : moon.age.toFixed(1))
      knob.setAttribute('aria-valuemax', solarMode ? '1440' : '29.5')
      knob.setAttribute('aria-label', solarMode ? 'Time of day' : 'Day of the lunar month')
    }
    // The page follows: the engine previews the moment, and the moon's light rides along for the night theme.
    const root = document.documentElement
    root.setAttribute('data-moon-phase', moon.phase.code)
    root.style.setProperty('--moon-illumination', moon.illumination.toFixed(3))
    // Moonlight needs the moon up: a full moon below the horizon lights nothing.
    root.style.setProperty('--moon-up', moonUp.toFixed(3))
    if (preview)
      this.dispatchEvent(
        new CustomEvent('stoa-solar-preview', {
          bubbles: true,
          detail: { position, phase: phase?.code ?? 'solar-midnight', solar: solarMode ? solar : solarScrub(0) }
        })
      )
    this.toggleAttribute('data-turning', this.#dragging && !this.#reduced.matches)
  }

  #drawSky(/** @type {any} */ solar, /** @type {any} */ moon, /** @type {boolean} */ solarMode) {
    const sky = /** @type {SVGElement} */ (this.querySelector('[data-sky]'))
    const e = solar.elevation
    const t = Math.max(0, Math.min(1, (e + 12) / 24))
    const mix = (/** @type {number[]} */ a, /** @type {number[]} */ b, /** @type {number} */ k) =>
      a.map((v, i) => Math.round(v + (b[i] - v) * k))
    const col = mix(mix([12, 20, 46], [126, 184, 230], t), [232, 150, 120], Math.max(0, 1 - Math.abs(e) / 8) * 0.7)
    const c = mix(col, [150, 170, 210], solar.daylight ? 0 : moon.illumination * (solarMode ? 0.1 : 0.18))
    sky.setAttribute('fill', `rgb(${c.join(' ')})`)
    // The lake takes the sky's colour, darker and a little bluer.
    const water = /** @type {SVGElement} */ (this.querySelector('[data-water]'))
    water.setAttribute('fill', `rgb(${mix(c, [10, 24, 44], 0.45).join(' ')})`)
    // Bodies on an inner arc, seen facing south: east on the left, so the sun rises on the same side as the dial's
    // Sunrise and sets by Sunset; above the line means above the horizon. The
    // moon trails the sun by its age, so a waxing moon is up in the evening and a waning one in the morning.
    const r = 52
    const sunTurn = solarMode ? turnOf(solar) : 1.5 * Math.PI
    const place = (/** @type {number} */ turn) => [C - r * Math.cos(turn), C - 4 - r * Math.sin(turn) * 0.8]
    const [sx, sy] = place(sunTurn)
    const sun = /** @type {SVGElement} */ (this.querySelector('[data-sun]'))
    sun.setAttribute('cx', String(sx))
    sun.setAttribute('cy', String(sy))
    sun.setAttribute('opacity', solar.elevation > -2 ? '1' : '0')
    const moonTurn = solarMode ? wrap(sunTurn - moon.cycle * TAU) : 0.5 * Math.PI
    const [mx, my] = place(moonTurn)
    const up = Math.sin(moonTurn) > -0.05
    const disc = /** @type {SVGElement} */ (this.querySelector('[data-moon]'))
    disc.setAttribute('transform', `translate(${mx} ${my}) scale(${solarMode ? 1 : 2.4})`)
    disc.setAttribute('opacity', up ? (solar.daylight ? '0.45' : '1') : '0')
    // Reflections: each body above the horizon is mirrored in the lake below it, stretched and broken by ripples.
    const horizon = C + 2
    const reflect = (
      /** @type {string} */ name,
      /** @type {number} */ x,
      /** @type {number} */ y,
      /** @type {number} */ strength
    ) => {
      const el = /** @type {SVGElement} */ (this.querySelector(`[data-reflection-${name}]`))
      el.setAttribute('transform', `translate(${x.toFixed(1)} ${(horizon + (horizon - y) * 0.7).toFixed(1)})`)
      el.setAttribute('opacity', strength.toFixed(2))
    }
    reflect('sun', sx, sy, solar.elevation > -2 ? 0.55 : 0)
    reflect('moon', mx, my, up ? (solar.daylight ? 0.15 : 0.25 + moon.illumination * 0.5) : 0)
    // The lit part: a terminator ellipse whose width follows the phase; waxing is lit on the right.
    const k = Math.cos(moon.cycle * TAU)
    const right = moon.waxing
    const lit = /** @type {SVGElement} */ (this.querySelector('[data-moon-lit]'))
    lit.setAttribute(
      'd',
      `M0 -7 A7 7 0 0 ${right ? 1 : 0} 0 7 A${(Math.abs(k) * 7).toFixed(2)} 7 0 0 ${k > 0 === right ? 0 : 1} 0 -7 Z`
    )
    const stars = /** @type {SVGElement} */ (this.querySelector('[data-stars]'))
    stars.setAttribute('opacity', String(Math.max(0, Math.min(1, (-e - 6) / 10)) * (1 - moon.illumination * 0.6)))
    return solarMode ? Math.max(0, Math.min(1, Math.sin(moonTurn) * 4)) : 1
  }

  /** Ticks and labels for the mode, on the ring and the track alike, from one list of angles. */
  #paint() {
    const solarMode = this.#mode === 'solar'
    const stops = solarMode ? SOLAR_RING : LUNAR_RING
    const ring = /** @type {HTMLElement} */ (this.querySelector('.wb-sun-dial__ring'))
    ring.style.setProperty('--wb-dial-ring', `conic-gradient(from 180deg, ${stops.join(', ')})`)
    const grad = /** @type {SVGElement} */ (this.querySelector('[data-track-gradient]'))
    grad.replaceChildren(
      ...stops.map((s) => {
        const [colour, deg] = s.split(' ')
        const stop = document.createElementNS(SVG, 'stop')
        stop.setAttribute('offset', String(Number.parseFloat(deg) / 360))
        stop.setAttribute('stop-color', colour)
        return stop
      })
    )
    /** @type {[number, 0 | 1 | 2][]} angle and weight: 2 a named moment, 1 a period, 0 a stop between */
    const marks = solarMode
      ? SOLAR_PHASES.map((p, i) => [angleOf(i), p.kind === 'moment' ? 2 : 1])
      : Array.from({ length: LUNAR_STOPS }, (_, i) => [(i / LUNAR_STOPS) * TAU, i % 4 === 0 ? 2 : i % 2 === 0 ? 1 : 0])
    const line = (/** @type {number[]} */ [x1, y1, x2, y2], /** @type {number} */ w) => {
      const el = document.createElementNS(SVG, 'line')
      for (const [k, v] of Object.entries({ x1, y1, x2, y2 })) el.setAttribute(k, v.toFixed(2))
      el.setAttribute('class', `wb-sun-dial__tick wb-sun-dial__tick--${['minor', 'mid', 'major'][w]}`)
      return el
    }
    const ringTicks = /** @type {SVGElement} */ (this.querySelector('[data-ticks]'))
    ringTicks.replaceChildren(
      ...marks.map(([a, w]) => {
        const len = [3, 5, 8][w]
        return line(
          [
            C - (R + 15) * Math.sin(a),
            C + (R + 15) * Math.cos(a),
            C - (R + 15 + len) * Math.sin(a),
            C + (R + 15 + len) * Math.cos(a)
          ],
          w
        )
      })
    )
    const tx = (/** @type {number} */ a) => TRACK.x0 + (a / TAU) * (TRACK.x1 - TRACK.x0)
    const trackTicks = /** @type {SVGElement} */ (this.querySelector('[data-track-ticks]'))
    trackTicks.replaceChildren(...[...marks, [TAU, 2]].map(([a, w]) => line([tx(a), 34, tx(a), 34 + [3, 5, 8][w]], w)))
    const labels = solarMode
      ? [
          ['Midnight', 0],
          ['Sunrise', Math.PI / 2],
          ['Noon', Math.PI],
          ['Sunset', 1.5 * Math.PI]
        ]
      : [
          ['New', 0],
          ['First quarter', Math.PI / 2],
          ['Full', Math.PI],
          ['Last quarter', 1.5 * Math.PI]
        ]
    for (const [i, el] of this.querySelectorAll('[data-label]').entries()) {
      const [text, a] = /** @type {[string, number]} */ (labels[i])
      const s = Math.sin(a)
      el.textContent = text
      el.setAttribute('x', String(C - (R + 30) * s))
      el.setAttribute('y', String(C + (R + 32) * Math.cos(a) + 4))
      el.setAttribute('text-anchor', s > 0.5 ? 'end' : s < -0.5 ? 'start' : 'middle')
    }
    const trackLabels = [...labels, [labels[0][0], TAU]]
    for (const [i, el] of this.querySelectorAll('[data-track-label]').entries()) {
      const [text, a] = /** @type {[string, number]} */ (trackLabels[i])
      el.textContent = text
      el.setAttribute('x', String(tx(a)))
      el.setAttribute('text-anchor', i === 0 ? 'start' : i === 4 ? 'end' : 'middle')
    }
  }

  #markup() {
    const stars = Array.from(
      { length: 18 },
      (_, i) => `<circle cx="${C - 60 + ((i * 37) % 120)}" cy="${C - 58 + ((i * 53) % 54)}" r="${i % 4 ? 0.7 : 1.1}"/>`
    ).join('')
    const knob = (/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ r) =>
      `<g data-knob tabindex="0" role="slider" aria-valuemin="0" aria-valuemax="1440" class="wb-sun-dial__knob"><circle cx="${cx}" cy="${cy}" r="${r}"/><circle cx="${cx}" cy="${cy}" r="${r * 0.3}" class="wb-sun-dial__knob-dot"/></g>`
    return `<div class="wb-sun-dial__bar">
  <div class="wb-sun-dial__modes" role="group" aria-label="Turn through"><button type="button" data-mode="solar" aria-pressed="true">Solar</button><button type="button" data-mode="lunar" aria-pressed="false">Lunar</button></div>
  <div class="wb-sun-dial__modes" role="group" aria-label="Show as"><button type="button" data-view="dial" aria-pressed="true">Dial</button><button type="button" data-view="track" aria-pressed="false">Track</button></div>
  <button type="button" class="wb-sun-dial__now" data-now>Now</button>
</div>
<svg width="0" height="0" aria-hidden="true" style="position:absolute"><defs><clipPath id="wb-sun-dial-sky"><circle cx="${C}" cy="${C}" r="78"/></clipPath><linearGradient id="wb-sun-dial-track" data-track-gradient></linearGradient></defs></svg>
<div data-view-dial>
  <svg class="wb-sun-dial__svg" viewBox="-50 -12 400 324" role="presentation">
    <foreignObject x="${C - R - 12}" y="${C - R - 12}" width="${2 * R + 24}" height="${2 * R + 24}" data-hit class="wb-sun-dial__ring-hit"><div class="wb-sun-dial__ring"></div></foreignObject>
    <g data-ticks></g>
    ${'<text class="wb-sun-dial__label" text-anchor="middle" data-label></text>'.repeat(4)}
    <g data-sky-in-dial><g data-skygroup>
      <g clip-path="url(#wb-sun-dial-sky)">
        <rect x="${C - 80}" y="${C - 80}" width="160" height="160" data-sky/>
        <g class="wb-sun-dial__stars" data-stars>${stars}</g>
        <circle r="8" class="wb-sun-dial__sun" data-sun/>
        <g data-moon><circle r="7" class="wb-sun-dial__moon-dark"/><path class="wb-sun-dial__moon-lit" data-moon-lit/></g>
        <rect x="${C - 80}" y="${C + 2}" width="160" height="80" data-water/>
        <g class="wb-sun-dial__reflection wb-sun-dial__reflection--sun" data-reflection-sun><ellipse rx="7" ry="3"/><rect x="-9" y="5" width="18" height="1.5"/><rect x="-6" y="10" width="12" height="1.2"/><rect x="-4" y="15" width="8" height="1"/></g>
        <g class="wb-sun-dial__reflection wb-sun-dial__reflection--moon" data-reflection-moon><ellipse rx="6" ry="2.5"/><rect x="-7" y="5" width="14" height="1.4"/><rect x="-5" y="10" width="10" height="1.1"/><rect x="-3" y="15" width="6" height="1"/></g>
        <path d="M${C - 80} ${C + 2} h160" class="wb-sun-dial__shore"/>
      </g>
      <circle cx="${C}" cy="${C}" r="78" class="wb-sun-dial__rim"/>
    </g></g>
    ${knob(C, C + R, 14)}
  </svg>
</div>
<div data-view-track hidden class="wb-sun-dial__trackview">
  <svg class="wb-sun-dial__skybox" viewBox="${C - 80} ${C - 80} 160 160" role="presentation"><g data-sky-in-track></g></svg>
  <svg class="wb-sun-dial__track" viewBox="0 0 320 64" role="presentation">
    <rect x="${TRACK.x0}" y="20" width="${TRACK.x1 - TRACK.x0}" height="10" rx="5" fill="url(#wb-sun-dial-track)" data-hit class="wb-sun-dial__ring-hit"/>
    <g data-track-ticks></g>
    ${'<text class="wb-sun-dial__label" y="58" data-track-label></text>'.repeat(5)}
    ${knob(0, 25, 10)}
  </svg>
</div>
<p class="wb-sun-dial__readout" aria-hidden="true"><strong data-title></strong><span data-detail></span></p>`
  }
}

export function defineWbSunDial() {
  if (!customElements.get('wb-sun-dial')) customElements.define('wb-sun-dial', WbSunDial)
}
