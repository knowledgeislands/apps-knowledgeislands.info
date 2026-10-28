// @ts-check
import { validateSet, vocabulary } from '../calendar/contract.js'
import { entrySpan } from '../calendar/dates.js'
import { MONTHS } from '../calendar/view.js'
import { validateToday } from '../internal/calendar-day.js'

/** Preserve the source's date precision. @param {string} start */
export function startLabel(start) {
  const [year, month, day] = start.split('-').map(Number)
  return day ? `${day} ${MONTHS[month - 1]} ${year}` : month ? `${MONTHS[month - 1]} ${year}` : String(year)
}

/**
 * One row per source entry, stable across calendars on tied dates; weekly series stay one row.
 * @param {import('../calendar/types.js').StoaCalendarSet} set
 * @param {string} today YYYY-MM-DD in the calendar set's zone.
 * @param {(calendar: import('../calendar/types.js').Calendar) => string} [pagePath]
 */
export function timeline(set, today, pagePath = (calendar) => `/calendars/${calendar.id}/`) {
  validateSet(set)
  validateToday(today)
  const { kinds, statuses } = vocabulary(set)
  const entries = set.calendars
    .flatMap((calendar) =>
      calendar.entries.map((entry) => {
        const span = entrySpan(entry)
        const past = entry.repeat === 'weekly' ? Boolean(entry.until && entry.until < today) : span.last < today
        return {
          ...entry,
          calendar: calendar.id,
          calendarTitle: calendar.title,
          code: calendar.code,
          colour: calendar.colour,
          first: span.first,
          last: span.last,
          past,
          next: false,
          when: `${entry.repeat === 'weekly' ? 'Weekly from ' : ''}${startLabel(entry.start)}${entry.end ? ` – ${startLabel(entry.end)}` : ''}${entry.repeat === 'weekly' && entry.until ? ` until ${startLabel(entry.until)}` : ''}`,
          kindLabel: kinds[entry.kind].label,
          statusLabel: statuses[entry.status],
          url: `${pagePath(calendar)}#${entry.id}`
        }
      })
    )
    .sort((a, b) => a.first.localeCompare(b.first))
  const next = entries.find((entry) => !entry.past)
  if (next) next.next = true
  /** @type {{key: string, label: string, entries: typeof entries}[]} */
  const groups = []
  for (const entry of entries) {
    const key = entry.start.slice(0, 7)
    let group = groups.find((item) => item.key === key)
    if (!group) {
      group = { key, label: startLabel(key), entries: [] }
      groups.push(group)
    }
    group.entries.push(entry)
  }
  return groups
}
