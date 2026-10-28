// @ts-check
// @externalise candidate
// The Filter Bar: the query as plain functions, the markup a build writes,
// and <stoa-filter-bar>, which filters the items it finds.

export {
  activeFilters,
  commitTokens,
  isFieldToken,
  matches,
  norm,
  parseQuery,
  quickValues,
  shownText,
  togglePill
} from './core.js'
export { defineStoaFilterBar, StoaFilterBar } from './element.js'
export { FILTER_DEFAULTS, renderFilterBar } from './render.js'

/** @typedef {import('./core.js').FilterItem} FilterItem */
/** @typedef {import('./core.js').QueryToken} QueryToken */
/** @typedef {import('./core.js').QuickValue} QuickValue */
/** @typedef {import('./render.js').FilterBarConfig} FilterBarConfig */
/** @typedef {import('./render.js').FilterField} FilterField */
