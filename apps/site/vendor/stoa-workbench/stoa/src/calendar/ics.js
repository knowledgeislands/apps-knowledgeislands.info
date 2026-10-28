// @ts-check
// RFC 5545 iCalendar output for one calendar. An entry is an all-day event
// unless it carries a `time`: a timed entry is written at that local time in
// the set's zone, with a TZID and the zone's VTIMEZONE, so it keeps its local
// time through the clock changes, and a weekly one carries an RRULE. Each
// event is busy (TRANSP:OPAQUE) or free (TRANSP:TRANSPARENT). No dependency:
// the format is small enough to write by hand and test line by line.

import { calendarAvailability, entryAvailability } from './contract.js'
import { day, entrySpan, entryTiming, pad, timeLabel, zonedInstant, zoneOffset } from './dates.js'

/** @typedef {import('./types.js').Calendar} Calendar */
/** @typedef {import('./types.js').Entry} Entry */
/** @typedef {import('./types.js').SourceRef} SourceRef */
/** @typedef {import('./types.js').Zones} Zones */

const CRLF = '\r\n'
const MAX_OCTETS = 75

/**
 * Escapes a TEXT value (RFC 5545 §3.3.11).
 * @param {string} text
 */
export const escapeText = (text) =>
  text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

/**
 * Folds one content line so no physical line exceeds 75 octets of UTF-8
 * (RFC 5545 §3.1). Continuations open with a space, which counts toward their
 * 75, and a multi-byte character is never split.
 * @param {string} line
 */
export function foldLine(line) {
  const encoder = new TextEncoder()
  const out = []
  let current = ''
  let octets = 0
  for (const char of line) {
    const size = encoder.encode(char).length
    if (octets + size > MAX_OCTETS) {
      out.push(current)
      current = ' '
      octets = 1
    }
    current += char
    octets += size
  }
  out.push(current)
  return out.join(CRLF)
}

/** @param {string} isoDate */
const basic = (isoDate) => isoDate.replaceAll('-', '')
/** @param {string} isoDate @param {string} hhmm */
const localStamp = (isoDate, hhmm) => `${basic(isoDate)}T${hhmm.replace(':', '')}00`
/** @param {Date} d */
const stamp = (d) =>
  d
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '')

/** @param {number} minutes */
const utcOffset = (minutes) =>
  `${minutes < 0 ? '-' : '+'}${pad(Math.floor(Math.abs(minutes) / 60))}${pad(Math.abs(minutes) % 60)}`

/** @param {string} zone @param {Date} instant */
const abbreviation = (zone, instant) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: zone, timeZoneName: 'short' })
    .formatToParts(instant)
    .find((part) => part.type === 'timeZoneName')?.value ?? utcOffset(zoneOffset(instant, zone))

/**
 * A zone's VTIMEZONE as RFC 5545 needs it beside a TZID. A zone with no
 * summer time gets a fixed STANDARD; a zone that follows the EU rule (summer
 * time from 01:00 UTC on the last Sunday of March to 01:00 UTC on the last
 * Sunday of October) gets that rule. Any other zone is refused: its rules
 * would need writing by hand.
 * @param {string} zone
 * @returns {string[]}
 */
export function vtimezone(zone) {
  const winter = zoneOffset(new Date('2026-01-15T12:00:00Z'), zone)
  const summer = zoneOffset(new Date('2026-07-15T12:00:00Z'), zone)
  const head = ['BEGIN:VTIMEZONE', `TZID:${zone}`, `X-LIC-LOCATION:${zone}`]
  if (winter === summer) {
    const name = abbreviation(zone, new Date('2026-01-15T12:00:00Z'))
    return [
      ...head,
      'BEGIN:STANDARD',
      `TZOFFSETFROM:${utcOffset(winter)}`,
      `TZOFFSETTO:${utcOffset(winter)}`,
      `TZNAME:${name}`,
      'DTSTART:19700101T000000',
      'END:STANDARD',
      'END:VTIMEZONE'
    ]
  }
  // The EU rule in 2026: 29 March and 25 October, each at 01:00 UTC.
  const eu =
    zoneOffset(new Date('2026-03-29T00:59:00Z'), zone) === winter &&
    zoneOffset(new Date('2026-03-29T01:01:00Z'), zone) === summer &&
    zoneOffset(new Date('2026-10-25T00:59:00Z'), zone) === summer &&
    zoneOffset(new Date('2026-10-25T01:01:00Z'), zone) === winter
  if (!eu) throw new Error(`calendar feed: no VTIMEZONE rule for ${zone}; only zones on the EU summer-time rule`)
  const local = (/** @type {number} */ offset) => `T${pad(1 + offset / 60)}0000`
  return [
    ...head,
    'BEGIN:DAYLIGHT',
    `TZOFFSETFROM:${utcOffset(winter)}`,
    `TZOFFSETTO:${utcOffset(summer)}`,
    `TZNAME:${abbreviation(zone, new Date('2026-07-15T12:00:00Z'))}`,
    `DTSTART:19700329${local(winter)}`,
    'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU',
    'END:DAYLIGHT',
    'BEGIN:STANDARD',
    `TZOFFSETFROM:${utcOffset(summer)}`,
    `TZOFFSETTO:${utcOffset(winter)}`,
    `TZNAME:${abbreviation(zone, new Date('2026-01-15T12:00:00Z'))}`,
    `DTSTART:19701025${local(summer)}`,
    'RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU',
    'END:STANDARD',
    'END:VTIMEZONE'
  ]
}

const BYDAY = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA']

/**
 * @typedef {object} FeedOptions
 * @property {string} siteUrl     Canonical origin; also the UID domain.
 * @property {string} pageUrl     Absolute URL of the calendar's page; each event links to its entry there.
 * @property {string} feedUrl     Absolute URL the feed itself is published at.
 * @property {Date} now           When the feed was generated, written as every event's DTSTAMP.
 * @property {Zones} zones        The set's zone, second zone and zone words.
 * @property {string} producer    The PRODID's owner, e.g. the site's name: `-//<producer>//<title>//EN`.
 * @property {(ref: SourceRef) => string} describeSource  One line naming an entry's source and its date.
 * @property {(status: string) => string} statusLabel     Words for an entry's status.
 */

/**
 * The feed for one calendar. Entries with only a year are left out: a
 * subscribed calendar cannot show "some time in 2027", and the page lists
 * them instead. A month entry spans its whole month and says so in its title.
 * @param {Calendar} calendar
 * @param {FeedOptions} options
 */
export function buildFeed(calendar, options) {
  const host = new URL(options.siteUrl).host
  const dtstamp = stamp(options.now)
  const zone = options.zones.timeZone
  calendarAvailability(calendar)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    `PRODID:-//${escapeText(options.producer)}//${escapeText(calendar.title)}//EN`,
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `NAME:${escapeText(calendar.title)}`,
    `X-WR-CALNAME:${escapeText(calendar.title)}`,
    `DESCRIPTION:${escapeText(calendar.description)}`,
    `X-WR-CALDESC:${escapeText(calendar.description)}`,
    `URL;VALUE=URI:${options.pageUrl}`,
    `SOURCE;VALUE=URI:${options.feedUrl}`,
    'REFRESH-INTERVAL;VALUE=DURATION:PT12H',
    'X-PUBLISHED-TTL:PT12H'
  ]
  if (calendar.entries.some((entry) => entryTiming(entry))) lines.push(...vtimezone(zone))
  for (const entry of calendar.entries) {
    const span = entrySpan(entry)
    if (span.precision === 'year') continue
    const summary = span.precision === 'month' ? `${entry.title} (day to be confirmed)` : entry.title
    const link = `${options.pageUrl}#${entry.id}`
    const timing = entryTiming(entry)
    const when = timeLabel(entry, options.zones)
    const description = [
      ...(when ? [`${when}, a fixed local time through the clock changes.`] : []),
      entry.description,
      `Status: ${options.statusLabel(entry.status)}.`,
      `Source: ${entry.sources.map(options.describeSource).join('; ')}.`,
      link
    ].join('\n\n')
    lines.push(
      'BEGIN:VEVENT',
      `UID:${entry.id}@${host}`,
      `DTSTAMP:${dtstamp}`,
      ...(timing
        ? [
            `DTSTART;TZID=${zone}:${localStamp(span.first, timing.start)}`,
            ...(timing.end ? [`DTEND;TZID=${zone}:${localStamp(span.first, timing.end)}`] : [])
          ]
        : [`DTSTART;VALUE=DATE:${basic(span.first)}`, `DTEND;VALUE=DATE:${basic(span.endExclusive)}`]),
      ...(entry.repeat === 'weekly'
        ? [
            `RRULE:FREQ=WEEKLY;BYDAY=${BYDAY[day(span.first).getUTCDay()]}${entry.until ? `;UNTIL=${timing ? stamp(zonedInstant(entry.until, timing.start, zone)) : basic(entry.until)}` : ''}`
          ]
        : []),
      ...(entry.exdates?.length
        ? [
            timing
              ? `EXDATE;TZID=${zone}:${[...new Set(entry.exdates)].map((date) => localStamp(date, timing.start)).join(',')}`
              : `EXDATE;VALUE=DATE:${[...new Set(entry.exdates)].map(basic).join(',')}`
          ]
        : []),
      `SUMMARY:${escapeText(summary)}`,
      `DESCRIPTION:${escapeText(description)}`,
      `CATEGORIES:${escapeText(entry.kind)}`,
      `STATUS:${entry.status === 'confirmed' ? 'CONFIRMED' : 'TENTATIVE'}`,
      // Busy blocks the time in a subscriber's calendar; free shows the date
      // without blocking it (RFC 5545 §3.8.2.7).
      `TRANSP:${entryAvailability(calendar, entry) === 'busy' ? 'OPAQUE' : 'TRANSPARENT'}`,
      `URL;VALUE=URI:${link}`,
      'END:VEVENT'
    )
  }
  // RFC 5545 requires at least one component; a calendar with no dated
  // events yet carries a fixed UTC VTIMEZONE so strict clients still accept it.
  if (!lines.includes('BEGIN:VEVENT')) {
    lines.push(
      'BEGIN:VTIMEZONE',
      'TZID:UTC',
      'BEGIN:STANDARD',
      'DTSTART:19700101T000000',
      'TZOFFSETFROM:+0000',
      'TZOFFSETTO:+0000',
      'TZNAME:UTC',
      'END:STANDARD',
      'END:VTIMEZONE'
    )
  }
  lines.push('END:VCALENDAR')
  return lines.map(foldLine).join(CRLF) + CRLF
}
