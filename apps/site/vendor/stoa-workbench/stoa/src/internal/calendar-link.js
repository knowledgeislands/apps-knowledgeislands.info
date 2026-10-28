// @ts-check
import { esc } from './html.js'

/** Relative and HTTP(S) links only. @param {string} url */
export function calendarHref(url) {
  if (
    [...url].some((char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127 || char === '\\') ||
    /^(?!https?:)[a-z][a-z0-9+.-]*:/i.test(url)
  )
    throw new Error('calendar view: unsafe URL')
  return esc(url)
}
