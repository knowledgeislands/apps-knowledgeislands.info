// @ts-check
import { msToMidnight, zonedToday } from './core.js'
import { renderTodayBoardContent } from './render.js'

const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

/** Keeps the build's light DOM correct across midnight, focus and back/forward restores. */
export class StoaTodayBoard extends Base {
  /** @type {AbortController | undefined} */
  #abort
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #timer
  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    this.#abort = new AbortController()
    const { signal } = this.#abort
    const redraw = () => this.refresh()
    this.ownerDocument.addEventListener(
      'visibilitychange',
      () => {
        if (this.ownerDocument.visibilityState === 'visible') redraw()
      },
      { signal }
    )
    this.ownerDocument.defaultView?.addEventListener('pageshow', redraw, { signal })
    this.ownerDocument.defaultView?.addEventListener('focus', redraw, { signal })
    this.refresh()
  }
  disconnectedCallback() {
    this.#abort?.abort()
    this.#abort = undefined
    clearTimeout(this.#timer)
  }
  /** Redraw for an instant; `today` attribute fixes the displayed day for previews. @param {Date} [now] */
  refresh(now = new Date()) {
    clearTimeout(this.#timer)
    const source = this.querySelector('script[data-today-board-data]')
    const content = this.querySelector('[data-today-board-content]')
    if (!source?.textContent || !content) return
    /** @type {{set: import('../calendar/types.js').StoaCalendarSet, options: import('./render.js').TodayBoardOptions}} */
    const { set, options } = JSON.parse(source.textContent)
    const today = this.getAttribute('today') ?? zonedToday(now, set.timeZone)
    content.innerHTML = renderTodayBoardContent(set, { ...options, today })
    if (this.isConnected) this.#timer = setTimeout(() => this.refresh(), msToMidnight(now, set.timeZone) + 1000)
  }
}
/** @param {string} [name] */
export function defineStoaTodayBoard(name = 'stoa-today-board') {
  if (!customElements.get(name)) customElements.define(name, StoaTodayBoard)
}
