// @ts-check
import { zonedToday } from './core.js'
import { renderTodayBoard } from './render.js'
/**
 * @param {import('../internal/eleventy.js').StoaEleventyConfig} config
 * @param {Omit<import('./render.js').TodayBoardOptions, 'today'> & {set: import('../calendar/types.js').StoaCalendarSet | (() => import('../calendar/types.js').StoaCalendarSet), today?: string, now?: Date}} options
 */
export default function stoaTodayBoard(config, options) {
  config.addShortcode('stoaTodayBoard', (overrides = {}) => {
    const set = typeof options.set === 'function' ? options.set() : options.set
    const { set: _set, now, ...renderOptions } = options
    return renderTodayBoard(set, {
      ...renderOptions,
      today: options.today ?? zonedToday(now ?? new Date(), set.timeZone),
      ...overrides
    })
  })
}
