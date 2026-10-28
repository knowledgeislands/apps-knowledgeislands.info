// @ts-check
// The Stoa Calendar as an Eleventy plugin. It checks the set at build time,
// writes each calendar's ICS feed as a virtual template, and gives the pages
// shortcodes for the view, a calendar's page, its dates and a pointer to it.
// "Today" is the build's date; <stoa-calendar> corrects it to the reader's.
//
//   import stoaCalendar from 'stoa/calendar/eleventy'
//   eleventyConfig.addPlugin(stoaCalendar, { set, siteUrl, producer, resolveSource })
//
//   {% stoaCalendarView page.url %}        every calendar, as one view
//   {% stoaCalendarPage "meetings" %}      one calendar's subscribe actions and dates
//   {% stoaCalendarDates "meetings" %}     one calendar's dates alone
//   {% stoaCalendarPointer "meetings", "The dates are in the" %}

import { STATUSES, validateSet, vocabulary } from './contract.js'
import { buildFeed } from './ics.js'
import { calendarPointer, renderCalendarDates, renderCalendarPage, renderCalendarView } from './render.js'
import { describeSource } from './view.js'

/** @typedef {import('./types.js').StoaCalendarSet} StoaCalendarSet */
/** @typedef {import('./types.js').Calendar} Calendar */
/** @typedef {import('./types.js').SourceRef} SourceRef */
/** @typedef {import('./types.js').ResolvedSource} ResolvedSource */
/** @typedef {import('./render.js').RenderContext} RenderContext */
/** @typedef {import('./view.js').ViewTag} ViewTag */

/**
 * @typedef {object} StoaCalendarOptions
 * @property {StoaCalendarSet | (() => StoaCalendarSet)} set  The calendar set, or a function that reads it.
 * @property {string} siteUrl  The site's origin, without a trailing slash.
 * @property {string} producer  The feeds' PRODID owner, e.g. the site's name.
 * @property {(ref: SourceRef) => ResolvedSource | undefined} [resolveSource]  Defaults to none: a set with sources must pass one.
 * @property {(calendar: Calendar) => string} [pagePath]  Defaults to `/calendars/<id>/`.
 * @property {(calendar: Calendar) => string} [feedPath]  Defaults to `/calendars/<id>.ics`.
 * @property {(tag: ViewTag) => string} [tagPill]  A tag's pill as HTML; defaults to its code.
 * @property {boolean} [feeds]  Write each calendar's feed; true by default.
 * @property {Date} [now]  The build's time; defaults to now.
 */

/** @param {Calendar} c */
const defaultPagePath = (c) => `/calendars/${c.id}/`
/** @param {Calendar} c */
const defaultFeedPath = (c) => `/calendars/${c.id}.ics`

/**
 * The render context the shortcodes share, from the plugin's options.
 * @param {StoaCalendarOptions} options
 * @returns {RenderContext}
 */
export function renderContext(options) {
  const set = typeof options.set === 'function' ? options.set() : options.set
  const now = options.now ?? new Date()
  return {
    set,
    siteUrl: options.siteUrl,
    pagePath: options.pagePath ?? defaultPagePath,
    feedPath: options.feedPath ?? defaultFeedPath,
    resolveSource: options.resolveSource ?? (() => undefined),
    today: now.toISOString().slice(0, 10),
    feeds: options.feeds,
    tagPill: options.tagPill
  }
}

/**
 * A calendar's ICS feed, from the plugin's render context.
 * @param {Calendar} calendar
 * @param {RenderContext} ctx
 * @param {{ producer: string, now: Date }} feed
 */
export function calendarFeed(calendar, ctx, feed) {
  const statuses = vocabulary(ctx.set).statuses
  return buildFeed(calendar, {
    siteUrl: ctx.siteUrl,
    pageUrl: `${ctx.siteUrl}${ctx.pagePath(calendar)}`,
    feedUrl: `${ctx.siteUrl}${ctx.feedPath(calendar)}`,
    now: feed.now,
    zones: ctx.set,
    producer: feed.producer,
    describeSource: (ref) => describeSource(ref, ctx.resolveSource),
    statusLabel: (status) => statuses[status] ?? STATUSES[/** @type {keyof typeof STATUSES} */ (status)] ?? status
  })
}

/**
 * @param {import('../internal/eleventy.js').StoaEleventyConfig} eleventyConfig
 * @param {StoaCalendarOptions} options
 */
export default function stoaCalendar(eleventyConfig, options) {
  const now = options.now ?? new Date()
  const ctx = renderContext({ ...options, now })
  validateSet(ctx.set)

  /** @param {string} id */
  const calendar = (id) => {
    const found = ctx.set.calendars.find((c) => c.id === id)
    if (!found) throw new Error(`stoa calendar: unknown calendar ${id}`)
    return found
  }

  eleventyConfig.addShortcode(
    'stoaCalendarView',
    (
      /** @type {string} */ from,
      /** @type {string} */ intro,
      /** @type {boolean} */ embedded,
      /** @type {import('./view.js').CalendarSelection} */ calendars
    ) => renderCalendarView({ ...ctx, from }, { intro, embedded, calendars })
  )
  eleventyConfig.addShortcode('stoaCalendarPage', (/** @type {string} */ id) => renderCalendarPage(calendar(id), ctx))
  eleventyConfig.addShortcode('stoaCalendarDates', (/** @type {string} */ id) => renderCalendarDates(calendar(id), ctx))
  eleventyConfig.addShortcode('stoaCalendarPointer', (/** @type {string} */ id, /** @type {string} */ lead) =>
    calendarPointer(id, lead, ctx)
  )
  eleventyConfig.addGlobalData('stoaCalendars', () =>
    ctx.set.calendars.map((c) => ({
      id: c.id,
      title: c.title,
      page: ctx.pagePath(c),
      ...(ctx.feeds === false ? {} : { feed: ctx.feedPath(c) })
    }))
  )

  if (options.feeds === false) return
  if (!eleventyConfig.addTemplate) throw new Error('Stoa virtual templates require Eleventy 3.1 or later')
  for (const cal of ctx.set.calendars) {
    eleventyConfig.addTemplate(`stoa-calendar-feeds/${cal.id}.11ty.js`, {
      data: { permalink: ctx.feedPath(cal), layout: false, eleventyExcludeFromCollections: true },
      render: () => calendarFeed(cal, ctx, { producer: options.producer, now })
    })
  }
}
