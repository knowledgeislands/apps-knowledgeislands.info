// @ts-check
import { isIssueDate, resolveIssueStatuses, validateIssues } from './contract.js'
/**
 * @typedef {object} IssuesList
 * @property {import('./contract.js').Issue[]} issues
 * @property {{status: import('./contract.js').IssueStatus, label: string, closed: boolean, issues: import('./contract.js').Issue[]}[]} groups
 * @property {Record<import('./contract.js').IssueStatus, number>} counts
 * @property {number} total
 * @property {{date: string, issues: import('./contract.js').Issue[]} | null} nextCall
 */
/**
 * Keep source order within each status. The next call is the earliest forCall
 * on/after asOf among statuses configured as not closed.
 * asOf is explicit so builds have no hidden clock or time-zone dependency.
 * @param {unknown} data
 * @param {import('./contract.js').IssuesOptions & {asOf: string}} options
 * @returns {IssuesList}
 */
export function loadIssues(data, { areas, asOf, statuses, strict, classifier, splitArea }) {
  if (!isIssueDate(asOf)) throw new TypeError('asOf must be an ISO calendar date')
  const { issues } = validateIssues(data, { areas, statuses, strict, classifier, splitArea })
  const groups = resolveIssueStatuses(statuses).map(({ value: status, label, closed }) => ({
    status,
    label,
    closed,
    issues: issues.filter((issue) => issue.status === status)
  }))
  /** @type {Record<string, number>} */
  const counts = Object.create(null)
  for (const group of groups) counts[group.status] = group.issues.length
  const scheduled = issues.filter(
    (issue) => !groups.find((group) => group.status === issue.status)?.closed && issue.forCall && issue.forCall >= asOf
  )
  const date = scheduled.map((issue) => /** @type {string} */ (issue.forCall)).sort()[0]
  return {
    issues,
    groups,
    counts,
    total: issues.length,
    nextCall: date ? { date, issues: scheduled.filter((issue) => issue.forCall === date) } : null
  }
}
