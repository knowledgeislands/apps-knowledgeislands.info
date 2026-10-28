// @ts-check
import { vocabulary } from '../calendar/contract.js'
import { jsonForScript } from '../calendar/view.js'
import { calendarHref } from '../internal/calendar-link.js'
import { esc } from '../internal/html.js'
import { todayBoard } from './core.js'

/**
 * @typedef {object} TodayBoardOptions
 * @property {string} today
 * @property {string} [id] Unique heading prefix per instance.
 * @property {Record<string, string>} [pagePaths] Calendar ids to page URLs; serializable for browser refresh.
 * @property {{today?: string, empty?: string}} [labels]
 */
/** @param {import('../calendar/types.js').Entry} entry @param {string} calendarId @param {TodayBoardOptions} options */
function entryTitle(entry, calendarId, options) {
  const page = options.pagePaths?.[calendarId]
  const url = entry.url ?? (page ? `${page}#${entry.id}` : undefined)
  return url ? `<a href="${calendarHref(url)}">${esc(entry.title)}</a>` : esc(entry.title)
}

/** @param {import('../calendar/types.js').StoaCalendarSet} set @param {TodayBoardOptions} options */
export function renderTodayBoardContent(set, options) {
  const calendars = todayBoard(set, options.today)
  const { kinds, statuses } = vocabulary(set)
  const id = options.id ?? 'today-board'
  return `<p>${esc(options.labels?.today ?? 'Today')}: <time datetime="${esc(options.today)}">${esc(options.today)}</time> (${esc(set.timeZone)})</p><div class="stoa-today-board__calendars">${calendars.map((calendar) => `<section class="cal-slot-${calendar.colour}" aria-labelledby="${esc(id)}-${esc(calendar.id)}"><h2 id="${esc(id)}-${esc(calendar.id)}"><span class="cal-code">${esc(calendar.code)}</span> ${esc(calendar.title)}</h2>${calendar.entries.length ? `<ul>${calendar.entries.map((entry) => `<li>${entryTitle(entry, calendar.id, options)}${entry.time ? ` <time>${esc(entry.time)}</time>` : ''}<p>${esc(kinds[entry.kind].label)} · ${esc(statuses[entry.status])}</p>${entry.description ? `<p>${esc(entry.description)}</p>` : ''}</li>`).join('')}</ul>` : `<p>${esc(options.labels?.empty ?? 'No entries today.')}</p>`}</section>`).join('')}</div>`
}
/** Complete static fallback plus the same model used for local-midnight refresh. @param {import('../calendar/types.js').StoaCalendarSet} set @param {TodayBoardOptions} options */
export function renderTodayBoard(set, options) {
  return `<stoa-today-board><div data-today-board-content>${renderTodayBoardContent(set, options)}</div><script type="application/json" data-today-board-data>${jsonForScript({ set, options })}</script></stoa-today-board>`
}
