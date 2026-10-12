/**
 * Verifies that every element the prose pipeline emits is actually styled.
 *
 * `.prose-ki` styled `h2`, `h3`, `p`, `ul` and `li`. The Markdown corpus emits
 * far more: fifty tables across thirty-four of thirty-five published pages,
 * fifty-six `pre` blocks, and 1482 inline `code` elements. Those rendered as
 * browser defaults — a table with no padding, no borders and a shrink-to-fit
 * width — on the pages carrying the most material, and nothing reported it
 * because no rule was wrong. They were absent (KI-WEBSITE-SITE-024).
 *
 * So this reads the selectors the stylesheet declares, walks the built output
 * for the elements that actually appear inside a `.prose-ki` container, and
 * fails on an element that no rule reaches. It fails rather than warns: unlike
 * upstream drift, an unstyled element is entirely within this site's control.
 *
 * An element counts as styled when a `.prose-ki` rule names it or when the
 * base layer gives it a deliberate element rule. That second route is why `a`
 * and `h1` need nothing here — `@layer base` already owns them.
 *
 * A `.prose-provenance` rule does not count. It refines the footer's table on
 * top of the `.prose-ki` base, so treating it as coverage would report the
 * body's tables as styled by a rule that never applies to them.
 */

import { readdirSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { byExtension, walk } from './lib/walk.ts'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const stylesheet = resolve(siteRoot, 'src/assets/css/main.css')
const distDir = resolve(siteRoot, 'dist')

/**
 * The elements a Markdown page can put on the screen and that carry type,
 * spacing or colour of their own. Everything outside this set is either
 * structural (`tbody`, `tr` group rows without painting them), inline markup
 * that inherits by design (`em`, `span`), or generated chrome with its own
 * component class (`svg`, `figure`).
 */
const styledElements = new Set([
  'blockquote',
  'code',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'img',
  'li',
  'ol',
  'p',
  'pre',
  'strong',
  'table',
  'td',
  'th',
  'ul'
])

const failures: string[] = []
const warnings: string[] = []

/**
 * Element names the stylesheet styles, by either route.
 *
 * Selectors are read textually rather than through a CSS parser: the file is
 * hand-written in one house style, and a parser would be a dependency carried
 * for one check.
 */
const styledByStylesheet = (): Set<string> => {
  const source = readFileSync(stylesheet, 'utf-8')
  const covered = new Set<string>()

  // Rule heads only: everything up to the `{` that opens a declaration block.
  for (const match of source.matchAll(/([^{}]+)\{/g)) {
    const head = (match[1] as string).trim()
    if (head.startsWith('@') || head === '') continue

    for (const selector of head.split(',')) {
      const trimmed = selector.trim()

      // `.prose-provenance` refines the footer's table on top of the `.prose-ki`
      // base and is deliberately not counted: it would otherwise report the
      // body's tables as covered by a rule that never reaches them.
      if (trimmed.includes('.prose-ki')) {
        // `.prose-ki :not(pre) > code` and `.prose-ki pre code` both name `code`.
        for (const element of trimmed.matchAll(/\b([a-z][a-z0-9]*)\b/g)) {
          const name = element[1] as string
          if (styledElements.has(name)) covered.add(name)
        }
        continue
      }

      // A bare element rule in the base layer: `h1, h2, h3, h4 { ... }`.
      if (/^[a-z][a-z0-9]*$/.test(trimmed) && styledElements.has(trimmed)) covered.add(trimmed)
    }
  }

  return covered
}

/** Every HTML document the build wrote. */
const pages = (dir: string): string[] => walk(dir, byExtension('.html'))

/**
 * The markup inside each `.prose-ki` container on one page.
 *
 * Containers are found by their class and closed by counting nested tags of
 * the same name, so an `article.prose-ki` holding a `div` is not cut short at
 * the first `</div>`.
 */
const proseRegions = (html: string): string[] => {
  const regions: string[] = []
  const opening = /<([a-z][a-z0-9]*)\b[^>]*\bclass="[^"]*\bprose-ki\b[^"]*"[^>]*>/gi

  for (const match of html.matchAll(opening)) {
    const tag = (match[1] as string).toLowerCase()
    const start = (match.index as number) + match[0].length
    const boundaries = new RegExp(`<${tag}\\b[^>]*>|</${tag}\\s*>`, 'gi')
    boundaries.lastIndex = start

    let depth = 1
    let end = html.length
    for (const boundary of html.slice(start).matchAll(boundaries)) {
      depth += boundary[0].startsWith('</') ? -1 : 1
      if (depth === 0) {
        end = start + (boundary.index as number)
        break
      }
    }

    regions.push(html.slice(start, end))
  }

  return regions
}

const covered = styledByStylesheet()
const missing = new Map<string, string>()
let regionCount = 0

if (readdirSync(distDir).length === 0) {
  failures.push('dist/ is empty; run the site build before this check')
}

for (const page of pages(distDir)) {
  const html = readFileSync(page, 'utf-8')
  for (const region of proseRegions(html)) {
    regionCount += 1
    for (const element of region.matchAll(/<([a-z][a-z0-9]*)\b/gi)) {
      const name = (element[1] as string).toLowerCase()
      if (!styledElements.has(name) || covered.has(name)) continue
      if (!missing.has(name)) missing.set(name, relative(distDir, page))
    }
  }
}

if (regionCount === 0) warnings.push('no .prose-ki container was found in dist/; the check saw nothing')

for (const [element, page] of [...missing].sort()) {
  failures.push(`<${element}> appears in prose (first seen in ${page}) but no .prose-ki or base rule styles it`)
}

for (const message of warnings) console.warn(`warning: ${message}`)

if (failures.length > 0) {
  for (const message of failures) console.error(`error: ${message}`)
  console.error(`\nverify-prose-coverage: ${failures.length} problem(s) found`)
  process.exit(1)
}

console.log(`verify-prose-coverage: ${regionCount} prose region(s) checked against ${covered.size} styled element(s)`)
