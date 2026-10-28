// @ts-check
// The Stoa Calendar's data contract. A site's Calendar Adapter builds a
// StoaCalendarSet from its own registry; the unit validates it, renders
// it and writes each calendar's feed. Types only: this module exports nothing.

/** @typedef {'day' | 'month' | 'year'} Precision */
/** @typedef {'busy' | 'free'} Availability */

/**
 * @typedef {object} SourceRef
 * @property {string} source  The site's own source id.
 * @property {string} [at]    Where in the source, e.g. a row or a section.
 */

/**
 * @typedef {object} Entry
 * @property {string} id
 * @property {string} title
 * @property {string} [url]          Optional Today board link; omitted titles render as text unless the site maps a calendar page.
 * @property {string} description
 * @property {string} start          `YYYY-MM-DD`, or `YYYY-MM` / `YYYY` when the source gives no day.
 * @property {string} [end]          Last day, inclusive; only on a multi-day day entry.
 * @property {string} [time]         Start `HH:MM` in the set's `timeZone`; only on a single day.
 * @property {number} [duration]     Optional minutes after `time`; omitted means the end is unknown.
 * @property {string[]} [exdates] Occurrence dates to skip, YYYY-MM-DD in the set's time zone; recurring entries only.
 * @property {'weekly'} [repeat]     Repeats each week on its start's weekday; timed or all-day, single-day entries only.
 * @property {string} [until]        Last day a weekly entry may fall on, inclusive.
 * @property {string} kind           A key of the set's kinds vocabulary.
 * @property {string} status         A key of the set's statuses vocabulary.
 * @property {Availability} [availability]  Overrides the calendar's.
 * @property {string} [sourceStatus] The source's own words for the date's status.
 * @property {Record<string, string[]>} [tags]  Codes per tag group, e.g. `{ scenario: ['A'] }`.
 * @property {SourceRef[]} sources
 */

/**
 * @typedef {object} Calendar
 * @property {string} id
 * @property {string} title
 * @property {string} description
 * @property {string} [group]        Heading the calendar is listed under.
 * @property {string} code           Up to three characters shown beside its dates.
 * @property {number} colour         Colour slot 1–8: `--stoa-cal-<n>-*`.
 * @property {Availability} availability  Whether its entries block time, unless one says otherwise.
 * @property {Entry[]} entries
 */

/**
 * @typedef {object} KindWords
 * @property {string} label
 * @property {string} icon  A Lucide icon name; the site supplies the icons.
 */

/**
 * @typedef {object} Vocab
 * @property {Record<string, KindWords>} [kinds]
 * @property {Record<string, string>} [statuses]
 */

/**
 * @typedef {object} TagGroup
 * @property {string} label                 The group's name, e.g. "Scenario".
 * @property {Record<string, string>} codes Code → name, e.g. `{ A: 'Network Continuity' }`.
 */

/**
 * @typedef {object} StoaCalendarSet
 * @property {string} timeZone       IANA zone every `time` is written in.
 * @property {string} [secondZone]   A second zone each time is also shown in.
 * @property {Record<string, string>} [zoneLabels]  Words for a zone, e.g. `{ 'Europe/London': 'UK time' }`.
 * @property {{ kinds?: Record<string, KindWords>, statuses?: Record<string, string> }} [vocab]  Relabels or extends the defaults.
 * @property {Record<string, TagGroup>} [tagGroups]
 * @property {Calendar[]} calendars
 */

/**
 * @typedef {object} Zones
 * @property {string} timeZone
 * @property {string} [secondZone]
 * @property {Record<string, string>} [zoneLabels]
 */

/**
 * @typedef {object} EntrySpan
 * @property {Precision} precision
 * @property {string} first
 * @property {string} last
 * @property {string} endExclusive
 */

/**
 * @typedef {object} EntryTiming
 * @property {string} start  `HH:MM` in the set's zone.
 * @property {string} [end]
 * @property {number} [duration]
 * @property {boolean} weekly
 * @property {string} [until]
 */

/**
 * @typedef {object} ResolvedSource
 * @property {string} title
 * @property {string} [url]
 * @property {string} [asOf]  The date the source speaks for.
 */

export {}
