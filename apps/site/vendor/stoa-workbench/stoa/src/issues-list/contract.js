// @ts-check
/** @typedef {{date: string, text?: string, html?: string}} IssueUpdate */
/** @typedef {string} IssueStatus */
/** @typedef {{value: string, label: string, closed: boolean}} IssueStatusDefinition */
/** @typedef {{areas: readonly string[], splitArea?: (value: string) => readonly string[], statuses?: readonly IssueStatusDefinition[], strict?: boolean, classifier?: {label: string, values: readonly string[]}}} IssuesOptions */
/**
 * @typedef {object} Issue
 * @property {string} id Unique within the list; used as a row fragment.
 * @property {string} title
 * @property {IssueStatus} status
 * @property {string | string[]} area One or more of the site's configured areas.
 * @property {string | string[]} [owner] Required in strict validation.
 * @property {string} [classification] Value from the optional second classifier.
 * @property {string} [raised] ISO calendar date, YYYY-MM-DD.
 * @property {string} [resolved] ISO calendar date, displayed in closed groups.
 * @property {string} [forCall] ISO calendar date, YYYY-MM-DD.
 * @property {string} [note] Plain text, possibly empty; may be omitted when noteHtml is provided.
 * @property {string} [noteHtml] Trusted rendered HTML, overrides note.
 * @property {string} [update] Plain update text.
 * @property {string} [updateHtml] Trusted rendered HTML, overrides update.
 * @property {IssueUpdate[]} [updates] Dated history, preserved in supplied order; html is trusted site-rendered markup.
 * @property {{label: string, url: string}[]} [links]
 */
/** @typedef {{issues: Issue[]}} IssuesData */
export const ISSUE_STATUSES = /** @type {const} */ (['open', 'doing', 'done', 'dropped'])

/** Default vocabulary, in display order. */
export const DEFAULT_ISSUE_STATUSES = Object.freeze(
  [
    { value: 'open', label: 'Open', closed: false },
    { value: 'doing', label: 'Doing', closed: false },
    { value: 'done', label: 'Done', closed: true },
    { value: 'dropped', label: 'Dropped', closed: true }
  ].map((status) => Object.freeze(status))
)

/** @param {readonly IssueStatusDefinition[]} [statuses] */
export function resolveIssueStatuses(statuses = DEFAULT_ISSUE_STATUSES) {
  if (
    !Array.isArray(statuses) ||
    !statuses.length ||
    statuses.some(
      (status) =>
        !object(status) ||
        typeof status.value !== 'string' ||
        !/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(status.value) ||
        !text(status.label) ||
        typeof status.closed !== 'boolean'
    ) ||
    new Set(statuses.map((status) => status.value)).size !== statuses.length
  )
    throw new TypeError('statuses must contain unique fragment-safe values, labels and closed flags')
  return statuses
}

/** @param {unknown} value @returns {value is Record<string, unknown>} */
const object = (value) => value !== null && typeof value === 'object' && !Array.isArray(value)
/** @param {unknown} value @returns {value is string} */
const text = (value) => typeof value === 'string' && value.trim().length > 0
/** @param {unknown} value @returns {value is string} */
export function isIssueDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}
/** Relative URLs and HTTP(S); reject executable schemes and ambiguous whitespace.
 * @param {unknown} value @returns {value is string}
 */
export function isIssueUrl(value) {
  if (
    !text(value) ||
    /[\s\\]/.test(value) ||
    value.startsWith('//') ||
    Array.from(value).some((char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127)
  )
    return false
  if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol)
    } catch {
      return false
    }
  }
  return true
}

/**
 * A plain build-time validator: no schema-library dependency or consumer z version coupling.
 * Returns a fresh typed copy; throws TypeError with the failing field on invalid input.
 * @param {unknown} data
 * @param {IssuesOptions} options
 * @returns {IssuesData}
 */
export function validateIssues(data, { areas, statuses, strict = false, classifier, splitArea }) {
  if (splitArea !== undefined && typeof splitArea !== 'function') throw new TypeError('splitArea must be a function')
  if (typeof strict !== 'boolean') throw new TypeError('strict must be a boolean')
  const vocabulary = resolveIssueStatuses(statuses)
  if (
    classifier !== undefined &&
    (!object(classifier) ||
      !text(classifier.label) ||
      !Array.isArray(classifier.values) ||
      !classifier.values.length ||
      !classifier.values.every(text) ||
      new Set(classifier.values).size !== classifier.values.length)
  )
    throw new TypeError('classifier must have a label and unique non-empty values')
  if (
    !Array.isArray(areas) ||
    !areas.length ||
    areas.some((area) => !text(area)) ||
    new Set(areas).size !== areas.length
  ) {
    throw new TypeError('areas must be a non-empty list of unique names')
  }
  if (!object(data) || !Array.isArray(data.issues)) throw new TypeError('issues must be an array')
  if (strict) rejectUnknown(data, ['issues'], 'data')
  const seen = new Set()
  const issues = data.issues.map((raw, index) => {
    const at = `issues[${index}]`
    if (!object(raw)) throw new TypeError(`${at} must be an object`)
    if (strict)
      rejectUnknown(
        raw,
        [
          'id',
          'title',
          'status',
          'area',
          'owner',
          'raised',
          'resolved',
          'forCall',
          'note',
          'noteHtml',
          'update',
          'updateHtml',
          'updates',
          'classification',
          'links'
        ],
        at
      )
    for (const field of ['id', 'title']) {
      if (!text(raw[field])) throw new TypeError(`${at}.${field} must be non-empty text`)
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(String(raw.id)))
      throw new TypeError(`${at}.id must be a fragment-safe identifier starting with a letter`)
    if (seen.has(raw.id)) throw new TypeError(`${at}.id is duplicated: ${raw.id}`)
    seen.add(raw.id)
    if (!vocabulary.some((status) => status.value === raw.status)) throw new TypeError(`${at}.status is unknown`)
    const area = typeof raw.area === 'string' && splitArea ? splitArea(raw.area) : raw.area
    const areaValues = Array.isArray(area) ? area : [area]
    if (
      (splitArea && typeof raw.area === 'string' && !Array.isArray(area)) ||
      !areaValues.length ||
      !areaValues.every((value) => text(value) && areas.includes(value)) ||
      new Set(areaValues).size !== areaValues.length
    )
      throw new TypeError(`${at}.area is unknown or contains empty or duplicate values`)

    if (raw.raised !== undefined && !isIssueDate(raw.raised))
      throw new TypeError(`${at}.raised must be an ISO calendar date`)
    if (raw.resolved !== undefined && !isIssueDate(raw.resolved))
      throw new TypeError(`${at}.resolved must be an ISO calendar date`)
    if (raw.forCall !== undefined && !isIssueDate(raw.forCall))
      throw new TypeError(`${at}.forCall must be an ISO calendar date`)
    if (
      (strict || raw.owner !== undefined) &&
      !(text(raw.owner) || (Array.isArray(raw.owner) && raw.owner.length > 0 && raw.owner.every(text)))
    )
      throw new TypeError(`${at}.owner must be non-empty text or a non-empty list of names`)
    if (typeof raw.note !== 'string' && !(raw.note === undefined && typeof raw.noteHtml === 'string'))
      throw new TypeError(`${at}.note must be plain text or have noteHtml`)
    for (const field of ['noteHtml', 'update', 'updateHtml'])
      if (raw[field] !== undefined && typeof raw[field] !== 'string') throw new TypeError(`${at}.${field} must be text`)
    if (raw.updates !== undefined) {
      if (!Array.isArray(raw.updates)) throw new TypeError(`${at}.updates must be an array`)
      raw.updates.forEach((entry, index) => {
        const where = `${at}.updates[${index}]`
        if (!object(entry) || !isIssueDate(entry.date))
          throw new TypeError(`${where}.date must be an ISO calendar date`)
        if (typeof entry.text !== 'string' && typeof entry.html !== 'string')
          throw new TypeError(`${where} must have text or html`)
        for (const key of ['text', 'html'])
          if (entry[key] !== undefined && typeof entry[key] !== 'string')
            throw new TypeError(`${where}.${key} must be text`)
        if (strict) rejectUnknown(entry, ['date', 'text', 'html'], where)
      })
    }
    if (
      raw.classification !== undefined &&
      (typeof raw.classification !== 'string' || !classifier?.values.includes(raw.classification))
    )
      throw new TypeError(`${at}.classification must be a configured value`)
    if (
      raw.links !== undefined &&
      (!Array.isArray(raw.links) ||
        raw.links.some((link) => !object(link) || !text(link.label) || !isIssueUrl(link.url)))
    ) {
      throw new TypeError(`${at}.links must contain labelled relative or HTTP(S) URLs`)
    }
    if (strict && Array.isArray(raw.links))
      raw.links.forEach((link, index) => {
        rejectUnknown(link, ['label', 'url'], `${at}.links[${index}]`)
      })
    return /** @type {Issue} */ ({
      id: raw.id,
      title: raw.title,
      status: raw.status,
      area: Array.isArray(area) ? [...area] : area,
      ...(raw.owner !== undefined ? { owner: Array.isArray(raw.owner) ? [...raw.owner] : raw.owner } : {}),
      ...(raw.classification !== undefined ? { classification: raw.classification } : {}),
      ...(raw.resolved !== undefined ? { resolved: raw.resolved } : {}),
      ...(raw.raised !== undefined ? { raised: raw.raised } : {}),
      note: raw.note ?? '',
      ...(raw.noteHtml !== undefined ? { noteHtml: raw.noteHtml } : {}),
      ...(raw.updates !== undefined
        ? {
            updates: raw.updates.map((/** @type {IssueUpdate} */ entry) => ({
              date: entry.date,
              ...(entry.text !== undefined ? { text: entry.text } : {}),
              ...(entry.html !== undefined ? { html: entry.html } : {})
            }))
          }
        : {}),
      ...(raw.update !== undefined ? { update: raw.update } : {}),
      ...(raw.updateHtml !== undefined ? { updateHtml: raw.updateHtml } : {}),
      ...(raw.forCall !== undefined ? { forCall: raw.forCall } : {}),
      ...(raw.links !== undefined
        ? {
            links: raw.links.map((/** @type {{label: string, url: string}} */ link) => ({
              label: link.label,
              url: link.url
            }))
          }
        : {})
    })
  })
  return { issues }
}

/** @param {Record<string, unknown>} value @param {string[]} allowed @param {string} at */
function rejectUnknown(value, allowed, at) {
  for (const key of Object.keys(value)) {
    if (!allowed.includes(key)) throw new TypeError(`${at}.${key} is unknown`)
  }
}
