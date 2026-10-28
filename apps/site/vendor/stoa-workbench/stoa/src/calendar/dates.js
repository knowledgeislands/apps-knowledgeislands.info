// @ts-check
// Dates and times for the Stoa Calendar: an entry's span, its timing, a
// weekly series' occurrences, and wall-clock conversion between zones. Pure
// functions with no dependency, run by Eleventy at build and by the browser.

/** @typedef {import('./types.js').Entry} Entry */
/** @typedef {import('./types.js').EntrySpan} EntrySpan */
/** @typedef {import('./types.js').EntryTiming} EntryTiming */
/** @typedef {import('./types.js').Zones} Zones */
/** @typedef {Pick<Entry, 'id' | 'start' | 'end'>} Dated */
/** @typedef {Pick<Entry, 'id' | 'start' | 'end' | 'time' | 'duration' | 'repeat' | 'until' | 'exdates'>} Timed */

/** How many weekly occurrences are drawn for an open-ended series. */
export const WEEKLY_OCCURRENCES = 52

/** @param {number} n */
export const pad = (n) => String(n).padStart(2, '0')
/** @param {Date} d */
export const iso = (d) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
/** @param {string} s */
export const day = (s) => new Date(`${s}T00:00:00Z`)
/** @param {string} s @param {number} n */
export const addDays = (s, n) => {
  const d = day(s)
  d.setUTCDate(d.getUTCDate() + n)
  return iso(d)
}
/** @param {string} s */
const validDay = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && iso(day(s)) === s

/**
 * Reads an entry's dates, rejecting any the contract does not allow.
 * @param {Dated} entry
 * @returns {EntrySpan}
 */
export function entrySpan(entry) {
  const { id, start, end } = entry
  if (validDay(start)) {
    const last = end ?? start
    if (!validDay(last) || last < start)
      throw new Error(`calendar entry ${id}: end ${end} is not a day on or after ${start}`)
    return { precision: 'day', first: start, last, endExclusive: addDays(last, 1) }
  }
  if (end !== undefined) throw new Error(`calendar entry ${id}: only a day-precision entry may have an end`)
  if (/^\d{4}-(0[1-9]|1[0-2])$/.test(start)) {
    const [y, m] = start.split('-').map(Number)
    const next = m === 12 ? `${y + 1}-01-01` : `${y}-${pad(m + 1)}-01`
    return { precision: 'month', first: `${start}-01`, last: addDays(next, -1), endExclusive: next }
  }
  if (/^\d{4}$/.test(start)) {
    return {
      precision: 'year',
      first: `${start}-01-01`,
      last: `${start}-12-31`,
      endExclusive: `${Number(start) + 1}-01-01`
    }
  }
  throw new Error(`calendar entry ${id}: start ${start} is not YYYY-MM-DD, YYYY-MM or YYYY`)
}

/** @param {string} hhmm */
const minutes = (hhmm) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
/** @param {number} m */
const clock = (m) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`

/**
 * An entry's time, or undefined for an all-day entry. Rejects a time on
 * anything but a single day, an impossible duration, a meeting that
 * runs past midnight, a weekly entry without a single day, and an `until` before
 * the start.
 * @param {Timed} entry
 * @returns {EntryTiming | undefined}
 */
export function entryTiming(entry) {
  const { id, time, duration, repeat, until, exdates } = entry
  if (exdates !== undefined) {
    if (repeat !== 'weekly' || !Array.isArray(exdates))
      throw new Error(`calendar entry ${id}: exdates need a recurring entry and an array`)
    for (const date of exdates) {
      if (
        typeof date !== 'string' ||
        !validDay(date) ||
        date < entry.start ||
        (until !== undefined && date > until) ||
        (day(date).getTime() - day(entry.start).getTime()) % (7 * 86400000) !== 0
      )
        throw new Error(`calendar entry ${id}: exdate ${date} is not an occurrence date`)
    }
  }
  if (repeat !== undefined) {
    const span = entrySpan(entry)
    if (span.precision !== 'day' || span.first !== span.last)
      throw new Error(`calendar entry ${id}: only an entry on a single day may repeat`)
  }
  if (repeat !== undefined && repeat !== 'weekly')
    throw new Error(`calendar entry ${id}: repeat ${repeat} is not weekly`)
  if (until !== undefined) {
    if (repeat !== 'weekly') throw new Error(`calendar entry ${id}: only a weekly entry may have an until`)
    if (!validDay(until) || until < entry.start)
      throw new Error(`calendar entry ${id}: until ${until} is not a day on or after ${entry.start}`)
  }
  if (time === undefined) {
    if (duration !== undefined) throw new Error(`calendar entry ${id}: duration needs a time`)
    return undefined
  }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error(`calendar entry ${id}: time ${time} is not HH:MM`)
  const span = entrySpan(entry)
  if (span.precision !== 'day' || span.first !== span.last)
    throw new Error(`calendar entry ${id}: only an entry on a single day may have a time`)
  if (duration !== undefined && (!Number.isInteger(duration) || duration <= 0 || minutes(time) + duration > 24 * 60))
    throw new Error(`calendar entry ${id}: duration ${duration} is not whole minutes within the day`)
  return {
    start: time,
    ...(duration === undefined ? {} : { end: clock(minutes(time) + duration), duration }),
    weekly: repeat === 'weekly',
    ...(until ? { until } : {})
  }
}

/**
 * The days a weekly entry falls on: every seventh day from its start,
 * to its `until` or for `weeks` weeks. A one-off entry has one.
 * @param {Timed} entry
 * @param {number} [weeks]
 * @returns {string[]}
 */
export function occurrences(entry, weeks = WEEKLY_OCCURRENCES) {
  entryTiming(entry)
  const first = entrySpan(entry).first
  if (entry.repeat !== 'weekly') return [first]
  const days = []
  for (let i = 0; i < weeks; i++) {
    const d = addDays(first, 7 * i)
    if (entry.until && d > entry.until) break
    if (!entry.exdates?.includes(d)) days.push(d)
  }
  return days
}

/**
 * Minutes a zone is ahead of UTC at an instant, e.g. 120 for Paris in summer.
 * @param {Date} instant
 * @param {string} zone
 */
export function zoneOffset(instant, zone) {
  const name = new Intl.DateTimeFormat('en-GB', { timeZone: zone, timeZoneName: 'longOffset' })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value
  const m = name?.match(/^GMT(?:([+-])(\d{2}):(\d{2}))?$/)
  if (!m) throw new Error(`no UTC offset for ${zone}`)
  return m[1] ? (m[1] === '-' ? -1 : 1) * (Number(m[2]) * 60 + Number(m[3])) : 0
}

/**
 * The instant a wall-clock day and time in `zone` names.
 * @param {string} isoDate
 * @param {string} hhmm
 * @param {string} zone
 */
export function zonedInstant(isoDate, hhmm, zone) {
  const naive = Date.parse(`${isoDate}T${hhmm}:00Z`)
  let instant = naive - zoneOffset(new Date(naive), zone) * 60_000
  instant = naive - zoneOffset(new Date(instant), zone) * 60_000
  return new Date(instant)
}

/**
 * The wall-clock `HH:MM` in `to` of a day and time in `from`.
 * @param {string} isoDate
 * @param {string} hhmm
 * @param {string} from
 * @param {string} to
 */
export function clockIn(isoDate, hhmm, from, to) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: to,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  }).format(zonedInstant(isoDate, hhmm, from))
}

/**
 * A zone's name in words: the set's own label, else its city, e.g.
 * `Europe/Paris` → "Paris time".
 * @param {string} zone
 * @param {Record<string, string>} [labels]
 */
export function zoneLabel(zone, labels = {}) {
  return labels[zone] ?? `${(zone.split('/').pop() ?? zone).replaceAll('_', ' ')} time`
}

export const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/**
 * An entry's time in words, in its zone and the second zone, e.g.
 * "10:30–11:30 Paris time (09:30–10:30 UK time)"; a weekly entry opens with
 * its weekday, "Thursdays,". Undefined for an all-day entry.
 * @param {Timed} entry
 * @param {Zones} zones
 * @returns {string | undefined}
 */
export function timeLabel(entry, zones) {
  const timing = entryTiming(entry)
  if (!timing) return undefined
  const on = entry.start
  const { timeZone, secondZone, zoneLabels } = zones
  const second =
    secondZone && secondZone !== timeZone
      ? ` (${clockIn(on, timing.start, timeZone, secondZone)}${timing.end ? `–${clockIn(on, timing.end, timeZone, secondZone)}` : ''} ${zoneLabel(secondZone, zoneLabels)})`
      : ''
  const local = `${timing.start}${timing.end ? `–${timing.end}` : ''} ${zoneLabel(timeZone, zoneLabels)}${second}`
  return timing.weekly ? `${WEEKDAYS[day(on).getUTCDay()]}s, ${local}` : local
}
