// @ts-check

import { calendarHref } from '../internal/calendar-link.js'
import { esc } from '../internal/html.js'
import { timeline } from './core.js'

/**
 * @typedef {object} TimelineOptions
 * @property {string} today
 * @property {(calendar: import('../calendar/types.js').Calendar) => string} [pagePath]
 * @property {string} [id] Unique heading prefix when more than one timeline appears.
 * @property {{past?: string, next?: string, empty?: string}} [labels]
 */
/** @param {import('../calendar/types.js').StoaCalendarSet} set @param {TimelineOptions} options */
export function renderTimeline(set, options) {
  const groups = timeline(set, options.today, options.pagePath)
  const id = options.id ?? 'timeline'
  const labels = { past: 'Past', next: 'Next', empty: 'No dated entries.', ...options.labels }
  return `<div class="stoa-timeline">${groups.length ? groups.map((group) => `<section aria-labelledby="${esc(id)}-${esc(group.key)}"><h2 id="${esc(id)}-${esc(group.key)}">${esc(group.label)}</h2><ol>${group.entries.map((entry) => `<li class="stoa-timeline__entry cal-slot-${entry.colour}" data-past="${entry.past}" data-next="${entry.next}"><p><time datetime="${esc(entry.start)}">${esc(entry.when)}</time>${entry.past ? ` · ${esc(labels.past)}` : entry.next ? ` · <strong>${esc(labels.next)}</strong>` : ''}</p><h3><span class="cal-code" title="${esc(entry.calendarTitle)}">${esc(entry.code)}</span> <a href="${calendarHref(entry.url)}">${esc(entry.title)}</a></h3>${entry.description ? `<p>${esc(entry.description)}</p>` : ''}<p class="stoa-timeline__meta">${esc(entry.calendarTitle)} · ${esc(entry.kindLabel)} · ${esc(entry.statusLabel)}</p></li>`).join('')}</ol></section>`).join('') : `<p>${esc(labels.empty)}</p>`}</div>`
}
