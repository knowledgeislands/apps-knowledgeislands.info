// @ts-check
// The Stoa Calendar's vocabulary and validation. A set is checked whole
// before anything renders: unique ids, known kinds, statuses and tags, a
// colour slot, a busy or free default, and valid optional durations for timed entries.

import { entrySpan, entryTiming } from './dates.js'

/** @typedef {import('./types.js').StoaCalendarSet} StoaCalendarSet */
/** @typedef {import('./types.js').Calendar} Calendar */
/** @typedef {import('./types.js').Entry} Entry */
/** @typedef {import('./types.js').Availability} Availability */
/** @typedef {import('./types.js').KindWords} KindWords */

/** @type {readonly Availability[]} */
export const AVAILABILITIES = ['busy', 'free']

/** @type {Record<string, KindWords>} */
export const KINDS = {
  milestone: { label: 'Milestone', icon: 'flag' },
  deadline: { label: 'Deadline', icon: 'alarm-clock' },
  review: { label: 'Review', icon: 'clipboard-check' },
  meeting: { label: 'Meeting', icon: 'users' },
  event: { label: 'Event', icon: 'presentation' }
}

/** How firm a date is. The source's own words travel with each entry. */
/** @type {Record<string, string>} */
export const STATUSES = {
  confirmed: 'Confirmed',
  planned: 'Programme position',
  target: 'Target',
  proposed: 'Proposed',
  'to-confirm': 'To be confirmed'
}

/**
 * Busy blocks the time in a subscribed calendar; free shows the date without
 * blocking it. The page shows the word, so the icon is never the only cue.
 * @type {Record<Availability, { label: string, icon: string, hint: string }>}
 */
export const AVAILABILITY = {
  busy: { label: 'Busy', icon: 'square', hint: 'Shows as busy in a subscribed calendar' },
  free: { label: 'Free', icon: 'square-dashed', hint: 'Shows as free in a subscribed calendar' }
}

/** Colour slots the styles define: `--stoa-cal-1-*` to `--stoa-cal-8-*`. */
export const COLOUR_SLOTS = 8

/**
 * The set's vocabulary: the defaults, relabelled or extended by the set.
 * @param {Pick<StoaCalendarSet, 'vocab'>} set
 */
export function vocabulary(set) {
  return {
    kinds: { ...KINDS, ...(set.vocab?.kinds ?? {}) },
    statuses: { ...STATUSES, ...(set.vocab?.statuses ?? {}) },
    availability: AVAILABILITY
  }
}

/**
 * Reads a calendar's default availability, rejecting anything but busy or free.
 * @param {Pick<Calendar, 'id' | 'availability'>} calendar
 * @returns {Availability}
 */
export function calendarAvailability(calendar) {
  const value = calendar.availability
  if (!AVAILABILITIES.includes(value))
    throw new Error(`calendar ${calendar.id}: availability ${value} is not busy or free`)
  return value
}

/**
 * Whether an entry is busy or free: its own `availability`, else its
 * calendar's. Only an entry dated to the day may be busy; a month or a year
 * with no day fixed never blocks time.
 * @param {Pick<Calendar, 'id' | 'availability'>} calendar
 * @param {Pick<Entry, 'id' | 'start' | 'end' | 'availability'>} entry
 * @returns {Availability}
 */
export function entryAvailability(calendar, entry) {
  const value = entry.availability ?? calendarAvailability(calendar)
  if (!AVAILABILITIES.includes(value))
    throw new Error(`calendar entry ${entry.id}: availability ${value} is not busy or free`)
  if (value === 'busy' && entrySpan(entry).precision !== 'day')
    throw new Error(`calendar entry ${entry.id}: only an entry dated to the day may be busy`)
  return value
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Validates a whole set, throwing on the first problem, and returns it.
 * @param {StoaCalendarSet} set
 * @returns {StoaCalendarSet}
 */
export function validateSet(set) {
  const { kinds, statuses } = vocabulary(set)
  try {
    new Intl.DateTimeFormat('en-GB', { timeZone: set.timeZone })
    if (set.secondZone) new Intl.DateTimeFormat('en-GB', { timeZone: set.secondZone })
  } catch {
    throw new Error(`calendar set: unknown time zone ${set.timeZone} or ${set.secondZone}`)
  }
  const calendarIds = new Set()
  const entryIds = new Set()
  for (const calendar of set.calendars) {
    if (!SLUG.test(calendar.id)) throw new Error(`calendar ${calendar.id}: id is not URL-safe`)
    if (calendarIds.has(calendar.id)) throw new Error(`calendar ${calendar.id}: id is not unique`)
    calendarIds.add(calendar.id)
    if (!/^[A-Z0-9]{1,3}$/.test(calendar.code))
      throw new Error(`calendar ${calendar.id}: code ${calendar.code} is not 1–3 capitals or digits`)
    if (!Number.isInteger(calendar.colour) || calendar.colour < 1 || calendar.colour > COLOUR_SLOTS)
      throw new Error(`calendar ${calendar.id}: colour ${calendar.colour} is not a slot from 1 to ${COLOUR_SLOTS}`)
    calendarAvailability(calendar)
    for (const entry of calendar.entries) {
      if (!SLUG.test(entry.id)) throw new Error(`calendar entry ${entry.id}: id is not URL-safe`)
      if (entryIds.has(entry.id)) throw new Error(`calendar entry ${entry.id}: id is not unique`)
      entryIds.add(entry.id)
      if (!kinds[entry.kind]) throw new Error(`calendar entry ${entry.id}: unknown kind ${entry.kind}`)
      if (!statuses[entry.status]) throw new Error(`calendar entry ${entry.id}: unknown status ${entry.status}`)
      entrySpan(entry)
      entryTiming(entry)
      entryAvailability(calendar, entry)
      for (const [group, codes] of Object.entries(entry.tags ?? {})) {
        const known = set.tagGroups?.[group]
        if (!known) throw new Error(`calendar entry ${entry.id}: unknown tag group ${group}`)
        for (const code of codes)
          if (!(code in known.codes)) throw new Error(`calendar entry ${entry.id}: unknown ${group} ${code}`)
      }
      if (!entry.sources?.length) throw new Error(`calendar entry ${entry.id}: no source`)
    }
  }
  return set
}
