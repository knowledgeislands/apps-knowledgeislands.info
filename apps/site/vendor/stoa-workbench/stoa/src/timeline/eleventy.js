// @ts-check
import { zonedToday } from '../internal/calendar-day.js'
import { renderTimeline } from './render.js'
/**
 * @param {import('../internal/eleventy.js').StoaEleventyConfig} config
 * @param {Omit<import('./render.js').TimelineOptions, 'today'> & {set: import('../calendar/types.js').StoaCalendarSet | (() => import('../calendar/types.js').StoaCalendarSet), today?: string, now?: Date}} options
 */
export default function stoaTimeline(config, options) {
  config.addShortcode('stoaTimeline', (overrides = {}) => {
    const set = typeof options.set === 'function' ? options.set() : options.set
    return renderTimeline(set, {
      ...options,
      today: options.today ?? zonedToday(options.now ?? new Date(), set.timeZone),
      ...overrides
    })
  })
}
