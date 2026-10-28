// @ts-check
// @externalise candidate
// The Stoa Calendar: the contract a site's calendar set keeps, its dates and
// ICS feed, the markup as pure functions for a build, and <stoa-calendar>,
// which upgrades that markup in the browser.

export {
  AVAILABILITIES,
  AVAILABILITY,
  COLOUR_SLOTS,
  calendarAvailability,
  entryAvailability,
  KINDS,
  STATUSES,
  validateSet,
  vocabulary
} from './contract.js'
export {
  addDays,
  clockIn,
  day,
  entrySpan,
  entryTiming,
  iso,
  occurrences,
  pad,
  timeLabel,
  WEEKDAYS,
  WEEKLY_OCCURRENCES,
  zonedInstant,
  zoneLabel,
  zoneOffset
} from './dates.js'
export {
  applyUpcoming,
  defineStoaCalendar,
  enhanceCalendarMarks,
  markPast,
  readerToday,
  StoaCalendar,
  wireCopyButtons
} from './element.js'
export {
  buildFeed,
  escapeText,
  foldLine,
  vtimezone
} from './ics.js'
export {
  availabilityKey,
  availabilityLabel,
  calendarLinks,
  calendarPointer,
  cite,
  emptyNote,
  kindLabel,
  renderCalendarDates,
  renderCalendarPage,
  renderCalendarView,
  statusBadge,
  subscribeActions,
  subscribeMenu,
  tagLabel
} from './render.js'
export {
  calendarAgenda,
  calendarGroups,
  calendarMonths,
  calendarSources,
  calendarView,
  dateLabel,
  describeSource,
  entryTags,
  jsonForScript,
  MONTHS,
  nextEntry,
  relativePath,
  resolvedEntries,
  seriesSpan,
  shortDay,
  subscribeLinks,
  upcomingEntries
} from './view.js'

/** @typedef {import('./types.js').StoaCalendarSet} StoaCalendarSet */
/** @typedef {import('./types.js').Calendar} Calendar */
/** @typedef {import('./types.js').Entry} Entry */
/** @typedef {import('./render.js').RenderContext} RenderContext */
