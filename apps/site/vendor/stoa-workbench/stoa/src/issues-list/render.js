// @ts-check
import { esc } from '../internal/html.js'
import { loadIssues } from './loader.js'

/** @param {string} value */
const date = (value) => `<time datetime="${esc(value)}">${esc(value)}</time>`
/**
 * @typedef {{issue: string, area: string, owner: string, raised: string, resolved: string, forCall: string, note: string, update: string, links: string, nextCall: string, noUpcomingCall: string}} IssuesLabels
 */
const DEFAULT_LABELS = {
  issue: 'Issue',
  area: 'Area',
  owner: 'Owner',
  raised: 'Raised',
  resolved: 'Resolved',
  forCall: 'For call',
  note: 'Note',
  update: 'Update',
  links: 'Links',
  nextCall: 'Next call',
  noUpcomingCall: 'No upcoming call scheduled.'
}
/**
 * @typedef {import('./contract.js').IssuesOptions & {asOf: string, id?: string, title?: string | null, labels?: Partial<IssuesLabels>, columns?: {owner?: boolean, forCall?: boolean},
 * rowId?: (issue: import('./contract.js').Issue) => string,
 * itemAttributes?: (issue: import('./contract.js').Issue, source: Readonly<Record<string, unknown>>) => Record<string, string>}} IssuesRenderOptions
 */
/**
 * Complete static HTML. Text is escaped; explicit noteHtml/updateHtml are trusted site-rendered markup.
 * Supply distinct id prefixes when rendering multiple lists on one page.
 * @param {unknown} data
 * @param {IssuesRenderOptions} options
 */
export function renderIssuesList(data, options) {
  const model = loadIssues(data, options)
  const { columns = {} } = options
  if (!columns || typeof columns !== 'object' || Array.isArray(columns))
    throw new TypeError('columns must be an owner/forCall boolean record')
  for (const [key, value] of Object.entries(columns)) {
    if (!['owner', 'forCall'].includes(key) || typeof value !== 'boolean')
      throw new TypeError(`columns.${key} must be a supported boolean column option`)
  }
  const withOwner = columns.owner ?? model.issues.some((issue) => issue.owner !== undefined)
  const withForCall = columns.forCall ?? model.issues.some((issue) => issue.forCall !== undefined)
  // Validation preserves row order; grouping must not change source attribution.
  const sources = /** @type {{issues: Record<string, unknown>[]}} */ (data).issues
  const sourceById = new Map(model.issues.map((issue, index) => [issue.id, sources[index]]))
  const withUpdates = model.issues.some(
    (issue) => issue.update !== undefined || issue.updateHtml !== undefined || Boolean(issue.updates?.length)
  )
  const labels = { ...DEFAULT_LABELS, ...options.labels }
  for (const [key, label] of Object.entries(labels))
    if (typeof label !== 'string') throw new TypeError(`labels.${key} must be text`)
  const { id = 'issues', title = 'Issues' } = options
  if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(id))
    throw new TypeError('id must be a fragment-safe identifier starting with a letter')
  if (title !== null && typeof title !== 'string') throw new TypeError('title must be text or null')
  const rowIds = new Map(
    model.issues.map((issue) => {
      const row = options.rowId ? options.rowId(issue) : `${id}-row-${issue.id}`
      if (typeof row !== 'string' || !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(row))
        throw new TypeError('rowId must return a fragment-safe identifier starting with a letter')
      return [issue.id, row]
    })
  )
  if (new Set(rowIds.values()).size !== rowIds.size) throw new TypeError('rowId must return unique identifiers')
  /** @param {import('./contract.js').Issue} issue */
  const fragment = (issue) => esc(/** @type {string} */ (rowIds.get(issue.id)))
  const heading = title?.trim() ? `<h2 id="${esc(id)}-title">${esc(title)}</h2>` : ''
  const naming = heading ? `aria-labelledby="${esc(id)}-title"` : 'aria-label="Issues"'
  const summary = model.groups.map((group) => `${esc(group.label)}: ${model.counts[group.status]}`).join(' · ')
  const next = model.nextCall
    ? `${esc(labels.nextCall)}: ${date(model.nextCall.date)} (${model.nextCall.issues.length} ${model.nextCall.issues.length === 1 ? 'issue' : 'issues'}): ${model.nextCall.issues.map((issue) => `<a href="#${fragment(issue)}">${esc(issue.id)}: ${esc(issue.title)}</a>`).join(', ')}.`
    : esc(labels.noUpcomingCall)
  const groups = model.groups
    .filter((group) => group.issues.length)
    .map((group) => {
      const withResolved = group.closed && group.issues.some((issue) => issue.resolved !== undefined)
      const rows = group.issues
        .map(
          (
            issue
          ) => `<tr id="${fragment(issue)}"${rowAttributes(options.itemAttributes?.(issue, /** @type {Record<string, unknown>} */ (sourceById.get(issue.id))))}>
      <th scope="row"><span class="issues-list__id">${esc(issue.id)}</span> ${esc(issue.title)}</th>
      <td>${(Array.isArray(issue.area) ? issue.area : [issue.area]).map(esc).join(', ')}</td>${options.classifier ? `<td>${esc(issue.classification ?? '—')}</td>` : ''}${withOwner ? `<td>${issue.owner === undefined ? '—' : (Array.isArray(issue.owner) ? issue.owner : [issue.owner]).map(esc).join(', ')}</td>` : ''}<td>${issue.raised ? date(issue.raised) : '—'}</td>${withResolved ? `<td>${issue.resolved ? date(issue.resolved) : '—'}</td>` : ''}
      ${withForCall ? `<td>${issue.forCall ? date(issue.forCall) : '—'}</td>` : ''}<td class="issues-list__note${issue.noteHtml !== undefined ? ' issues-list__rich' : ''}">${issue.noteHtml ?? esc(issue.note ?? '')}</td>${withUpdates ? `<td class="issues-list__note${issue.updateHtml !== undefined ? ' issues-list__rich' : ''}">${issue.updateHtml ?? esc(issue.update ?? '')}${issue.updates?.length ? `<ol>${issue.updates.map((entry) => `<li>${date(entry.date)} <div${entry.html !== undefined ? ' class="issues-list__rich"' : ''}>${entry.html ?? esc(entry.text ?? '')}</div></li>`).join('')}</ol>` : ''}</td>` : ''}
      <td>${(issue.links ?? []).map((link) => `<a href="${esc(link.url)}">${esc(link.label)}</a>`).join(', ')}</td></tr>`
        )
        .join('')
      return `<div class="issues-list__scroll" role="region" aria-labelledby="${esc(id)}-group-${group.status}" tabindex="0"><table>
      <caption id="${esc(id)}-group-${group.status}">${esc(group.label)} (${group.issues.length})</caption>
      <thead><tr>${[labels.issue, labels.area, ...(options.classifier ? [options.classifier.label] : []), ...(withOwner ? [labels.owner] : []), labels.raised, ...(withResolved ? [labels.resolved] : []), ...(withForCall ? [labels.forCall] : []), labels.note, ...(withUpdates ? [labels.update] : []), labels.links].map((label) => `<th scope="col">${esc(label)}</th>`).join('')}</tr></thead>
      <tbody>${rows}</tbody></table></div>`
    })
    .join('')
  return `<section class="issues-list" ${naming}>${heading}
    <p>${model.total} issues · ${summary}</p><p>${next}</p>${model.total ? groups : '<p>No issues recorded.</p>'}</section>`
}

/** @param {Record<string, string> | undefined} attributes */
function rowAttributes(attributes) {
  if (attributes === undefined) return ''
  if (!attributes || typeof attributes !== 'object' || Array.isArray(attributes))
    throw new TypeError('itemAttributes must return an attribute record')
  return Object.entries(attributes)
    .map(([name, value]) => {
      if (!/^(?:data-[a-z0-9_-]+|aria-[a-z-]+|class|title)$/.test(name) || typeof value !== 'string')
        throw new TypeError(`itemAttributes contains an unsupported attribute: ${name}`)
      return ` ${name}="${esc(value)}"`
    })
    .join('')
}
