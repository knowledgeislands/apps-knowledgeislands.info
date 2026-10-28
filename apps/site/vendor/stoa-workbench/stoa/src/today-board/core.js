// @ts-check
import { validateSet } from '../calendar/contract.js'
import { entrySpan } from '../calendar/dates.js'
import { validateToday } from '../internal/calendar-day.js'

export { msToMidnight, zonedToday } from '../internal/calendar-day.js'

/**
 * Each calendar's actual day entries; month/year uncertainty never asserts an event is today.
 * All-day ranges include both ends. Weekly recurrences include their until day.
 * @param {import('../calendar/types.js').StoaCalendarSet} set
 * @param {string} today
 */
export function todayBoard(set, today) {
  validateSet(set)
  validateToday(today)
  return set.calendars.map((calendar) => ({
    ...calendar,
    entries: calendar.entries
      .filter((entry) => {
        const span = entrySpan(entry)
        if (span.precision !== 'day') return false
        if (entry.repeat === 'weekly')
          return (
            !entry.exdates?.includes(today) &&
            today >= span.first &&
            (!entry.until || today <= entry.until) &&
            (Date.parse(`${today}T00:00:00Z`) - Date.parse(`${span.first}T00:00:00Z`)) % (7 * 86400000) === 0
          )
        return span.first <= today && today <= span.last
      })
      .sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
  }))
}
