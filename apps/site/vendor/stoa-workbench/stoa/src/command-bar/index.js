// @ts-check
// @externalise later
// The Command Bar: matching as plain functions, the markup a build writes,
// and <stoa-command-bar>, which upgrades it.

export {
  badgesFor,
  fold,
  PER_GROUP,
  prepare,
  scoreEntry,
  search,
  showsCode,
  startsWord,
  statusText,
  subsequence,
  tokenScore
} from './core.js'
export { defineStoaCommandBar, StoaCommandBar } from './element.js'
export { DEFAULTS, renderCommandBar, renderCommandBarTrigger } from './render.js'

/** @typedef {import('./core.js').BarEntry} BarEntry */
/** @typedef {import('./core.js').PreparedEntry} PreparedEntry */
/** @typedef {import('./core.js').SearchGroup} SearchGroup */
/** @typedef {import('./core.js').SearchResult} SearchResult */
/** @typedef {import('./core.js').SearchOptions} SearchOptions */
/** @typedef {import('./render.js').CommandBarConfig} CommandBarConfig */
