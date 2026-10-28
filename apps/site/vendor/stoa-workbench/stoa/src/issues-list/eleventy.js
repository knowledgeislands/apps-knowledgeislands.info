// @ts-check
import { renderIssuesList } from './render.js'
/**
 * @param {import('../internal/eleventy.js').StoaEleventyConfig} config
 * @param {import('./render.js').IssuesRenderOptions} options
 */
export default function stoaIssuesList(config, options) {
  config.addShortcode('stoaIssuesList', (data, overrides = {}) => renderIssuesList(data, { ...options, ...overrides }))
}
