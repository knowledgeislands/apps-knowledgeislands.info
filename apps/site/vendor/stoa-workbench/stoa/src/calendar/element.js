// @ts-check
// <stoa-calendar>: upgrades the markup ./render.js writes. Inside any
// <stoa-calendar> it marks dates past by the reader's own date, so a page
// built days ago never shows a passed date as ahead, and wires the feed URL
// copy buttons. Around a calendars view it adds the calendar toggles,
// remembered in this browser, the collapsible panel, and the Months and
// Runway views drawn from the view's JSON. The markup is complete without it.
//
// Attributes: `today` (YYYY-MM-DD) fixes the date, for the workbench or a test;
// `storage-key` names the remembered choices (default `calendars`).
// Events: `stoa-calendar-select` when a date's details open, with
// `detail.entries`, the view entries shown.

import { esc } from '../internal/html.js'
import { renderCalendarView } from './render.js'

/** @typedef {import('./view.js').ViewData} ViewData */
/** @typedef {import('./view.js').ViewEntry} ViewEntry */
/** @typedef {import('./render.js').RenderContext} RenderContext */
/** @typedef {import('./render.js').ViewChrome} ViewChrome */

const pad = (/** @type {number} */ n) => String(n).padStart(2, '0')

/** The reader's own date, `YYYY-MM-DD`. */
export function readerToday() {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

/**
 * Marks each `[data-calendar-last]` past or not by `today`.
 * @param {ParentNode} root
 * @param {string} today
 */
export function markPast(root, today) {
  for (const entry of root.querySelectorAll('[data-calendar-last]')) {
    entry.classList.toggle('is-past', /** @type {string} */ (entry.getAttribute('data-calendar-last')) < today)
  }
}

/**
 * A list of the next few dates, `[data-calendar-upcoming="<limit>"]`: a passed
 * date drops out and the next one moves up, and every
 * `[data-calendar-next-of="<list id>"]` in the document follows, showing the
 * first date's `data-next-<field>` for its `data-calendar-next-field`.
 * @param {ParentNode} root
 * @param {string} today
 */
export function applyUpcoming(root, today) {
  for (const list of root.querySelectorAll('[data-calendar-upcoming]')) {
    const limit = Number(list.getAttribute('data-calendar-upcoming'))
    const ahead = [...list.children].filter(
      (item) => /** @type {string} */ (item.getAttribute('data-calendar-last')) >= today
    )
    for (const item of list.children) {
      const at = ahead.indexOf(item)
      const el = /** @type {HTMLElement} */ (item)
      el.hidden = at < 0 || at >= limit
    }
    for (const target of document.querySelectorAll(`[data-calendar-next-of="${CSS.escape(list.id)}"]`)) {
      const field = target.getAttribute('data-calendar-next-field')
      if (ahead[0]) target.textContent = ahead[0].getAttribute(`data-next-${field}`)
      else target.textContent = field === 'value' ? 'None' : 'No date ahead in the calendar'
    }
  }
}

/**
 * Copies an input's value, falling back to selecting it, and says so on the
 * button for two seconds.
 * @param {HTMLInputElement} input
 * @param {Element} button
 * @param {AbortSignal} [signal]
 */
async function copyValue(input, button, signal) {
  const label = button.querySelector('[data-copy-label]')
  try {
    await navigator.clipboard.writeText(input.value)
  } catch {
    input.select()
    document.execCommand('copy')
  }
  if (label && !signal?.aborted) {
    label.textContent = 'Copied'
    const timer = setTimeout(() => {
      label.textContent = 'Copy'
    }, 2000)
    signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        label.textContent = 'Copy'
      },
      { once: true }
    )
  }
}

/**
 * Wires each `[data-copy-from="<input id>"]` button under `root`.
 * @param {ParentNode} root
 * @param {AbortSignal} [signal]
 */
export function wireCopyButtons(root, signal) {
  for (const button of root.querySelectorAll('[data-copy-from]')) {
    button.addEventListener(
      'click',
      () => {
        const input = document.getElementById(/** @type {string} */ (button.getAttribute('data-copy-from')))
        if (input instanceof HTMLInputElement) copyValue(input, button, signal)
      },
      { signal }
    )
  }
}

/**
 * The past marks, upcoming lists and copy buttons, for a page that shows
 * calendar markup outside any <stoa-calendar>.
 * @param {ParentNode} [root]
 * @param {string} [today]
 */
export function enhanceCalendarMarks(root = document, today = readerToday()) {
  markPast(root, today)
  applyUpcoming(root, today)
  wireCopyButtons(root)
}

/** A convenience only; the view works without it. */
const store = {
  /** @param {string} key */
  get(key) {
    try {
      return localStorage.getItem(key)
    } catch {
      return null
    }
  },
  /** @param {string} key @param {string} value */
  set(key, value) {
    try {
      localStorage.setItem(key, value)
    } catch {
      /* Storage unavailable: the choice lasts for this visit only. */
    }
  }
}

const VIEWS = ['months', 'runway', 'list']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
]
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const day = (/** @type {string} */ k) => new Date(`${k}T00:00:00Z`)
const iso = (/** @type {Date} */ d) => d.toISOString().slice(0, 10)
const addDays = (/** @type {string} */ k, /** @type {number} */ n) => {
  const d = day(k)
  d.setUTCDate(d.getUTCDate() + n)
  return iso(d)
}
const daysBetween = (/** @type {string} */ a, /** @type {string} */ b) => Math.round((+day(b) - +day(a)) / 864e5)
const addMonths = (/** @type {string} */ ym, /** @type {number} */ n) => {
  const [y, m] = ym.split('-').map(Number)
  const t = y * 12 + (m - 1) + n
  return `${Math.floor(t / 12)}-${pad((t % 12) + 1)}`
}
const monthName = (/** @type {string} */ ym) => MONTHS[Number(ym.slice(5, 7)) - 1]
const longDate = (/** @type {string} */ k) => {
  const d = day(k)
  return `${WEEKDAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}
/** @param {ViewEntry} e */
const whenLong = (e) => {
  if (e.precision === 'year') return `${e.first.slice(0, 4)} · the source gives the year only`
  if (e.precision === 'month')
    return `${monthName(e.first)} ${e.first.slice(0, 4)} · the source gives the month, not the day`
  if (e.first === e.last) return e.time ? `${longDate(e.first)} · ${e.time}` : longDate(e.first)
  const n = daysBetween(e.first, e.last) + 1
  const a = day(e.first)
  const b = day(e.last)
  const from =
    a.getUTCMonth() === b.getUTCMonth() && a.getUTCFullYear() === b.getUTCFullYear()
      ? `${WEEKDAYS[a.getUTCDay()]} ${a.getUTCDate()}`
      : longDate(e.first)
  return `${from} – ${longDate(e.last)} · ${n} days`
}

/**
 * The calendars view's behaviour, scoped to one view.
 * @param {StoaCalendar} host
 * @param {HTMLElement} page
 * @param {ViewData} data
 * @param {string} today
 * @param {AbortSignal} signal
 * @param {string} storageKey
 * @returns {HTMLElement} The detail popover, which lives on the body so it can sit over anything.
 */
function startView(host, page, data, today, signal, storageKey) {
  const listen = { signal }
  const calendars = new Map(data.calendars.map((c) => [c.id, c]))
  const order = data.calendars.map((c) => c.id)
  const entries = data.entries
    .slice()
    .sort((a, b) => a.first.localeCompare(b.first) || order.indexOf(a.calendar) - order.indexOf(b.calendar))
  const byId = new Map(entries.map((e) => [e.id, e]))
  const HIDDEN_KEY = `${storageKey}.hidden`
  const VIEW_KEY = `${storageKey}.view`
  const PANEL_KEY = `${storageKey}.panel`

  const cal = (/** @type {string} */ id) => /** @type {ViewData['calendars'][number]} */ (calendars.get(id))
  const slot = (/** @type {string} */ id) => `cal-slot-${cal(id).colour}`
  const firm = (/** @type {ViewEntry} */ e) => e.status === 'confirmed'
  const isPast = (/** @type {ViewEntry} */ e) => e.last < today
  const icons = () => StoaCalendar.icons(host)
  const statusBadge = (/** @type {ViewEntry} */ e) =>
    `<span class="calendar-status calendar-status--${esc(e.status)}">${esc(e.statusLabel)}</span>`
  /** @template {Element} T @param {string} sel @returns {T} */
  const one = (sel) => /** @type {T} */ (page.querySelector(sel))

  // ── State ──
  /** @type {Set<string>} */
  let hidden = new Set()
  try {
    const stored = JSON.parse(store.get(HIDDEN_KEY) || '[]')
    if (Array.isArray(stored)) hidden = new Set(stored.filter((id) => calendars.has(id)))
  } catch {
    /* A damaged value: start with every calendar shown. */
  }
  const narrow = window.matchMedia('(max-width: 768px)')
  const phone = window.matchMedia('(max-width: 640px)')
  const storedView = store.get(VIEW_KEY)
  let view = storedView && VIEWS.includes(storedView) ? storedView : narrow.matches ? 'list' : 'months'
  let start = today.slice(0, 7)
  const visible = () => entries.filter((e) => !hidden.has(e.calendar))
  const monthCount = () => (narrow.matches ? 1 : 3)

  // ── Elements ──
  /** @type {HTMLElement} */
  const toolbar = one('[data-cal-toolbar]')
  /** @type {HTMLElement} */
  const nav = one('[data-cal-nav]')
  /** @type {HTMLElement} */
  const range = one('[data-cal-range]')
  /** @type {HTMLElement} */
  const hiddenNote = one('[data-cal-hidden-note]')
  /** @type {HTMLElement} */
  const legend = one('[data-cal-legend]')
  /** @type {HTMLElement[]} */
  const tabs = [...page.querySelectorAll('[data-cal-tab]')].map((t) => /** @type {HTMLElement} */ (t))
  /** @type {Record<string, HTMLElement>} */
  const panels = Object.fromEntries(
    [...page.querySelectorAll('[data-cal-view]')].map((el) => [/** @type {HTMLElement} */ (el).dataset.calView, el])
  )
  /** @type {HTMLElement} */
  const pop = one('[data-cal-pop]')
  document.body.appendChild(pop)
  /** @type {HTMLElement | null} */
  let popAnchor = null

  // ── Months ──
  /** @param {ViewEntry} e @param {string} note */
  function floatButton(e, note) {
    const c = cal(e.calendar)
    return `<button type="button" class="cal-float ${slot(e.calendar)}${isPast(e) ? ' is-past' : ''}" data-cal-entries="${esc(e.id)}" aria-haspopup="dialog" aria-expanded="false">
      <span class="cal-code ${slot(e.calendar)}" aria-hidden="true">${esc(c.code)}</span>${esc(e.title)}<span class="visually-hidden">, ${esc(c.title)}, ${esc(e.statusLabel)}</span>
      <span class="cal-float__tbc">${note}</span></button>`
  }

  /** @param {ViewEntry[]} list */
  function yearBands(list) {
    const years = [...new Set(list.map((e) => e.first.slice(0, 4)))].sort()
    return years
      .map(
        (y) => `<div class="cal-yearband" role="group" aria-label="${y}, month not fixed">
          <span class="cal-yearband__year">${y}</span><span class="cal-yearband__note">Month not fixed</span>
          ${list
            .filter((e) => e.first.startsWith(y))
            .map((e) => floatButton(e, 'Year only'))
            .join('')}
        </div>`
      )
      .join('')
  }

  /** @param {string} ym @param {ViewEntry[]} list */
  function monthHtml(ym, list) {
    const [y, m] = ym.split('-').map(Number)
    const lead = (new Date(Date.UTC(y, m - 1, 1)).getUTCDay() + 6) % 7
    const count = new Date(Date.UTC(y, m, 0)).getUTCDate()
    const dated = list.filter((e) => e.precision === 'day' && e.first.slice(0, 7) <= ym && e.last.slice(0, 7) >= ym)
    const floats = list.filter((e) => e.precision === 'month' && e.first.slice(0, 7) === ym)
    const total = dated.length + floats.length
    let cells = ''
    for (let i = 0; i < lead; i++) cells += '<span class="cal-day cal-day--blank" aria-hidden="true"></span>'
    for (let d = 1; d <= count; d++) {
      const k = `${ym}-${pad(d)}`
      const dow = (lead + d - 1) % 7
      const hits = dated.filter((e) => e.first <= k && e.last >= k)
      let cls = 'cal-day'
      if (k === today) cls += ' is-today'
      if (k < today) cls += ' is-past'
      if (!hits.length) {
        cells += `<span class="${cls}" aria-hidden="true"><span class="cal-day__num">${d}</span></span>`
        continue
      }
      const marks = hits
        .map((e) => {
          const contL = k > e.first && dow > 0
          const contR = k < e.last && dow < 6
          return `<span class="cal-mark ${slot(e.calendar)}${firm(e) ? '' : ' is-prov'}${isPast(e) ? ' is-past' : ''}${contL ? ' cont-l' : ''}${contR ? ' cont-r' : ''}"></span>`
        })
        .join('')
      const label = `${longDate(k)}: ${hits.map((e) => `${e.title}, ${cal(e.calendar).title}, ${e.statusLabel}`).join('; ')}`
      cells += `<button type="button" class="${cls} has-dates ${slot(hits[0].calendar)}" data-cal-entries="${hits
        .map((e) => esc(e.id))
        .join(
          ','
        )}" aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(label)}"${k === today ? ' aria-current="date"' : ''}>
        <span class="cal-day__num" aria-hidden="true">${d}</span><span class="cal-day__marks" aria-hidden="true">${marks}</span></button>`
    }
    const trailing = (7 - ((lead + count) % 7)) % 7
    for (let i = 0; i < trailing; i++) cells += '<span class="cal-day cal-day--blank" aria-hidden="true"></span>'
    return `<section class="cal-month" aria-label="${monthName(ym)} ${y}">
      <div class="cal-month__head">
        <h3 class="cal-month__name">${monthName(ym)} <span>${y}</span></h3>
        <span class="cal-month__count">${total ? `${total} date${total === 1 ? '' : 's'}` : 'Nothing scheduled'}</span>
      </div>
      <div class="cal-month__floats">${floats.map((e) => floatButton(e, 'Day TBC')).join('')}</div>
      <div class="cal-dow" aria-hidden="true"><abbr title="Monday">Mon</abbr><abbr title="Tuesday">Tue</abbr><abbr title="Wednesday">Wed</abbr><abbr title="Thursday">Thu</abbr><abbr title="Friday">Fri</abbr><abbr title="Saturday">Sat</abbr><abbr title="Sunday">Sun</abbr></div>
      <div class="cal-days">${cells}</div>
    </section>`
  }

  function renderMonths() {
    const n = monthCount()
    const keys = Array.from({ length: n }, (_, i) => addMonths(start, i))
    const list = visible()
    const years = new Set(keys.map((k) => k.slice(0, 4)))
    const yearOnly = list.filter((e) => e.precision === 'year' && years.has(e.first.slice(0, 4)))
    panels.months.innerHTML = `${yearBands(yearOnly)}
      <div class="cal-months" style="--cal-month-count: ${n}">${keys.map((k) => monthHtml(k, list)).join('')}</div>
      ${list.length ? '' : '<p class="cal-note">Every calendar is hidden. Turn one on in the panel to see its dates.</p>'}`
  }

  // ── Runway ──
  function renderRunway() {
    const keys = [0, 1, 2].map((i) => addMonths(start, i))
    const rs = `${keys[0]}-01`
    const re = `${addMonths(keys[2], 1)}-01`
    const span = daysBetween(rs, re)
    const pc = (/** @type {string} */ k) => Math.max(0, Math.min(100, (daysBetween(rs, k) / span) * 100))
    const inRange = (/** @type {ViewEntry} */ e) => e.last >= rs && e.first < re
    const width = Math.max(460, (panels.runway.clientWidth || 900) - 250 - 18)

    let scale = keys
      .map(
        (k) =>
          `<span class="cal-runway__month" style="left: ${pc(`${k}-01`).toFixed(3)}%">${monthName(k)}${k === keys[0] || k.endsWith('-01') ? ` ${k.slice(0, 4)}` : ''}</span>`
      )
      .join('')
    for (let i = 0; i < span; i++) {
      const k = addDays(rs, i)
      if (day(k).getUTCDay() === 1)
        scale += `<span class="cal-runway__tick" style="left: ${pc(k).toFixed(3)}%">${day(k).getUTCDate()}</span>`
    }
    const todayIn = today >= rs && today < re
    const todayAt = ((daysBetween(rs, today) + 0.5) / span) * 100
    if (todayIn) scale += `<span class="cal-runway__today-flag" style="left: ${todayAt.toFixed(3)}%">Today</span>`
    const seps = keys
      .slice(1)
      .map((k) => `<span class="cal-lane__sep" style="left: ${pc(`${k}-01`).toFixed(3)}%"></span>`)
      .join('')
    const todayLine = todayIn ? `<span class="cal-lane__today" style="left: ${todayAt.toFixed(3)}%"></span>` : ''

    const lanes = data.calendars
      .map((c) => {
        const off = hidden.has(c.id)
        const mine = off ? [] : entries.filter((e) => e.calendar === c.id && inRange(e))
        const bands = mine.filter((e) => e.precision !== 'day')
        const dated = mine.filter((e) => e.precision === 'day')
        const items = []
        for (const e of bands) {
          const left = pc(e.first < rs ? rs : e.first)
          const end = addDays(e.last, 1)
          const right = pc(end > re ? re : end)
          const when =
            e.precision === 'month' ? `${monthName(e.first)} · day TBC` : `${e.first.slice(0, 4)} · month TBC`
          items.push(`<div class="cal-rw cal-rw--band ${slot(c.id)}${isPast(e) ? ' is-past' : ''}" style="top: 10px; height: 30px; left: calc(${left.toFixed(3)}% + 3px); width: calc(${(right - left).toFixed(3)}% - 6px)">
            <button type="button" class="cal-rw__hit" data-cal-entries="${esc(e.id)}" aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(`${e.title}, ${when}, ${e.statusLabel}`)}">
              <span class="cal-rw__label">${esc(e.title)}<span class="cal-rw__when">${esc(when)}</span></span></button></div>`)
        }
        /** @type {number[]} */
        const rows = []
        const top0 = bands.length ? 52 : 16
        for (const e of dated) {
          const left = pc(e.first)
          const right = pc(addDays(e.last, 1))
          const multi = e.last > e.first
          const a = day(e.first)
          const when = `${a.getUTCDate()}${multi ? `–${day(e.last).getUTCDate()}` : ''} ${MONTHS[a.getUTCMonth()].slice(0, 3)}${firm(e) ? '' : ` · ${e.statusLabel}`}`
          const labelPct = (((e.title.length + when.length) * 6.6 + 40) / width) * 100
          const flip = (multi ? right : left) + labelPct > 100
          const from = flip ? left - labelPct : left
          const to = flip ? (multi ? right : left) : (multi ? right : left) + labelPct
          let r = 0
          while (rows[r] !== undefined && rows[r] > from) r++
          rows[r] = to
          const top = top0 + r * 34
          const cls = `cal-rw ${multi ? 'cal-rw--bar' : 'cal-rw--pin'} ${slot(c.id)}${firm(e) ? '' : ' is-prov'}${isPast(e) ? ' is-past' : ''}${flip ? ' is-flip' : ''}`
          const box = multi
            ? `top: ${top}px; height: 16px; left: calc(${left.toFixed(3)}% + 2px); width: calc(${(right - left).toFixed(3)}% - 4px)`
            : `top: ${top}px; width: 16px; height: 16px; left: calc(${((left + right) / 2).toFixed(3)}% - 8px)`
          items.push(`<div class="${cls}" style="${box}">
            <button type="button" class="cal-rw__hit" data-cal-entries="${esc(e.id)}" aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(`${e.title}, ${whenLong(e)}, ${e.statusLabel}`)}">
              <span class="cal-rw__label" aria-hidden="true">${esc(e.title)}<span class="cal-rw__when">${esc(when)}</span></span></button></div>`)
        }
        const height = off
          ? 52
          : mine.length
            ? Math.max(64, top0 + Math.max(rows.length, bands.length ? 0 : 1) * 34 + 8)
            : 64
        const meta = off
          ? 'Hidden'
          : mine.length
            ? `${mine.length} in view`
            : c.count
              ? 'Nothing in this period'
              : 'No dates yet'
        const empty = off
          ? '<div class="cal-lane__empty">Hidden: tick the box to show it</div>'
          : mine.length
            ? ''
            : `<div class="cal-lane__empty">${c.count ? 'Nothing in this period' : 'No dates yet'}</div>`
        return `<div class="cal-lane${off ? ' is-off' : ''}" role="group" aria-label="${esc(c.title)}">
          <div class="cal-lane__head">
            <input class="cal-toggle ${slot(c.id)}" type="checkbox" data-cal-toggle="${esc(c.id)}"${off ? '' : ' checked'} aria-label="Show ${esc(c.title)}">
            <span class="cal-code ${slot(c.id)}${c.count ? '' : ' cal-code--empty'}" aria-hidden="true">${esc(c.code)}</span>
            <span class="cal-lane__text"><span class="cal-lane__name">${esc(c.title)}</span><span class="cal-lane__meta">${meta}</span></span>
            ${data.feeds === false ? '' : `<button type="button" class="cal-lane__sub" data-cal-lane-sub="${esc(c.id)}" aria-haspopup="dialog" aria-expanded="false" aria-label="Subscribe to ${esc(c.title)}"><i data-lucide="calendar-plus" aria-hidden="true"></i></button>`}
          </div>
          <div class="cal-lane__track" style="height: ${height}px">${seps}${todayLine}${empty}${items.join('')}</div>
        </div>`
      })
      .join('')

    panels.runway.innerHTML = `<div class="cal-runway-scroll"><div class="cal-runway">
      <div class="cal-runway__head" aria-hidden="true"><span class="cal-runway__label">Calendar</span><div class="cal-runway__scale">${scale}</div></div>
      ${lanes}</div></div>`
  }

  // ── List, panel, next date: shown and hidden, never redrawn ──
  function applyHidden() {
    for (const row of page.querySelectorAll('[data-cal-entry]')) {
      const el = /** @type {HTMLElement} */ (row)
      el.hidden = hidden.has(/** @type {string} */ (el.dataset.calendar))
    }
    let any = false
    for (const month of page.querySelectorAll('[data-cal-list-month]')) {
      const el = /** @type {HTMLElement} */ (month)
      el.hidden = !el.querySelector('[data-cal-entry]:not([hidden])')
      any ||= !el.hidden
    }
    one('[data-cal-list-empty]').toggleAttribute('hidden', any)
    for (const row of page.querySelectorAll('[data-calendar-card]')) {
      row.classList.toggle(
        'is-off',
        hidden.has(/** @type {string} */ (/** @type {HTMLElement} */ (row).dataset.calendarCard))
      )
    }
    for (const box of page.querySelectorAll('[data-cal-toggle]')) {
      const el = /** @type {HTMLInputElement} */ (box)
      el.checked = !hidden.has(/** @type {string} */ (el.dataset.calToggle))
    }
    const n = hidden.size
    for (const button of page.querySelectorAll('[data-cal-show-all]')) {
      if (button.closest('[data-cal-list-empty]')) continue
      const el = /** @type {HTMLElement} */ (button)
      el.hidden = n === 0
    }
    hiddenNote.textContent = `${n} calendar${n === 1 ? '' : 's'} hidden · Show all`
    updateNext()
  }

  function updateNext() {
    /** @type {HTMLAnchorElement | null} */
    const card = page.querySelector('[data-cal-next]')
    if (!card) return
    const list = visible()
    const next = list.find((e) => e.precision === 'day' && e.first >= today)
    card.hidden = !next
    if (!next) return
    const d = day(next.first)
    const c = cal(next.calendar)
    const days = daysBetween(today, next.first)
    card.href = next.href
    const part = (/** @type {string} */ name) =>
      /** @type {HTMLElement} */ (card.querySelector(`[data-cal-next-${name}]`))
    part('date').innerHTML = `<span class="cal-next__wd">${WEEKDAYS[d.getUTCDay()].slice(0, 3)}</span>
      <span class="cal-next__day">${d.getUTCDate()}</span><span class="cal-next__mon">${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}</span>`
    part('eyebrow').textContent = `Next up · ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`
    part('title').textContent = next.title
    part('meta').innerHTML =
      `<span class="cal-code ${slot(next.calendar)}" title="${esc(c.title)}">${esc(c.code)}</span>${statusBadge(next)}`
    const also = list.filter((e) => e.precision === 'month' && e.first.slice(0, 7) === today.slice(0, 7) && !isPast(e))
    const alsoEl = part('also')
    alsoEl.hidden = !also.length
    alsoEl.innerHTML = `Also this month, day not fixed: <strong>${also.map((e) => esc(e.title)).join(', ')}</strong>`
  }

  // ── Views ──
  function rangeLabel() {
    const n = view === 'runway' ? 3 : monthCount()
    const last = addMonths(start, n - 1)
    if (n === 1) return `${monthName(start)} ${start.slice(0, 4)}`
    const sameYear = start.slice(0, 4) === last.slice(0, 4)
    return `${monthName(start)}${sameYear ? '' : ` ${start.slice(0, 4)}`} – ${monthName(last)} ${last.slice(0, 4)}`
  }

  function render() {
    closePop(false)
    for (const tab of tabs) {
      const on = tab.dataset.calTab === view
      tab.setAttribute('aria-selected', String(on))
      tab.tabIndex = on ? 0 : -1
    }
    for (const [name, panel] of Object.entries(panels)) panel.hidden = name !== view
    nav.hidden = view === 'list'
    range.hidden = view === 'list'
    legend.hidden = view === 'list'
    range.textContent = rangeLabel()
    if (view === 'months') renderMonths()
    if (view === 'runway') renderRunway()
    icons()
  }

  /** @param {string} next */
  function setView(next) {
    view = next
    store.set(VIEW_KEY, view)
    render()
  }

  /** @param {Set<string>} next */
  function setHidden(next) {
    hidden = next
    store.set(HIDDEN_KEY, JSON.stringify([...hidden]))
    applyHidden()
    if (view !== 'list') render()
  }

  // ── Detail popover ──
  /** @param {ViewEntry} e @param {number} i */
  function entryHtml(e, i) {
    const c = cal(e.calendar)
    const tags = e.tags
      .map(
        (t) =>
          `<span class="cal-tag cal-tag--named" title="${esc(t.groupLabel)}">${t.pill ?? `<span class="cal-tag__code">${esc(t.code)}</span>`} ${esc(t.name)}</span>`
      )
      .join('')
    return `<article class="cal-pop__entry">
      <div class="cal-pop__cal"><span class="cal-code ${slot(e.calendar)}" aria-hidden="true">${esc(c.code)}</span>${esc(c.title)}</div>
      <div>
        <h3 class="cal-pop__title"${i === 0 ? ' id="cal-pop-title" tabindex="-1"' : ''}>${esc(e.title)}</h3>
        <p class="cal-pop__when">${isPast(e) ? 'Past · ' : ''}${esc(whenLong(e))}</p>
      </div>
      <div class="cal-pop__badges">${statusBadge(e)}<span class="calendar-kind"><i data-lucide="${esc(e.kindIcon)}" class="calendar-kind__icon" aria-hidden="true"></i>${esc(e.kindLabel)}</span><span class="calendar-availability calendar-availability--${esc(e.availability)}"><i data-lucide="${esc(e.availabilityIcon)}" class="calendar-availability__icon" aria-hidden="true"></i>${esc(e.availabilityLabel)}</span>${tags}</div>
      <p class="cal-pop__desc">${esc(e.description)}</p>
      <div class="cal-pop__source"><i data-lucide="file-text" aria-hidden="true"></i><span><strong>Source</strong>${e.sources.map(esc).join('; ')}${
        e.sourceStatus ? `<br>Recorded status: “${esc(e.sourceStatus)}”` : ''
      }</span></div>
      <a class="cal-pop__link" href="${esc(e.href)}">See it on the ${esc(c.title)} calendar page<i data-lucide="arrow-right" aria-hidden="true"></i></a>
    </article>`
  }

  /** @param {HTMLElement} anchor */
  function place(anchor) {
    if (phone.matches) {
      pop.style.left = ''
      pop.style.top = ''
      return
    }
    const r = anchor.getBoundingClientRect()
    const w = pop.offsetWidth
    const h = pop.offsetHeight
    let left = r.left + window.scrollX + r.width / 2 - w / 2
    left = Math.max(window.scrollX + 16, Math.min(left, window.scrollX + document.documentElement.clientWidth - w - 16))
    let top = r.bottom + window.scrollY + 8
    if (r.bottom + h + 8 > window.innerHeight && r.top - h - 8 > 0) top = r.top + window.scrollY - h - 8
    pop.style.left = `${left}px`
    pop.style.top = `${top}px`
  }

  /** @param {HTMLElement} anchor @param {string} html */
  function openPop(anchor, html) {
    closePop(false)
    pop.innerHTML = `<button class="cal-pop__close" type="button" aria-label="Close" data-cal-pop-close><i data-lucide="x" aria-hidden="true"></i></button>${html}`
    pop.hidden = false
    StoaCalendar.icons(pop)
    place(anchor)
    popAnchor = anchor
    anchor.setAttribute('aria-expanded', 'true')
    /** @type {HTMLElement | null} */
    const title = pop.querySelector('#cal-pop-title')
    title?.focus({ preventScroll: true })
  }

  /** @param {HTMLElement} anchor @param {string[]} ids */
  function openEntries(anchor, ids) {
    const list = ids.map((id) => byId.get(id)).filter((e) => e !== undefined)
    if (!list.length) return
    openPop(anchor, list.map(entryHtml).join(''))
    host.dispatchEvent(new CustomEvent('stoa-calendar-select', { bubbles: true, detail: { entries: list } }))
  }

  /** @param {HTMLElement} anchor @param {string} id */
  function openSubscribe(anchor, id) {
    const menu = page.querySelector(`[data-cal-sub-menu="${CSS.escape(id)}"]`)
    if (!menu) return
    const copy = /** @type {HTMLElement} */ (menu.cloneNode(true))
    for (const el of copy.querySelectorAll('[id]')) el.removeAttribute('id')
    for (const el of copy.querySelectorAll('[data-copy-from]')) el.removeAttribute('data-copy-from')
    /** @type {HTMLElement | null} */
    const title = copy.querySelector('.cal-sub__title')
    if (title) {
      title.id = 'cal-pop-title'
      title.tabIndex = -1
    }
    openPop(anchor, copy.outerHTML)
  }

  function closePop(restoreFocus = true) {
    if (pop.hidden) return
    const hadFocus = pop.contains(document.activeElement)
    pop.hidden = true
    pop.innerHTML = ''
    if (popAnchor) {
      popAnchor.setAttribute('aria-expanded', 'false')
      if (restoreFocus && hadFocus && popAnchor.isConnected) popAnchor.focus()
    }
    popAnchor = null
  }

  // ── Events ──
  page.addEventListener(
    'change',
    (event) => {
      const box = /** @type {HTMLInputElement | null} */ (
        /** @type {Element} */ (event.target).closest('[data-cal-toggle]')
      )
      if (!box) return
      const next = new Set(hidden)
      const id = /** @type {string} */ (box.dataset.calToggle)
      if (box.checked) next.delete(id)
      else next.add(id)
      setHidden(next)
    },
    listen
  )

  page.addEventListener(
    'click',
    (event) => {
      const target = /** @type {Element} */ (event.target)
      if (target.closest('[data-cal-show-all]')) return setHidden(new Set())
      const step = /** @type {HTMLElement | null} */ (target.closest('[data-cal-step]'))
      if (step) {
        start = addMonths(start, Number(step.dataset.calStep))
        return render()
      }
      if (target.closest('[data-cal-today]')) {
        start = today.slice(0, 7)
        return render()
      }
      const tab = /** @type {HTMLElement | null} */ (target.closest('[data-cal-tab]'))
      if (tab) return setView(/** @type {string} */ (tab.dataset.calTab))
      const opener = /** @type {HTMLElement | null} */ (target.closest('[data-cal-entries]'))
      if (opener) {
        event.stopPropagation()
        if (popAnchor === opener) return closePop()
        return openEntries(opener, /** @type {string} */ (opener.dataset.calEntries).split(','))
      }
      const sub = /** @type {HTMLElement | null} */ (target.closest('[data-cal-lane-sub]'))
      if (sub) {
        event.stopPropagation()
        if (popAnchor === sub) return closePop()
        return openSubscribe(sub, /** @type {string} */ (sub.dataset.calLaneSub))
      }
      const link = /** @type {HTMLElement | null} */ (target.closest('[data-cal-open]'))
      const mouse = /** @type {MouseEvent} */ (event)
      if (link && !mouse.metaKey && !mouse.ctrlKey && !mouse.shiftKey && mouse.button === 0) {
        event.preventDefault()
        event.stopPropagation()
        if (popAnchor === link) return closePop()
        return openEntries(link, [/** @type {string} */ (link.dataset.calOpen)])
      }
    },
    listen
  )

  page.addEventListener(
    'keydown',
    (event) => {
      const tab = /** @type {HTMLElement | null} */ (/** @type {Element} */ (event.target).closest('[data-cal-tab]'))
      if (!tab) return
      const i = tabs.indexOf(tab)
      const to =
        event.key === 'ArrowRight'
          ? (i + 1) % tabs.length
          : event.key === 'ArrowLeft'
            ? (i - 1 + tabs.length) % tabs.length
            : event.key === 'Home'
              ? 0
              : event.key === 'End'
                ? tabs.length - 1
                : -1
      if (to < 0) return
      event.preventDefault()
      setView(/** @type {string} */ (tabs[to].dataset.calTab))
      tabs[to].focus()
    },
    listen
  )

  pop.addEventListener(
    'click',
    (event) => {
      const target = /** @type {Element} */ (event.target)
      if (target.closest('[data-cal-pop-close]')) return closePop()
      const copy = target.closest('.calendar-url__copy')
      const input = copy?.parentElement?.querySelector('input')
      if (copy && input) copyValue(input, copy, signal)
    },
    listen
  )

  // One subscribe menu open at a time; a click elsewhere or Escape closes it.
  const menus = [...page.querySelectorAll('[data-cal-sub]')].map((m) => /** @type {HTMLDetailsElement} */ (m))
  for (const menu of menus) {
    menu.addEventListener(
      'toggle',
      () => {
        if (!menu.open) return
        closePop(false)
        for (const other of menus) if (other !== menu) other.open = false
      },
      listen
    )
  }

  document.addEventListener(
    'click',
    (event) => {
      const target = /** @type {Node} */ (event.target)
      if (!pop.hidden && !pop.contains(target)) closePop(false)
      for (const menu of menus) if (menu.open && !menu.contains(target)) menu.open = false
    },
    listen
  )

  document.addEventListener(
    'keydown',
    (event) => {
      if (event.key !== 'Escape') return
      if (!pop.hidden) return closePop()
      const open = menus.find((m) => m.open)
      if (open) {
        open.open = false
        open.querySelector('summary')?.focus()
      }
    },
    listen
  )

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let resizeTimer
  window.addEventListener(
    'resize',
    () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => {
        if (view !== 'list') render()
      }, 150)
    },
    listen
  )
  signal.addEventListener('abort', () => clearTimeout(resizeTimer), { once: true })
  narrow.addEventListener('change', () => view !== 'list' && render(), listen)

  // ── The calendars panel: collapsed or shown, remembered between visits ──
  /** @type {HTMLElement} */
  const panel = one('#calendars')
  /** @type {HTMLElement} */
  const panelToggle = one('[data-cal-panel-toggle]')
  /** @type {HTMLElement} */
  const layout = one('[data-cal-layout]')
  /** @param {boolean} open @param {boolean} save */
  function setPanel(open, save) {
    panel.hidden = !open
    layout.classList.toggle('is-panel-collapsed', !open)
    panelToggle.setAttribute('aria-expanded', String(open))
    if (save) store.set(PANEL_KEY, open ? 'open' : 'collapsed')
    if (view !== 'list') render()
  }
  panelToggle.addEventListener('click', () => setPanel(panel.hidden === true, true), listen)

  // ── Start ──
  for (const box of page.querySelectorAll('[data-cal-toggle]')) /** @type {HTMLElement} */ (box).hidden = false
  toolbar.hidden = false
  applyHidden()
  if (store.get(PANEL_KEY) === 'collapsed') setPanel(false, false)
  else render()
  return pop
}

// Outside a browser (a site's build importing ./index.js) there is no
// HTMLElement; the class is then inert and only the renderers are used.
const Base = /** @type {typeof HTMLElement} */ (globalThis.HTMLElement ?? class {})

export class StoaCalendar extends Base {
  /**
   * Draws the icon placeholders under `root`. The default asks Lucide, when
   * the page has loaded it; a site with other icons replaces this.
   * @param {Element} _root
   */
  static icons = (_root) => /** @type {any} */ (globalThis).lucide?.createIcons?.()

  /** @type {AbortController | undefined} */
  #abort
  /** @type {HTMLElement | undefined} */
  #pop

  /**
   * Draws a calendars view from a model, for a page with no build step, then
   * upgrades it.
   * @param {RenderContext} ctx
   * @param {ViewChrome} [chrome]
   */
  render(ctx, chrome = {}) {
    this.disconnectedCallback()
    this.innerHTML = renderCalendarView(ctx, { ...chrome, bare: true })
    if (this.isConnected) this.connectedCallback()
  }

  connectedCallback() {
    if (!this.isConnected || this.#abort) return
    this.#abort = new AbortController()
    const { signal } = this.#abort
    const today = this.getAttribute('today') || readerToday()
    markPast(this, today)
    applyUpcoming(this, today)
    wireCopyButtons(this, signal)
    /** @type {HTMLElement | null} */
    const page = this.querySelector('[data-cal-page]')
    const source = this.querySelector('script[data-cal-data]')
    if (page && source?.textContent) {
      const data = /** @type {ViewData} */ (JSON.parse(source.textContent))
      this.#pop = startView(this, page, data, today, signal, this.getAttribute('storage-key') || 'calendars')
    }
    StoaCalendar.icons(this)
  }

  disconnectedCallback() {
    this.#abort?.abort()
    this.#abort = undefined
    // The popover lives on the body; bring it home so a reconnect finds it.
    if (this.#pop) {
      this.#pop.hidden = true
      this.#pop.innerHTML = ''
      this.querySelector('[data-cal-page]')?.append(this.#pop)
      this.#pop = undefined
    }
  }
}

/** Defines <stoa-calendar> once. */
export function defineStoaCalendar(name = 'stoa-calendar') {
  if (!customElements.get(name)) customElements.define(name, StoaCalendar)
}
