// @ts-check
import { addDays, entrySpan, zonedInstant } from '../calendar/dates.js'

/** A calendar set's local day, independent of the machine's zone. @param {Date} now @param {string} zone */
export function zonedToday(now, zone) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now)
  const part = (/** @type {string} */ type) => parts.find((p) => p.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

/** @param {Date} now @param {string} zone */
export function msToMidnight(now, zone) {
  return Math.max(1000, zonedInstant(addDays(zonedToday(now, zone), 1), '00:00', zone).getTime() - now.getTime())
}

/** Reject imprecise or impossible comparison dates. @param {string} today */
export function validateToday(today) {
  if (entrySpan({ id: 'today', start: today }).precision !== 'day') throw new Error('today must be YYYY-MM-DD')
  return today
}
