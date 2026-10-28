// @ts-check
// What a calendar page and the calendars view need from a set: entries
// grouped by month, groups of calendars, the next date, subscribe links, and
// the JSON the Months and Runway views draw from. The feed is in ./ics.js.

import { AVAILABILITY, entryAvailability, vocabulary } from './contract.js'
import { entrySpan, occurrences, timeLabel } from './dates.js'

/** @typedef {import('./types.js').StoaCalendarSet} StoaCalendarSet */
/** @typedef {import('./types.js').Calendar} Calendar */
/** @typedef {import('./types.js').Entry} Entry */
/** @typedef {import('./types.js').EntrySpan} EntrySpan */
/** @typedef {import('./types.js').Zones} Zones */
/** @typedef {import('./types.js').SourceRef} SourceRef */
/** @typedef {import('./types.js').ResolvedSource} ResolvedSource */
/** @typedef {import('./types.js').Availability} Availability */

/**
 * A calendar's entries, each with the availability it publishes.
 * @param {Pick<Calendar, 'id' | 'availability' | 'entries'>} calendar
 * @returns {(Entry & { availability: Availability })[]}
 */
export function resolvedEntries(calendar) {
  return calendar.entries.map((entry) => ({ ...entry, availability: entryAvailability(calendar, entry) }))
}

export const MONTHS = [
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
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/** @param {string} isoDate */
export const shortDay = (isoDate) => {
  const d = new Date(`${isoDate}T00:00:00Z`)
  return `${DAYS[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`
}

/**
 * The days an entry covers: a weekly entry runs from its first to its last
 * occurrence; any other entry covers its own dates.
 * @param {Entry} entry
 * @returns {EntrySpan}
 */
export function seriesSpan(entry) {
  const span = entrySpan(entry)
  const days = occurrences(entry)
  const last = days[days.length - 1]
  if (!last) return span
  if (last === span.last) return { ...span, first: days[0] }
  const end = new Date(`${last}T00:00:00Z`)
  end.setUTCDate(end.getUTCDate() + 1)
  return { ...span, first: days[0], last, endExclusive: end.toISOString().slice(0, 10) }
}

/**
 * The date as the page shows it, inside its month heading.
 * @param {EntrySpan} span
 * @param {boolean} [weekly]
 */
export function dateLabel(span, weekly = false) {
  if (span.precision === 'year') return 'Date to be confirmed'
  if (span.precision === 'month') return 'Day to be confirmed'
  if (weekly) return `Weekly from ${shortDay(span.first)}`
  return span.first === span.last ? shortDay(span.first) : `${shortDay(span.first)} – ${shortDay(span.last)}`
}

/**
 * @template {Entry} E
 * @typedef {E & { span: EntrySpan, dateLabel: string, timeLabel?: string, past: boolean }} MonthRow
 */

/**
 * @template {Entry} E
 * @typedef {{ key: string, label: string, entries: MonthRow<E>[] }} MonthGroup
 */

/**
 * Entries in date order, grouped by the month they start in. An entry with
 * only a year follows that year's months, under its own heading. `today` is
 * `YYYY-MM-DD`; an entry whose last day is before it is past.
 * @template {Entry} E
 * @param {{ entries: E[] }} calendar
 * @param {string} today
 * @param {Zones} zones
 * @returns {MonthGroup<E>[]}
 */
export function calendarMonths(calendar, today, zones) {
  /** @type {Map<string, MonthGroup<E>>} */
  const groups = new Map()
  const rows = calendar.entries
    .filter((entry) => entry.repeat !== 'weekly' || occurrences(entry).length > 0)
    .map((entry) => ({ ...entry, span: seriesSpan(entry) }))
    .map((entry) => ({
      ...entry,
      dateLabel: dateLabel(entry.span, entry.repeat === 'weekly'),
      timeLabel: timeLabel(entry, zones),
      past: entry.span.last < today
    }))
    .map((entry) => ({
      entry,
      key: entry.span.precision === 'year' ? `${entry.start}-13` : entry.span.first.slice(0, 7)
    }))
    .sort((a, b) => a.key.localeCompare(b.key) || a.entry.span.first.localeCompare(b.entry.span.first))
  for (const { entry, key } of rows) {
    const [year, month] = key.split('-')
    const label = month === '13' ? `${year}, date to be confirmed` : `${MONTHS[Number(month) - 1]} ${year}`
    const group = groups.get(key) ?? { key, label, entries: [] }
    group.entries.push(entry)
    groups.set(key, group)
  }
  return [...groups.values()]
}

/**
 * Subscribe links for one calendar's feed. The Google and Outlook links open
 * each service's own "add calendar from URL" screen with the feed filled in;
 * the HTTPS URL is for pasting by hand.
 * @param {string} feedUrl  The feed's absolute HTTPS URL.
 * @param {string} title
 */
export function subscribeLinks(feedUrl, title) {
  const https = feedUrl
  const webcal = https.replace(/^https?:/, 'webcal:')
  const query = `url=${encodeURIComponent(https)}&name=${encodeURIComponent(title)}`
  return {
    https,
    webcal,
    google: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}`,
    outlook365: `https://outlook.office.com/calendar/0/addfromweb?${query}`,
    outlookCom: `https://outlook.live.com/calendar/0/addfromweb?${query}`
  }
}

/**
 * Calendars grouped under their headings, in first-seen order; calendars
 * with no group share the empty label.
 * @param {Calendar[]} calendars
 * @returns {{ label: string, calendars: Calendar[] }[]}
 */
export function calendarGroups(calendars) {
  /** @type {Map<string, { label: string, calendars: Calendar[] }>} */
  const groups = new Map()
  for (const calendar of calendars) {
    const label = calendar.group ?? ''
    const group = groups.get(label) ?? { label, calendars: [] }
    group.calendars.push(calendar)
    groups.set(label, group)
  }
  return [...groups.values()]
}

/**
 * Every distinct source reference a calendar's entries cite, in first-cited order.
 * @param {Calendar} calendar
 * @returns {SourceRef[]}
 */
export function calendarSources(calendar) {
  /** @type {Map<string, SourceRef>} */
  const seen = new Map()
  for (const ref of calendar.entries.flatMap((entry) => entry.sources)) seen.set(`${ref.source}|${ref.at ?? ''}`, ref)
  return [...seen.values()]
}

/** @typedef {Entry & { availability: Availability, calendar: Pick<Calendar, 'id' | 'title' | 'code' | 'colour'> }} MergedEntry */

/**
 * Every calendar's entries in one month-grouped list.
 * @param {Calendar[]} calendars
 * @param {string} today
 * @param {Zones} zones
 * @returns {MonthGroup<MergedEntry>[]}
 */
export function calendarAgenda(calendars, today, zones) {
  const entries = calendars.flatMap((calendar) =>
    resolvedEntries(calendar).map((entry) => ({
      ...entry,
      calendar: { id: calendar.id, title: calendar.title, code: calendar.code, colour: calendar.colour }
    }))
  )
  return calendarMonths({ entries }, today, zones)
}

/**
 * The first dated entry on or after `today`, across every calendar; a weekly
 * entry counts from its next occurrence, which becomes its span.
 * @param {Calendar[]} calendars
 * @param {string} today
 * @param {Zones} zones
 */
export function nextEntry(calendars, today, zones) {
  return calendarAgenda(calendars, today, zones)
    .flatMap((month) => month.entries)
    .map((entry) => {
      const next = entry.repeat === 'weekly' ? occurrences(entry).find((d) => d >= today) : undefined
      return next ? { ...entry, span: { ...entry.span, first: next, last: next } } : entry
    })
    .filter(
      (entry) =>
        entry.span.precision === 'day' &&
        entry.span.first >= today &&
        (entry.repeat !== 'weekly' || occurrences(entry).some((date) => date >= today))
    )
    .sort((a, b) => a.span.first.localeCompare(b.span.first))[0]
}

/**
 * One calendar's dated entries not yet over on `today`, earliest first.
 * @param {Calendar} calendar
 * @param {string} today
 * @param {Zones} zones
 */
export function upcomingEntries(calendar, today, zones) {
  return calendarMonths(calendar, today, zones)
    .flatMap((month) => month.entries)
    .filter((entry) => entry.span.precision === 'day' && entry.span.last >= today)
    .sort((a, b) => a.span.first.localeCompare(b.span.first) || a.id.localeCompare(b.id))
}

/**
 * A root-relative path as seen from another root-relative page path, so the
 * view's links survive a site's own link rewriting and a sub-path deploy.
 * Both are `/…/` folders or `/….html` files.
 * @param {string} from
 * @param {string} to
 */
export function relativePath(from, to) {
  const dir = (from.endsWith('/') ? from : from.slice(0, from.lastIndexOf('/') + 1)).split('/').filter(Boolean)
  const target = to.split('/').slice(1)
  let shared = 0
  while (shared < dir.length && shared < target.length - 1 && dir[shared] === target[shared]) shared++
  return `${'../'.repeat(dir.length - shared)}${target.slice(shared).join('/')}`
}

/**
 * @typedef {object} ViewOptions
 * @property {CalendarSelection} [calendars]
 * @property {boolean} [feeds]
 * @property {(ref: SourceRef) => ResolvedSource | undefined} resolveSource
 * @property {(calendar: Calendar) => string} pagePath  Root-relative folder of a calendar's own page, `/…/`.
 * @property {string} [from]  Root-relative path of the page the view is on; links are relative to it.
 * @property {(tag: ViewTag) => string} [tagPill]  A tag's pill as HTML, from the consumer's own pill renderer.
 */

/**
 * @typedef {object} ViewTag
 * @property {string} group  The tag group's key, e.g. `scenario`.
 * @property {string} groupLabel
 * @property {string} code   The short code shown as a pill, e.g. `A`.
 * @property {string} name   The code's name.
 * @property {string} [pill] The tag's pill as HTML, when the consumer supplies `tagPill`.
 */

/**
 * @typedef {object} ViewData
 * @property {boolean} [feeds]
 * @property {{ id: string, title: string, code: string, colour: number, group: string, page: string, count: number }[]} calendars
 * @property {ViewEntry[]} entries
 */

/**
 * @typedef {object} ViewEntry
 * @property {string} id
 * @property {string} calendar
 * @property {string} title
 * @property {EntrySpan['precision']} precision
 * @property {string} first
 * @property {string} last
 * @property {string} [time]
 * @property {string} kind
 * @property {string} kindLabel
 * @property {string} kindIcon
 * @property {string} status
 * @property {string} statusLabel
 * @property {Availability} availability
 * @property {string} availabilityLabel
 * @property {string} availabilityIcon
 * @property {string} [sourceStatus]
 * @property {string} description
 * @property {ViewTag[]} tags
 * @property {string[]} sources  Each source as one line: id, title (date), anchor.
 * @property {string} href       The entry on its calendar's page, relative to the view's page.
 */

/**
 * One source reference as one line: "<id> <title> (<as of>), <at>".
 * @param {SourceRef} ref
 * @param {ViewOptions['resolveSource']} resolveSource
 */
export function describeSource(ref, resolveSource) {
  const src = resolveSource(ref)
  if (!src) throw new Error(`calendar entry: unknown source ${ref.source}`)
  return `${ref.source} ${src.title}${src.asOf ? ` (${src.asOf})` : ''}${ref.at ? `, ${ref.at}` : ''}`
}

/**
 * An entry's tags with their group and name, in the set's group order.
 * @param {StoaCalendarSet} set
 * @param {Entry} entry
 * @returns {ViewTag[]}
 */
export function entryTags(set, entry) {
  return Object.entries(entry.tags ?? {}).flatMap(([group, codes]) => {
    const known = set.tagGroups?.[group]
    if (!known) throw new Error(`calendar entry ${entry.id}: unknown tag group ${group}`)
    return codes.map((code) => {
      const name = known.codes[code]
      if (name === undefined) throw new Error(`calendar entry ${entry.id}: unknown ${group} ${code}`)
      return { group, groupLabel: known.label, code, name }
    })
  })
}

/**
 * Everything the calendars view's Months and Runway views draw from. A
 * weekly entry is drawn as each of its occurrences, each linking to the
 * entry on its calendar's page.
 * @param {StoaCalendarSet} set
 * @param {ViewOptions} options
 * @returns {ViewData}
 */
export function calendarView(set, options) {
  set = selectCalendars(set, options.calendars)
  const from = options.from ?? '/'
  const { kinds, statuses } = vocabulary(set)
  const page = (/** @type {Calendar} */ calendar) => relativePath(from, `${options.pagePath(calendar)}index.html`)
  return {
    feeds: options.feeds !== false,
    calendars: set.calendars.map((calendar) => ({
      id: calendar.id,
      title: calendar.title,
      code: calendar.code,
      colour: calendar.colour,
      group: calendar.group ?? '',
      page: page(calendar),
      count: calendar.entries.length
    })),
    entries: set.calendars.flatMap((calendar) =>
      resolvedEntries(calendar).flatMap((entry) => {
        const span = entrySpan(entry)
        const time = timeLabel(entry, set)
        const weekly = entry.repeat === 'weekly'
        return (weekly ? occurrences(entry) : [span.first]).map((first) => ({
          id: weekly ? `${entry.id}--${first}` : entry.id,
          calendar: calendar.id,
          title: entry.title,
          precision: span.precision,
          first,
          last: weekly ? first : span.last,
          ...(time ? { time } : {}),
          kind: entry.kind,
          kindLabel: kinds[entry.kind].label,
          kindIcon: kinds[entry.kind].icon,
          status: entry.status,
          statusLabel: statuses[entry.status],
          availability: entry.availability,
          availabilityLabel: AVAILABILITY[entry.availability].label,
          availabilityIcon: AVAILABILITY[entry.availability].icon,
          ...(entry.sourceStatus ? { sourceStatus: entry.sourceStatus } : {}),
          description: entry.description,
          tags: entryTags(set, entry).map((tag) => (options.tagPill ? { ...tag, pill: options.tagPill(tag) } : tag)),
          sources: entry.sources.map((ref) => describeSource(ref, options.resolveSource)),
          href: `${page(calendar)}#${entry.id}`
        }))
      })
    )
  }
}

/**
 * JSON for a `<script type="application/json">` block: `<` is escaped so no
 * value can close the element early.
 * @param {unknown} value
 */
export const jsonForScript = (value) => JSON.stringify(value).replace(/</g, '\\u003c')

/**
 * @typedef {{include?: string[], exclude?: string[]}} CalendarSelection
 */
/** Select calendars in source order; exclusions win over inclusions.
 * @param {StoaCalendarSet} set
 * @param {CalendarSelection} [selection]
 * @returns {StoaCalendarSet}
 */
export function selectCalendars(set, selection) {
  if (!selection) return set
  const known = new Set(set.calendars.map((calendar) => calendar.id))
  for (const id of [...(selection.include ?? []), ...(selection.exclude ?? [])])
    if (!known.has(id)) throw new Error(`calendar filter: unknown calendar ${id}`)
  return {
    ...set,
    calendars: set.calendars.filter(
      (calendar) =>
        (selection.include === undefined || selection.include.includes(calendar.id)) &&
        !selection.exclude?.includes(calendar.id)
    )
  }
}
