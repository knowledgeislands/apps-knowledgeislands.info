// @ts-check
import { esc } from '../internal/html.js'

/**
 * @typedef {object} NavLink
 * @property {string} name
 * @property {string} href
 * @property {string} [icon] Lucide name or trusted icon markup.
 * @property {boolean} [external]
 * @property {string[]} [activeFor] Additional section roots.
 */
/** @typedef {NavLink | {separator: true} | {groupId: string, groupName: string, groupIcon?: string, items: NavLink[]}} NavItem */
/**
 * @typedef {object} HeaderConfig
 * @property {{href: string, label: string, logo: {src: string, alt: string, width?: number, height?: number} | {markup: string}, tag?: string}} brand
 * @property {NavItem[]} nav
 * @property {string} currentUrl
 * @property {number} [collapseAt] Container width in pixels; 1100 by default.
 * @property {string} [id] Unique document id; stoa-header by default.
 * @property {string} [navLabel]
 * @property {string} [skipTo]
 * @property {boolean} [identity] The signed-in person's area, from the same origin's Access; true by default. A site
 *   with no Access in front of it sets false, so the Header never asks.
 */
/**
 * Trusted build markup. Search has two independently rendered triggers, avoiding duplicate ids.
 * @typedef {{search?: {compact: string, full: string}, prefs?: string, end?: string}} HeaderSlots
 */

/** @param {string} value */
function url(value) {
  if (
    [...value].some((char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127) ||
    /^(?!https?:)[a-z][a-z\d+.-]*:/i.test(value)
  ) {
    throw new Error('Header URLs must be relative or HTTP(S)')
  }
  return esc(value)
}
/** @param {string} value */
function id(value) {
  if (!/^[a-zA-Z][\w-]*$/.test(value))
    throw new Error('Header ids must start with a letter and contain word characters or hyphens')
  return value
}
/** @param {string} value */
const path = (value) => value.split(/[?#]/)[0].replace(/\/+$/, '') || '/'
/** @param {string} current @param {string} root */
const within = (current, root) => current === root || (root !== '/' && current.startsWith(`${root}/`))

/** @param {NavLink} link @param {string} currentUrl @returns {'page' | 'location' | undefined} */
export function headerCurrent(link, currentUrl) {
  if (link.external || /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(link.href)) return undefined
  const current = path(currentUrl)
  if (path(link.href) === current) return 'page'
  if ([link.href, ...(link.activeFor ?? [])].some((root) => within(current, path(root)))) return 'location'
  return undefined
}

/** @param {string | undefined} value */
function icon(value) {
  if (!value) return ''
  return `<span class="stoa-header__icon" aria-hidden="true">${value.trim().startsWith('<') ? value : `<i data-lucide="${esc(value)}"></i>`}</span>`
}
/** @param {NavLink} link @param {string} currentUrl */
function renderLink(link, currentUrl) {
  const current = headerCurrent(link, currentUrl)
  return `<a href="${url(link.href)}"${current ? ` aria-current="${current}"` : ''}${link.external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${icon(link.icon)}<span>${esc(link.name)}</span>${link.external ? '<span class="visually-hidden"> (opens in a new tab)</span>' : ''}</a>`
}

/** The instance-scoped container rule; no viewport or stylesheet breakpoint is hard-coded by a site.
 * @param {string} headerId @param {number} collapseAt
 */
export function headerCollapseRule(headerId, collapseAt) {
  id(headerId)
  if (!Number.isFinite(collapseAt) || collapseAt <= 0) throw new Error('collapseAt must be a positive finite number')
  const scope = `#${headerId}`
  return `@layer stoa-components { @container stoa-header (width < ${collapseAt}px) {
${scope} .stoa-header__row { flex-wrap: wrap; }
${scope} .stoa-header__panel { flex-basis: 100%; flex-direction: column; align-items: stretch; }
${scope} .stoa-header__links { flex-direction: column; align-items: stretch; }
${scope} .stoa-header__group-links { position: static; box-shadow: none; }
${scope} .stoa-header__full-search { display: none; }
${scope} .stoa-header__compact-search { display: flex; margin-inline-start: auto; }
${scope}[data-ready] .stoa-header__burger { display: inline-flex; }
${scope}[data-ready]:not([data-expanded]) .stoa-header__panel { display: none; }
} }`
}

/** Complete light-DOM markup, usable before or without an upgrade.
 * @param {HeaderConfig} config @param {HeaderSlots} [slots]
 */
export function renderHeader(config, slots = {}) {
  const headerId = id(config.id ?? 'stoa-header')
  const groupIds = new Set()
  const nav = config.nav
    .map((item) => {
      if ('separator' in item) return '<li class="stoa-header__separator" role="separator"></li>'
      if (!('groupId' in item)) return `<li>${renderLink(item, config.currentUrl)}</li>`
      const groupId = `${headerId}-group-${id(item.groupId)}`
      if (groupIds.has(groupId)) throw new Error('Header group ids must be unique')
      groupIds.add(groupId)
      return `<li class="stoa-header__group" data-header-group>
<span class="stoa-header__group-label">${icon(item.groupIcon)}${esc(item.groupName)}</span>
<button type="button" class="stoa-header__group-toggle" data-header-group-toggle aria-expanded="false" aria-controls="${groupId}">${icon(item.groupIcon)}${esc(item.groupName)} <span aria-hidden="true">▾</span></button>
<ul class="stoa-header__group-links" id="${groupId}">${item.items.map((link) => `<li>${renderLink(link, config.currentUrl)}</li>`).join('')}</ul></li>`
    })
    .join('')
  const logo = config.brand.logo
  const image =
    'markup' in logo
      ? logo.markup
      : `<img src="${url(logo.src)}" alt="${esc(logo.alt)}"${logo.width ? ` width="${esc(logo.width)}"` : ''}${logo.height ? ` height="${esc(logo.height)}"` : ''}>`
  return `<style>${headerCollapseRule(headerId, config.collapseAt ?? 1100)}</style>
<stoa-header id="${headerId}">
<header class="stoa-header__row">
<a class="stoa-header__skip" href="${url(config.skipTo ?? '#main')}">Skip to main content</a>
<a class="stoa-header__brand" href="${url(config.brand.href)}" aria-label="${esc(config.brand.label)}">${image}${config.brand.tag ? `<span class="stoa-header__tag">${esc(config.brand.tag)}</span>` : ''}</a>
${slots.search ? `<div class="stoa-header__compact-search">${slots.search.compact}</div>` : ''}
<button type="button" class="stoa-header__burger" data-header-burger aria-expanded="false" aria-controls="${headerId}-panel">Navigation <span aria-hidden="true">☰</span></button>
<div class="stoa-header__panel" id="${headerId}-panel">
<nav aria-label="${esc(config.navLabel ?? 'Main')}"><ul class="stoa-header__links">${nav}</ul></nav>
${slots.search ? `<div class="stoa-header__full-search">${slots.search.full}</div>` : ''}
${slots.prefs ? `<div class="stoa-header__prefs">${slots.prefs}</div>` : ''}
${slots.end ? `<div class="stoa-header__end">${slots.end}</div>` : ''}
</div>
${config.identity === false ? '' : '<span class="stoa-header__identity" data-header-identity hidden></span>'}
</header></stoa-header>`
}
