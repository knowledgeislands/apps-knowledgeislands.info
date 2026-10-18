/**
 * Vendors the Knowledge Islands design system from a local `ki-design` checkout into the site.
 *
 * `ki-design` owns the tokens, the line glyphs, the symbol library and the drawn Arcadia; the site carries
 * a copy of each, source-labelled with the commit it was taken from, so `apps/site/dist/` builds without
 * `ki-design` present (GDR-KI-WEBSITE-002, ADR-KI-WEBSITE-001). Nothing here runs during the build.
 *
 * It reads a checkout rather than fetching from GitHub because the generated artefacts (the token CSS, the
 * glyph sprite) are build outputs of `ki-design`'s own TypeScript, which is imported here and rendered the
 * way `ki-design` renders them. The checkout must be clean, so the recorded commit is the content copied.
 *
 * Only `canon` and `decided` symbols are vendored. A `proposed` entry is an open question in `ki-design`, and
 * the site must not publish a proposal beside canon as if it were settled; leaving it out of the snapshot
 * means no template can publish it by accident.
 *
 * Usage: bun scripts/sync-ki-design.ts [--from <path-to-ki-design>]   (default: ../ki-design beside this repo)
 * See docs/guides/developer/page-provenance.md.
 */

import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

export const SOURCE_REPOSITORY = 'knowledgeislands/ki-design'
export const SYMBOLS_PATH = 'packages/symbols/src/symbols.ts'

/** The statuses the site publishes. `proposed` is withheld by design; see the header. */
export const PUBLISHED_STATUSES = ['canon', 'decided'] as const
export type PublishedStatus = (typeof PUBLISHED_STATUSES)[number]

export const PLATE_START = '<!-- arcadia:start -->'
export const PLATE_END = '<!-- arcadia:end -->'

const commitPattern = /^[0-9a-f]{40}$/

/** One upstream symbol, as `@knowledgeislands/symbols` types it. */
export interface UpstreamSymbol {
  id: string
  name: string
  meaning: string
  status: string
  category: string
  icon?: string
  notes?: string
}

/**
 * One vendored symbol: the fields the Field Guide renders, no more. Upstream `notes` are left behind: they
 * hold open questions and asides that name proposed vocabulary, which is exactly what the site withholds.
 */
export interface VendoredSymbol {
  id: string
  name: string
  meaning: string
  status: PublishedStatus
  icon?: string
}

export interface VendoredCategory {
  id: string
  symbols: VendoredSymbol[]
}

export interface SymbolSnapshot {
  source: { repository: string; path: string; ref: string }
  counts: { upstream: number; published: number; withheldProposed: number }
  categories: VendoredCategory[]
}

const isPublished = (status: string): status is PublishedStatus =>
  (PUBLISHED_STATUSES as readonly string[]).includes(status)

/**
 * Filters and groups the library. Refuses anything it does not recognise — an unknown status, a category
 * outside the declared list, a duplicate id, an entry without a meaning — rather than publishing around it.
 */
export function buildSymbolSnapshot(
  library: readonly UpstreamSymbol[],
  categories: readonly string[],
  ref: string
): SymbolSnapshot {
  if (!commitPattern.test(ref)) throw new Error(`"${ref}" is not a 40-character commit`)
  const seen = new Set<string>()
  let withheldProposed = 0
  const grouped = new Map<string, VendoredSymbol[]>(categories.map((c) => [c, []]))

  for (const entry of library) {
    if (seen.has(entry.id)) throw new Error(`${entry.id}: duplicate symbol id`)
    seen.add(entry.id)
    if (entry.meaning.trim() === '') throw new Error(`${entry.id}: symbol carries no meaning`)
    const group = grouped.get(entry.category)
    if (!group) throw new Error(`${entry.id}: unknown category "${entry.category}"`)
    if (entry.status === 'proposed') {
      withheldProposed += 1
      continue
    }
    if (!isPublished(entry.status)) throw new Error(`${entry.id}: unknown status "${entry.status}"`)
    group.push({
      id: entry.id,
      name: entry.name,
      meaning: entry.meaning,
      status: entry.status,
      ...(entry.icon ? { icon: entry.icon } : {})
    })
  }

  const published = library.length - withheldProposed
  if (published === 0) throw new Error('no canon or decided symbols found; refusing to vendor an empty library')
  return {
    source: { repository: SOURCE_REPOSITORY, path: SYMBOLS_PATH, ref },
    counts: { upstream: library.length, published, withheldProposed },
    categories: [...grouped.entries()]
      .filter(([, symbols]) => symbols.length > 0)
      .map(([id, symbols]) => ({ id, symbols }))
  }
}

/** Returns the markup between the preview's `arcadia` markers, which hold the daylight plate. */
export function extractPlate(html: string): string {
  const start = html.indexOf(PLATE_START)
  const end = html.indexOf(PLATE_END)
  if (start === -1 || end === -1 || end < start) throw new Error('the arcadia plate markers were not found')
  const svg = html.slice(start + PLATE_START.length, end).trim()
  if (!svg.startsWith('<svg') || !svg.endsWith('</svg>')) throw new Error('the arcadia plate is not one <svg>')
  return svg
}

/** The provenance line every vendored file carries, in the comment syntax of its own format. */
export const provenance = (path: string, ref: string, note = 'unchanged below this comment'): string =>
  `Vendored from ${SOURCE_REPOSITORY} at ${ref}: ${path}, ${note}. Do not edit here; refresh with ` +
  '`bun run --cwd apps/site sync:design` (GDR-KI-WEBSITE-002, ADR-KI-WEBSITE-001).'

const renderSnapshot = (snapshot: SymbolSnapshot): string =>
  [
    '// Vendored snapshot of the ki-design symbol library: canon and decided entries, without their notes.',
    '//',
    '// GENERATED FILE — do not edit. Regenerate with:',
    '//   bun run --cwd apps/site sync:design',
    '//',
    `// Taken from ${SOURCE_REPOSITORY} ${SYMBOLS_PATH}. Proposed entries are withheld: the site`,
    '// does not publish a proposal beside canon. The ref below must match the ref declared in the sources',
    '// frontmatter of src/field-guide/index.njk; verify:provenance fails the build when they disagree.',
    '//',
    `// Snapshot taken at ${snapshot.source.ref}.`,
    JSON.stringify(snapshot, null, 2),
    ''
  ].join('\n')

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-C', cwd, ...args])
    .toString()
    .trim()

async function main(): Promise<void> {
  const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const fromFlag = process.argv.indexOf('--from')
  const from = resolve(fromFlag === -1 ? resolve(siteRoot, '../../../ki-design') : process.argv[fromFlag + 1])

  const ref = git(from, 'rev-parse', 'HEAD')
  // Tracked files only: build output such as packages/tokens/dist/ is ignored upstream and never read here.
  const dirty = git(from, 'status', '--porcelain', '--untracked-files=no', '--', 'packages', 'examples/site-preview')
  if (dirty !== '') {
    throw new Error(`${from} has uncommitted changes under packages/ or examples/site-preview/; commit them first`)
  }

  const load = async <T>(path: string): Promise<T> => (await import(pathToFileURL(resolve(from, path)).href)) as T
  const css = await load<{ renderCss: () => string; renderTailwindTheme: () => string }>('packages/tokens/src/css.ts')
  const icons = await load<{ sprite: () => string }>('packages/icons/src/index.ts')
  const library = await load<{ symbols: readonly UpstreamSymbol[]; symbolCategories: readonly string[] }>(
    'packages/symbols/src/index.ts'
  )

  const out = (path: string): string => resolve(siteRoot, path)
  await mkdir(out('src/assets/css/ki-design'), { recursive: true })
  await mkdir(out('src/_includes/ki-design'), { recursive: true })
  await mkdir(out('src/assets/images/ki-design'), { recursive: true })

  const cssHeader = (path: string): string =>
    `/* ${provenance(path, ref, 'the build output of packages/tokens, unchanged below this comment')}\n   The site's own aliases live in ../tokens.css. */\n`
  const svgHeader = (path: string, note?: string): string => `<!-- ${provenance(path, ref, note)} -->\n`
  const preview = await readFile(resolve(from, 'examples/site-preview/index.html'), 'utf-8')
  const snapshot = buildSymbolSnapshot(library.symbols, library.symbolCategories, ref)

  await Promise.all([
    writeFile(
      out('src/assets/css/ki-design/tokens.css'),
      cssHeader('packages/tokens/dist/tokens.css') + css.renderCss()
    ),
    writeFile(
      out('src/assets/css/ki-design/theme.css'),
      cssHeader('packages/tokens/dist/theme.css') + css.renderTailwindTheme()
    ),
    writeFile(
      out('src/_includes/ki-design/glyphs.svg'),
      `${svgHeader('packages/icons (sprite() of every glyph)', 'as rendered by the package')}${icons.sprite()}\n`
    ),
    readFile(resolve(from, 'examples/site-preview/hero-arcadia.svg'), 'utf-8').then((svg) =>
      writeFile(
        out('src/_includes/ki-design/hero-arcadia.svg'),
        svgHeader('examples/site-preview/hero-arcadia.svg') + svg
      )
    ),
    writeFile(
      out('src/_includes/ki-design/arcadia-plate.svg'),
      `${svgHeader('examples/site-preview/index.html', 'the block between its arcadia markers')}${extractPlate(preview)}\n`
    ),
    ...['logo-roundel.png', 'favicon.png'].map((image) =>
      copyFile(resolve(from, 'examples/site-preview/assets', image), out(`src/assets/images/ki-design/${image}`))
    ),
    writeFile(out('src/_data/kiSymbols.json5'), renderSnapshot(snapshot))
  ])

  console.log(
    `sync-ki-design: vendored ${SOURCE_REPOSITORY} at ${ref} (${snapshot.counts.published} symbols published, ${snapshot.counts.withheldProposed} proposed withheld)`
  )
  console.log('Advance the ki-design ref in src/field-guide/index.njk sources to match.')
}

if (import.meta.main) {
  await main()
}
