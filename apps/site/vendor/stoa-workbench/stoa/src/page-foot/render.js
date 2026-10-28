// @ts-check
import { esc } from '../internal/html.js'

/** @typedef {import('../calendar/types.js').SourceRef} SourceRef */
/** @typedef {import('../calendar/types.js').ResolvedSource} ResolvedSource */
/**
 * @typedef {object} PageFootConfig
 * @property {SourceRef[]} [sources]
 * @property {(SourceRef & {text: string})[]} [pendingUpdates] Already expanded by the site adapter.
 * @property {string} [notes] Trusted, build-rendered HTML, never untrusted input.
 * @property {string} [canonicalNote] Trusted site-owned HTML.
 * @property {boolean} [showCanonicalNoteAlone] Render a canonical-only foot. Defaults to false.
 * @property {(ref: SourceRef) => ResolvedSource | undefined} [resolveSource]
 * @property {{notes?: string, sources?: string, pendingUpdates?: string}} [headings]
 * @property {string} [id] Heading prefix; unique per instance. Defaults to page-foot.
 */

/** Only relative and HTTP(S)/mail links are accepted. @param {string} value */
function href(value) {
  if (
    [...value].some((char) => char.charCodeAt(0) <= 32 || char.charCodeAt(0) === 127 || char === '\\') ||
    /^(?!https?:|mailto:)[a-z][a-z0-9+.-]*:/i.test(value)
  )
    throw new Error('page foot: unsafe URL')
  return esc(value)
}

/** @param {SourceRef} ref @param {PageFootConfig['resolveSource']} resolver */
function source(ref, resolver) {
  const resolved = resolver?.(ref)
  if (!resolved) throw new Error(`page foot: unknown source ${ref.source}`)
  const title = resolved.url ? `<a href="${href(resolved.url)}">${esc(resolved.title)}</a>` : esc(resolved.title)
  return `${title}${ref.at ? `, ${esc(ref.at)}` : ''}${resolved.asOf ? ` (${esc(resolved.asOf)})` : ''}`
}

/** Static content remains complete without definition or JavaScript. @param {PageFootConfig} [config] */
export function renderPageFoot(config = {}) {
  const id = config.id ?? 'page-foot'
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id)) throw new Error('page foot: invalid heading prefix')
  /** @param {string} key @param {string} title @param {string} body */
  const section = (key, title, body) =>
    `<section aria-labelledby="${id}-${key}"><h2 id="${id}-${key}">${esc(title)}</h2>${body}</section>`
  const notes = config.notes?.trim() ? section('notes', config.headings?.notes ?? 'Notes', config.notes) : ''
  const sources = config.sources?.length
    ? section(
        'sources',
        config.headings?.sources ?? 'Sources',
        `<ul>${config.sources.map((ref) => `<li>${source(ref, config.resolveSource)}</li>`).join('')}</ul>`
      )
    : ''
  const pending = config.pendingUpdates?.length
    ? section(
        'pending-updates',
        config.headings?.pendingUpdates ?? 'Pending updates',
        `<ul>${config.pendingUpdates.map((ref) => `<li>${esc(ref.text)} — ${source(ref, config.resolveSource)}</li>`).join('')}</ul>`
      )
    : ''
  const canonical = config.canonicalNote?.trim()
    ? `<div class="page-foot__canonical">${config.canonicalNote}</div>`
    : ''
  if (!notes && !sources && !pending && !(config.showCanonicalNoteAlone && canonical)) return ''
  return `<stoa-page-foot><footer class="page-foot" data-page-foot>${notes}${sources}${pending}${canonical}</footer></stoa-page-foot>`
}

/**
 * @typedef {object} SiteFooterConfig
 * @property {string} name
 * @property {string} [line]
 * @property {{label: string, url: string}[]} [links]
 * @property {{updated?: string, commit?: string, url?: string}} [build]
 * @property {{url: string, label?: string}} [shortcuts] Real help-page fallback; dialog upgrade uses the shared registry.
 */
/** @param {SiteFooterConfig} config */
export function renderSiteFooter(config) {
  const links = (config.links ?? []).map((link) => `<a href="${href(link.url)}">${esc(link.label)}</a>`)
  if (config.shortcuts)
    links.push(
      `<a href="${href(config.shortcuts.url)}" data-stoa-foot-shortcuts>${esc(config.shortcuts.label ?? 'Keyboard shortcuts')}</a>`
    )
  const build = config.build
  const stamp = build
    ? [
        build.updated ? `Last updated ${esc(build.updated)}` : '',
        build.commit
          ? `built from ${build.url ? `<a href="${href(build.url)}">${esc(build.commit)}</a>` : esc(build.commit)}`
          : ''
      ]
        .filter(Boolean)
        .join(' · ')
    : ''
  return `<stoa-page-foot><footer class="site-footer"><p>${esc(config.name)}</p>${config.line ? `<p>${esc(config.line)}</p>` : ''}${links.length ? `<nav aria-label="Footer">${links.join(' · ')}</nav>` : ''}${stamp ? `<p class="site-footer__build">${stamp}</p>` : ''}</footer></stoa-page-foot>`
}
