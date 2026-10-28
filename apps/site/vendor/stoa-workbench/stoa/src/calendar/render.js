// @ts-check
// The calendar's markup as pure functions, for a site's build or for
// <stoa-calendar> to draw from a model. What these return is complete
// without JavaScript: the panel links every calendar and its subscribe menu,
// and the List view carries every date. ./element.js adds the toggles, the
// collapsible panel and the Months and Runway views.
//
// Icons are `<i data-lucide="…">` placeholders; the site supplies the icons.

import { esc } from '../internal/html.js'
import { AVAILABILITY, entryAvailability, vocabulary } from './contract.js'
import {
  calendarAgenda,
  calendarGroups,
  calendarMonths,
  calendarView,
  entryTags,
  jsonForScript,
  MONTHS,
  nextEntry,
  selectCalendars,
  subscribeLinks
} from './view.js'

/** @typedef {import('./types.js').StoaCalendarSet} StoaCalendarSet */
/** @typedef {import('./types.js').Calendar} Calendar */
/** @typedef {import('./types.js').Entry} Entry */
/** @typedef {import('./types.js').SourceRef} SourceRef */
/** @typedef {import('./types.js').ResolvedSource} ResolvedSource */
/** @typedef {import('./types.js').Availability} Availability */
/** @typedef {import('./view.js').ViewTag} ViewTag */

/**
 * @typedef {object} RenderContext
 * @property {StoaCalendarSet} set
 * @property {string} siteUrl  The site's origin, without a trailing slash.
 * @property {(calendar: Calendar) => string} pagePath  Root-relative folder of a calendar's own page, `/…/`.
 * @property {(calendar: Calendar) => string} feedPath  Root-relative path of a calendar's feed, `/….ics`.
 * @property {(ref: SourceRef) => ResolvedSource | undefined} resolveSource
 * @property {boolean} [feeds] Subscription UI is enabled unless false.
 * @property {string} today  `YYYY-MM-DD`, the build's date; the element corrects it to the reader's.
 * @property {string} [from]  Root-relative path of the page the view is on.
 * @property {(tag: ViewTag) => string} [tagPill]  A tag's pill as HTML; defaults to its code.
 */

/**
 * A calendar's page, feed and subscribe links.
 * @param {Calendar} calendar
 * @param {RenderContext} ctx
 */
export function calendarLinks(calendar, ctx) {
  return {
    ...subscribeLinks(`${ctx.siteUrl}${ctx.feedPath(calendar)}`, calendar.title),
    page: ctx.pagePath(calendar),
    feed: ctx.feedPath(calendar)
  }
}

/** @param {string} what */
const STEPS_ITEMS = (what) => `<ul>
      <li><strong>Outlook for Windows or Mac:</strong> copy ${what}, then choose <em>Add calendar</em> › <em>Subscribe from web</em> (classic Outlook for Windows: <em>Home</em> › <em>Add Calendar</em> › <em>From Internet</em>), paste it and confirm.</li>
      <li><strong>Google Calendar:</strong> copy the feed URL, then beside <em>Other calendars</em> choose <em>+</em> › <em>From URL</em>, paste it and choose <em>Add calendar</em>.</li>
    </ul>`

/**
 * The ways to subscribe to one calendar's feed, for its own page. The element
 * wires the copy button; without it the URL is still selectable.
 * @param {Calendar} calendar
 * @param {RenderContext} ctx
 */
export function subscribeActions(calendar, ctx) {
  if (ctx.feeds === false) return ''
  const links = calendarLinks(calendar, ctx)
  const id = esc(calendar.id)
  return `<div class="calendar-subscribe" data-calendar-subscribe="${id}">
  <div class="calendar-subscribe__actions">
    <a class="calendar-action calendar-action--primary" href="${esc(links.webcal)}">
      <i data-lucide="calendar-plus" class="calendar-action__icon" aria-hidden="true"></i>Subscribe
    </a>
    <a class="calendar-action" href="${esc(links.google)}" target="_blank" rel="noopener noreferrer">Google Calendar</a>
    <a class="calendar-action" href="${esc(links.outlook365)}" target="_blank" rel="noopener noreferrer">Outlook / Microsoft 365</a>
    <a class="calendar-action" href="${esc(links.outlookCom)}" target="_blank" rel="noopener noreferrer">Outlook.com</a>
  </div>
  <div class="calendar-url">
    <label class="calendar-url__label" for="calendar-url-${id}">Feed URL</label>
    <div class="calendar-url__row">
      <input class="calendar-url__input" id="calendar-url-${id}" type="text" readonly value="${esc(links.https)}">
      <button class="calendar-action calendar-url__copy" type="button" data-copy-from="calendar-url-${id}">
        <i data-lucide="copy" class="calendar-action__icon" aria-hidden="true"></i><span data-copy-label>Copy</span>
      </button>
    </div>
  </div>
  <details class="calendar-steps">
    <summary>Subscribe by hand</summary>
    ${STEPS_ITEMS('the feed URL')}
    <p>Subscribed calendars update themselves when this site is published; the feed asks for a refresh every 12 hours, and Google refreshes on its own schedule, so a change can take longer to appear there.</p>
  </details>
</div>`
}

/**
 * The compact form of subscribeActions: a disclosure on each calendar in the
 * view's panel, so it works without JavaScript. The element lends the same
 * menu to the Runway lanes.
 * @param {Calendar} calendar
 * @param {RenderContext} ctx
 */
export function subscribeMenu(calendar, ctx) {
  if (ctx.feeds === false) return ''
  const links = calendarLinks(calendar, ctx)
  const id = esc(calendar.id)
  const title = esc(calendar.title)
  return `<details class="cal-sub" data-cal-sub="${id}">
  <summary class="cal-sub__button" title="Subscribe to ${title}">
    <i data-lucide="calendar-plus" class="cal-sub__icon" aria-hidden="true"></i><span class="visually-hidden">Subscribe to ${title}</span>
  </summary>
  <div class="cal-sub__menu" data-cal-sub-menu="${id}">
    <div class="cal-sub__head">
      <span class="cal-code cal-slot-${calendar.colour}" aria-hidden="true">${esc(calendar.code)}</span>
      <span><span class="cal-sub__eyebrow">Subscribe</span><span class="cal-sub__title">${title}</span></span>
    </div>
    <a class="calendar-action calendar-action--primary cal-sub__primary" href="${esc(links.webcal)}">
      <i data-lucide="calendar-plus" class="calendar-action__icon" aria-hidden="true"></i>Subscribe in your calendar app
    </a>
    <a class="cal-sub__item" href="${esc(links.google)}" target="_blank" rel="noopener noreferrer">Google Calendar</a>
    <a class="cal-sub__item" href="${esc(links.outlook365)}" target="_blank" rel="noopener noreferrer">Outlook / Microsoft 365</a>
    <a class="cal-sub__item" href="${esc(links.outlookCom)}" target="_blank" rel="noopener noreferrer">Outlook.com</a>
    <div class="calendar-url__row cal-sub__feed">
      <input class="calendar-url__input" id="cal-feed-${id}" type="text" readonly value="${esc(links.https)}" aria-label="Feed URL for ${title}">
      <button class="calendar-action calendar-url__copy" type="button" data-copy-from="cal-feed-${id}">
        <i data-lucide="copy" class="calendar-action__icon" aria-hidden="true"></i><span data-copy-label>Copy</span>
      </button>
    </div>
  </div>
</details>`
}

/**
 * @param {string} kind
 * @param {Pick<StoaCalendarSet, 'vocab'>} set
 */
export function kindLabel(kind, set) {
  const k = vocabulary(set).kinds[kind]
  return `<span class="calendar-kind"><i data-lucide="${esc(k.icon)}" class="calendar-kind__icon" aria-hidden="true"></i>${esc(k.label)}</span>`
}

/**
 * Busy or free, as a subscribed calendar shows the entry: an icon and a word,
 * in the kind label's muted style, so it adds no colour.
 * @param {Availability} availability
 */
export function availabilityLabel(availability, feeds = true) {
  const a = AVAILABILITY[availability]
  return `<span class="calendar-availability calendar-availability--${esc(availability)}" title="${esc(feeds ? a.hint : a.label)}"><i data-lucide="${esc(a.icon)}" class="calendar-availability__icon" aria-hidden="true"></i>${esc(a.label)}</span>`
}

/** The key to the busy and free labels, under a calendar's dates. */
export const availabilityKey = () =>
  `<p class="calendar-availability-key">${availabilityLabel('busy')} blocks the time in a subscribed calendar. ${availabilityLabel('free')} shows the date without blocking time.</p>`

/**
 * A status is a word as well as a colour, so it never relies on colour.
 * @param {string} status
 * @param {Pick<StoaCalendarSet, 'vocab'>} set
 */
export const statusBadge = (status, set) =>
  `<span class="calendar-status calendar-status--${esc(status)}">${esc(vocabulary(set).statuses[status])}</span>`

/** What an empty calendar shows in place of its dates. */
export const emptyNote = () =>
  '<p class="calendar-empty">No dates yet; subscribe to receive them when they are added.</p>'

/**
 * One source reference: its id, linked when the source has a URL, its title
 * and date, and the part cited.
 * @param {SourceRef} ref
 * @param {RenderContext} ctx
 */
export function cite(ref, ctx) {
  const src = ctx.resolveSource(ref)
  if (!src) throw new Error(`calendar entry: unknown source ${ref.source}`)
  const id = src.url
    ? `<a class="source-ref" href="${esc(src.url)}">${esc(ref.source)}</a>`
    : `<span class="source-ref">${esc(ref.source)}</span>`
  return `${id} ${esc(src.title)}${src.asOf ? ` (${esc(src.asOf)})` : ''}${ref.at ? `, ${esc(ref.at)}` : ''}`
}

/**
 * A tag as a named pill: the consumer's pill, or the code, then the name.
 * @param {ViewTag} tag
 * @param {RenderContext} ctx
 */
export function tagLabel(tag, ctx) {
  const pill = ctx.tagPill ? ctx.tagPill(tag) : `<span class="cal-tag__code">${esc(tag.code)}</span>`
  return `<span class="cal-tag cal-tag--named" title="${esc(tag.groupLabel)}">${pill} ${esc(tag.name)}</span>`
}

/**
 * A sentence pointing a page at one calendar. The title comes from the set,
 * so renaming a calendar never needs a page edit.
 * @param {string} id
 * @param {string} lead  HTML before the link.
 * @param {RenderContext} ctx
 */
export function calendarPointer(id, lead, ctx) {
  const calendar = ctx.set.calendars.find((c) => c.id === id)
  if (!calendar) throw new Error(`calendarPointer: unknown calendar ${id}`)
  return `<p class="calendar-pointer">${lead} <a href="${esc(ctx.pagePath(calendar))}" data-calendar-link="${esc(calendar.id)}">${esc(calendar.title)} calendar</a>${ctx.feeds === false ? '.' : ', which you can subscribe to in Outlook or Google Calendar.'}</p>`
}

const SHORT_WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * The dates of one calendar, month by month, for its own page.
 * @param {Calendar} calendar
 * @param {RenderContext} ctx
 */
export function renderCalendarDates(calendar, ctx) {
  const { set } = ctx
  const withAvailability = {
    entries: calendar.entries.map((e) => ({ ...e, availability: entryAvailability(calendar, e) }))
  }
  const months = calendarMonths(withAvailability, ctx.today, set)
  const lead =
    ctx.feeds === false
      ? calendar.entries.length
        ? ''
        : '<p class="calendar-empty">No dates yet.</p>'
      : calendar.entries.length
        ? availabilityKey()
        : emptyNote()
  return `${lead}${months
    .map(
      (month) => `
<h3 class="calendar-month" id="month-${esc(month.key)}">${esc(month.label)}</h3>
<ol class="calendar-list">${month.entries
        .map(
          (e) => `
  <li class="calendar-entry${e.past ? ' is-past' : ''}" id="${esc(e.id)}" data-calendar-last="${esc(e.span.last)}">
    <div class="calendar-entry__date">${esc(e.dateLabel)}${e.timeLabel ? `<span class="calendar-entry__time" data-cal-time>${esc(e.timeLabel)}</span>` : ''}</div>
    <div class="calendar-entry__body">
      <div class="calendar-entry__head">
        <span class="calendar-entry__title">${esc(e.title)}</span>
        ${statusBadge(e.status, set)}
      </div>
      <p class="calendar-entry__desc">${esc(e.description)}</p>
      <div class="calendar-entry__meta">
        ${kindLabel(e.kind, set)}
        ${availabilityLabel(e.availability, ctx.feeds)}${entryTags(set, e)
          .map((tag) => tagLabel(tag, ctx))
          .join('')}
        <span class="calendar-entry__source">${e.sources.map((ref) => cite(ref, ctx)).join('; ')}${e.sourceStatus ? `: “${esc(e.sourceStatus)}”` : ''}</span>
      </div>
    </div>
  </li>`
        )
        .join('')}
</ol>`
    )
    .join('')}`
}

/**
 * One calendar's own page body: its subscribe section and its dates, inside
 * a <stoa-calendar> that marks past dates by the reader's own date.
 * @param {Calendar} calendar
 * @param {RenderContext} ctx
 */
export function renderCalendarPage(calendar, ctx) {
  return `<stoa-calendar class="calendar-page">
${
  ctx.feeds === false
    ? ''
    : `<section class="calendar-section" id="subscribe">
  <h2 class="calendar-section__title"><i data-lucide="calendar-plus" aria-hidden="true"></i>Subscribe</h2>
  <p class="calendar-section__desc">Add these dates to Outlook or Google Calendar once; they update when the site does.</p>
  ${subscribeActions(calendar, ctx)}
</section>`
}
<section class="calendar-section" id="dates">
  <h2 class="calendar-section__title"><i data-lucide="calendar-days" aria-hidden="true"></i>Dates</h2>
  ${renderCalendarDates(calendar, ctx)}
</section>
</stoa-calendar>`
}

/**
 * @typedef {object} ViewChrome
 * @property {import('./view.js').CalendarSelection} [calendars] Include/exclude calendar ids in every part of this view.
 * @property {string} [intro]  HTML for the sentence above the next date.
 * @property {boolean} [embedded]  Drawn inside another page's content, not as the page.
 * @property {boolean} [bare]  Without the <stoa-calendar> around it, for the element to draw into itself.
 */

/**
 * Every calendar in the set in one view: the next date, the panel of
 * calendars with their subscribe menus, the List view of every date, and the
 * JSON the element draws Months and Runway from, all inside a
 * <stoa-calendar>. One view per page: its ids are fixed.
 * @param {RenderContext} ctx
 * @param {ViewChrome} [chrome]
 */
export function renderCalendarView(ctx, chrome = {}) {
  ctx = { ...ctx, set: selectCalendars(ctx.set, chrome.calendars) }
  const { set } = ctx
  const next = nextEntry(set.calendars, ctx.today, set)
  const nextHtml = next
    ? (() => {
        const d = new Date(`${next.span.first}T00:00:00Z`)
        const cal = set.calendars.find((c) => c.id === next.calendar.id)
        return `
    <a class="cal-next" href="${esc(ctx.pagePath(/** @type {Calendar} */ (cal)))}#${esc(next.id)}" data-cal-next>
      <span class="cal-next__date" data-cal-next-date>
        <span class="cal-next__wd">${SHORT_WEEKDAYS[d.getUTCDay()]}</span>
        <span class="cal-next__day">${d.getUTCDate()}</span>
        <span class="cal-next__mon">${MONTHS[d.getUTCMonth()].slice(0, 3)} ${d.getUTCFullYear()}</span>
      </span>
      <span class="cal-next__body">
        <span class="cal-next__eyebrow" data-cal-next-eyebrow>Next up</span>
        <span class="cal-next__title" data-cal-next-title>${esc(next.title)}</span>
        <span class="cal-next__meta" data-cal-next-meta>
          <span class="cal-code cal-slot-${next.calendar.colour}" title="${esc(next.calendar.title)}">${esc(next.calendar.code)}</span>
          ${statusBadge(next.status, set)}
        </span>
        <span class="cal-next__also" data-cal-next-also hidden></span>
      </span>
    </a>`
      })()
    : ''

  const panel = calendarGroups(set.calendars)
    .map(
      (group, i) => `
      <div class="cal-panel__group" role="group" aria-labelledby="cal-group-${i + 1}">
        <h3 class="cal-panel__group-title" id="cal-group-${i + 1}">${esc(group.label || 'Other')}</h3>
        <ul class="cal-panel__list">${group.calendars
          .map((calendar) => {
            const n = calendar.entries.length
            const id = esc(calendar.id)
            return `
          <li class="cal-row" data-calendar-card="${id}">
            <input class="cal-toggle cal-slot-${calendar.colour}" type="checkbox" id="cal-show-${id}" data-cal-toggle="${id}" checked hidden aria-label="Show ${esc(calendar.title)}">
            <span class="cal-code cal-slot-${calendar.colour}${n ? '' : ' cal-code--empty'}" aria-hidden="true">${esc(calendar.code)}</span>
            <span class="cal-row__text">
              <a class="cal-row__title" href="${esc(ctx.pagePath(calendar))}">${esc(calendar.title)}</a>
              ${n ? `<span class="cal-row__meta">${n} date${n === 1 ? '' : 's'}</span>` : '<span class="cal-row__meta cal-row__meta--empty">No dates yet</span>'}
            </span>
            ${subscribeMenu(calendar, ctx)}
          </li>`
          })
          .join('')}
        </ul>
      </div>`
    )
    .join('')

  const byId = new Map(set.calendars.map((c) => [c.id, c]))
  const list = calendarAgenda(set.calendars, ctx.today, set)
    .map(
      (month) => `
        <section class="cal-list-month" data-cal-list-month aria-labelledby="cal-list-${esc(month.key)}">
          <h3 class="cal-list-month__title" id="cal-list-${esc(month.key)}">${esc(month.label)}</h3>
          <ol class="cal-list">${month.entries
            .map(
              (e) => `
            <li class="cal-item${e.past ? ' is-past' : ''}" data-calendar="${esc(e.calendar.id)}" data-calendar-last="${esc(e.span.last)}" data-cal-entry="${esc(e.id)}">
              <span class="cal-item__date">${esc(e.dateLabel)}${e.timeLabel ? `<span class="cal-item__time" data-cal-time>${esc(e.timeLabel)}</span>` : ''}</span>
              <span class="cal-code cal-slot-${e.calendar.colour}" title="${esc(e.calendar.title)}">${esc(e.calendar.code)}</span>
              <span class="cal-item__body">
                <a class="cal-item__title" href="${esc(ctx.pagePath(/** @type {Calendar} */ (byId.get(e.calendar.id))))}#${esc(e.id)}" data-cal-open="${esc(e.id)}">${esc(e.title)}</a>
                <span class="cal-item__desc">${esc(e.description)}</span>
                <span class="cal-item__source">${esc(e.calendar.title)} · ${e.sources.map((ref) => cite(ref, ctx)).join('; ')}</span>
              </span>
              <span class="cal-item__tags">${kindLabel(e.kind, set)}${availabilityLabel(e.availability, ctx.feeds)}${statusBadge(e.status, set)}</span>
            </li>`
            )
            .join('')}
          </ol>
        </section>`
    )
    .join('')

  const data = calendarView(set, {
    resolveSource: ctx.resolveSource,
    pagePath: ctx.pagePath,
    from: ctx.from,
    tagPill: ctx.tagPill,
    feeds: ctx.feeds
  })

  const body = `<div class="cal-page${chrome.embedded ? ' cal-page--embedded' : ''}" data-cal-page>

  <div class="cal-top">
    <p class="cal-intro">${chrome.intro ?? ''}</p>${nextHtml}
  </div>

  <div class="cal-layout" data-cal-layout>

    <aside class="cal-panel" aria-labelledby="cal-panel-title" id="calendars">
      <div class="cal-panel__head">
        <h2 id="cal-panel-title">Calendars</h2>
        <button class="cal-panel__all" type="button" data-cal-show-all hidden>Show all</button>
      </div>${panel}
      ${
        ctx.feeds === false
          ? ''
          : `<p class="cal-panel__note">
        <i data-lucide="refresh-cw" class="cal-panel__note-icon" aria-hidden="true"></i>
        <span>A subscribed calendar updates itself. When a date here changes, it changes in your calendar app too; the feed asks for a refresh every 12 hours, and Google refreshes on its own schedule.</span>
      </p>
      <details class="calendar-steps cal-panel__steps">
        <summary>Subscribe by hand</summary>
        ${STEPS_ITEMS("a calendar's feed URL from its subscribe menu")}
      </details>`
      }
    </aside>

    <section class="cal-main" aria-labelledby="cal-dates-title">
      <h2 class="visually-hidden" id="cal-dates-title">Dates</h2>

      <div class="cal-toolbar" data-cal-toolbar hidden>
        <button class="cal-btn cal-btn--icon cal-panel-toggle" type="button" data-cal-panel-toggle aria-controls="calendars" aria-expanded="true" aria-label="Calendars panel" title="Hide or show the calendars panel"><i data-lucide="panel-left-close" class="cal-panel-toggle__close" aria-hidden="true"></i><i data-lucide="panel-left-open" class="cal-panel-toggle__open" aria-hidden="true"></i></button>
        <div class="cal-toolbar__nav" data-cal-nav>
          <button class="cal-btn cal-btn--icon" type="button" data-cal-step="-1" aria-label="Earlier"><i data-lucide="chevron-left" aria-hidden="true"></i></button>
          <button class="cal-btn" type="button" data-cal-today>Today</button>
          <button class="cal-btn cal-btn--icon" type="button" data-cal-step="1" aria-label="Later"><i data-lucide="chevron-right" aria-hidden="true"></i></button>
        </div>
        <p class="cal-toolbar__range" data-cal-range aria-live="polite"></p>
        <button class="cal-btn cal-btn--hidden" type="button" data-cal-hidden-note data-cal-show-all hidden></button>
        <div class="cal-tabs" role="tablist" aria-label="View">
          <button class="cal-tab" type="button" role="tab" id="cal-tab-months" aria-controls="cal-view-months" aria-selected="false" tabindex="-1" data-cal-tab="months"><i data-lucide="calendar-days" aria-hidden="true"></i>Months</button>
          <button class="cal-tab" type="button" role="tab" id="cal-tab-runway" aria-controls="cal-view-runway" aria-selected="false" tabindex="-1" data-cal-tab="runway"><i data-lucide="chart-gantt" aria-hidden="true"></i>Runway</button>
          <button class="cal-tab" type="button" role="tab" id="cal-tab-list" aria-controls="cal-view-list" aria-selected="true" data-cal-tab="list"><i data-lucide="list" aria-hidden="true"></i>List</button>
        </div>
      </div>

      <div class="cal-view cal-view--months" id="cal-view-months" role="tabpanel" aria-labelledby="cal-tab-months" data-cal-view="months" hidden></div>
      <div class="cal-view cal-view--runway" id="cal-view-runway" role="tabpanel" aria-labelledby="cal-tab-runway" data-cal-view="runway" hidden></div>

      <div class="cal-view cal-view--list" id="cal-view-list" data-cal-view="list">${list}
        ${ctx.feeds === false ? '' : availabilityKey()}
        <p class="cal-list-empty" data-cal-list-empty hidden>Every calendar is hidden. <button class="cal-link" type="button" data-cal-show-all>Show all</button></p>
      </div>

      <div class="cal-legend" data-cal-legend hidden>
        <span class="cal-legend__item"><span class="cal-legend__mark cal-legend__mark--firm" aria-hidden="true"></span>Confirmed</span>
        <span class="cal-legend__item"><span class="cal-legend__mark cal-legend__mark--prov" aria-hidden="true"></span>Provisional: any status but confirmed</span>
        <span class="cal-legend__item"><span class="cal-legend__mark cal-legend__mark--past" aria-hidden="true"></span>Past</span>
        <span class="cal-legend__item"><span class="cal-legend__band" aria-hidden="true"></span>Month or year known, day not fixed</span>
        <span class="cal-legend__item"><span class="cal-legend__today" aria-hidden="true"></span>Today</span>
        <span class="cal-legend__item">${availabilityLabel('busy', ctx.feeds)} or ${availabilityLabel('free', ctx.feeds)}${ctx.feeds === false ? '' : ' in a subscribed calendar'}, shown in each date's details</span>
      </div>
    </section>
  </div>

  <div class="cal-pop" data-cal-pop role="dialog" aria-labelledby="cal-pop-title" hidden></div>
</div>
<script type="application/json" data-cal-data>${jsonForScript(data)}</script>`
  return chrome.bare ? body : `<stoa-calendar>\n${body}\n</stoa-calendar>`
}
