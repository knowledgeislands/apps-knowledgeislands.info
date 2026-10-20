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
 * Only `official` and `agreed` symbols are vendored (GDR-KI-DESIGN-002). A `proposed` entry is an open question in
 * `ki-design`, and the site must not publish a proposal beside official entries as if it were settled; leaving it out of the snapshot
 * means no template can publish it by accident.
 *
 * The chosen Arcadia painting is the one vendored file not taken at the checkout's HEAD. It is chosen art rather
 * than a build output, so it is pinned to the commit `PAINTING.ref` names and read from that commit with
 * `git show`; a re-sync reproduces the same responsive images whatever the checkout has since moved to, and
 * advancing the painting is a deliberate edit of that ref. Its manifest, `src/_data/arcadiaPainting.json5`,
 * records the source and every variant, and `verify:provenance` holds it to the ref /arcadia/ cites.
 *
 * The islands chart on /arcadia/ is the one vendored file drawn from this site's own data. `ki-design`'s archipelago
 * renderer (`packages/hexmap`) draws the committed dated snapshot, `src/_data/arcadiaSnapshot.json5`
 * (GDR-KI-DESIGN-031), here at sync time, so the build stays offline and needs no `ki-design`. Its manifest,
 * `src/_data/arcadiaArchipelago.json5`, records the renderer's commit and the snapshot it drew, and
 * `verify:provenance` fails the build when the chart and the snapshot disagree. After `sync:arcadia`, re-run this.
 *
 * Usage: bun scripts/sync-ki-design.ts [--from <path-to-ki-design>]   (default: ../ki-design beside this repo)
 * See docs/guides/developer/page-provenance.md.
 */

import { execFileSync } from 'node:child_process'
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import JSON5 from 'json5'
import sharp from 'sharp'
import type { ArcadiaSnapshot } from './lib/arcadia-snapshot.ts'

export const SOURCE_REPOSITORY = 'knowledgeislands/ki-design'
export const SYMBOLS_PATH = 'packages/symbols/src/symbols.ts'

/** The statuses the site publishes. `proposed` is withheld by design; see the header. */
export const PUBLISHED_STATUSES = ['official', 'agreed'] as const
export type PublishedStatus = (typeof PUBLISHED_STATUSES)[number]

export const PLATE_START = '<!-- arcadia:start -->'
export const PLATE_END = '<!-- arcadia:end -->'

const commitPattern = /^[0-9a-f]{40}$/

/**
 * The chosen Arcadia painting (ki-design docs/briefs/arcadia-handoff.md) and the commit it is taken from. It is
 * generated reference art whose licence ki-design has yet to record, and the manifest says so.
 */
export const PAINTING = {
  path: 'docs/briefs/references/arcadia.png',
  ref: 'c73cefe7fc9d7c0d7d6ccd6229c2d06f4d5dafba',
  width: 1672,
  height: 941,
  licence: 'generated reference art; licence to be recorded (KI-DESIGN-ART-002)',
  name: 'arcadia-painting',
  outDir: 'src/assets/images/ki-design/arcadia'
} as const

export type PaintingFormat = 'avif' | 'webp' | 'jpeg'

/**
 * The responsive set. AVIF and WebP at every width, one JPEG fallback at full width. Qualities are high because
 * this is a painting: banding in the dusk sky is the first thing a lower setting gives away.
 */
export const PAINTING_VARIANTS: readonly { format: PaintingFormat; widths: readonly number[] }[] = [
  { format: 'avif', widths: [1672, 960, 480] },
  { format: 'webp', widths: [1672, 960, 480] },
  { format: 'jpeg', widths: [1672] }
]

const encoderOptions = {
  avif: { quality: 64, effort: 6 },
  webp: { quality: 88, effort: 6, smartSubsample: true },
  jpeg: { quality: 84, mozjpeg: true }
} as const

const extension: Record<PaintingFormat, string> = { avif: 'avif', webp: 'webp', jpeg: 'jpg' }

export interface PaintingVariant {
  format: PaintingFormat
  width: number
  height: number
  src: string
  bytes?: number
}

/**
 * Plans the variants for a source of the given size. Refuses a width wider than the source, because the site
 * must not publish an upscaled painting as if it carried more detail than the generator delivered.
 */
export function planPainting(sourceWidth: number, sourceHeight: number): PaintingVariant[] {
  const plan: PaintingVariant[] = []
  for (const { format, widths } of PAINTING_VARIANTS) {
    for (const width of widths) {
      if (width > sourceWidth) throw new Error(`${width}px ${format} would upscale a ${sourceWidth}px painting`)
      plan.push({
        format,
        width,
        height: Math.round((sourceHeight * width) / sourceWidth),
        src: `/assets/images/ki-design/arcadia/${PAINTING.name}-${width}.${extension[format]}`
      })
    }
  }
  return plan
}

/** The full-width JPEG, which every browser can draw. */
export const paintingFallback = (variants: readonly PaintingVariant[]): string => {
  const jpeg = variants.filter((v) => v.format === 'jpeg').sort((a, b) => b.width - a.width)[0]
  if (!jpeg) throw new Error('the painting plan has no JPEG fallback')
  return jpeg.src
}

export interface PaintingManifest {
  source: { repository: string; path: string; ref: string }
  licence: string
  width: number
  height: number
  /** The `<img>` source for a browser that takes neither AVIF nor WebP. */
  fallback: string
  variants: PaintingVariant[]
}

const renderPaintingManifest = (manifest: PaintingManifest): string =>
  [
    '// Vendored manifest of the chosen Arcadia painting and the responsive images made from it.',
    '//',
    '// GENERATED FILE — do not edit. Regenerate with:',
    '//   bun run --cwd apps/site sync:design',
    '//',
    `// Taken from ${SOURCE_REPOSITORY} ${PAINTING.path},`,
    "// read at the pinned commit below rather than at the checkout's HEAD.",
    `// Licence: ${PAINTING.licence}.`,
    '// The ref below must match the ref declared in the sources frontmatter of src/arcadia/index.njk;',
    '// verify:provenance fails the build when they disagree.',
    '//',
    `// Painting taken at ${manifest.source.ref}.`,
    JSON.stringify(manifest, null, 2),
    ''
  ].join('\n')

/** Encodes the pinned painting into every planned variant and writes its manifest. */
export async function vendorPainting(from: string, out: (path: string) => string): Promise<PaintingManifest> {
  const png = execFileSync('git', ['-C', from, 'show', `${PAINTING.ref}:${PAINTING.path}`], {
    maxBuffer: 64 * 1024 * 1024
  })
  const { width, height } = await sharp(png).metadata()
  if (width !== PAINTING.width || height !== PAINTING.height) {
    throw new Error(
      `${PAINTING.path} at ${PAINTING.ref} is ${width}x${height}, not ${PAINTING.width}x${PAINTING.height}`
    )
  }
  await mkdir(out(PAINTING.outDir), { recursive: true })
  const variants = planPainting(width, height)
  for (const variant of variants) {
    const image = sharp(png).resize({ width: variant.width, withoutEnlargement: true })
    const encoded = await image[variant.format](encoderOptions[variant.format]).toBuffer()
    await writeFile(out(`src${variant.src}`), encoded)
    variant.bytes = encoded.length
  }
  const manifest: PaintingManifest = {
    source: { repository: SOURCE_REPOSITORY, path: PAINTING.path, ref: PAINTING.ref },
    licence: PAINTING.licence,
    width,
    height,
    fallback: paintingFallback(variants),
    variants
  }
  await writeFile(out('src/_data/arcadiaPainting.json5'), renderPaintingManifest(manifest))
  return manifest
}

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
  if (published === 0) throw new Error('no official or agreed symbols found; refusing to vendor an empty library')
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

/**
 * The islands chart on /arcadia/: Arcadia's public islands drawn as an archipelago (GDR-KI-DESIGN-015) by
 * `ki-design`'s renderer, from the committed snapshot. Two layouts of one chart: a round cluster, and a tall one
 * a phone can read. The page shows one by width; the list beside them is the text equivalent (GDR-KI-DESIGN-032).
 */
export const ARCHIPELAGO = {
  renderer: 'packages/hexmap/src/archipelago.ts',
  snapshot: 'src/_data/arcadiaSnapshot.json5',
  manifest: 'src/_data/arcadiaArchipelago.json5',
  layouts: {
    wide: { file: 'src/_includes/ki-design/arcadia-archipelago.svg', aspect: 1, labelSize: 0.6 },
    tall: { file: 'src/_includes/ki-design/arcadia-archipelago-tall.svg', aspect: 0.5, labelSize: 0.8 }
  }
} as const

export type ArchipelagoLayoutName = keyof typeof ARCHIPELAGO.layouts

/**
 * A single-purpose repository is a small isle typed by its dominant building (ki-design docs/spec/maps.md, "How
 * islands are typed"): the Capital's own civic glyph, the Workshop for a tool, the Causeway for an MCP server. Every
 * other role keeps the island glyph.
 */
export const ISLAND_GLYPHS: Readonly<Record<string, string>> = {
  Capital: 'capital',
  Tool: 'workshop',
  MCP: 'causeway',
  default: 'island'
}

export const islandGlyph = (role: string): string => ISLAND_GLYPHS[role] ?? (ISLAND_GLYPHS.default as string)

/** The renderer's input, as `@knowledgeislands/hexmap` types it. */
export interface ArchipelagoInput {
  id: string
  name: string
  islands: { id: string; role: string; href: string; glyph: string; title: string; capital?: true }[]
}

/** The snapshot as an archipelago: each island linked to its repository, titled with its role and concern. */
export function archipelagoFromSnapshot(snapshot: ArcadiaSnapshot): ArchipelagoInput {
  const capitals = snapshot.islands.filter((island) => island.role === 'Capital')
  if (capitals.length !== 1) throw new Error(`the snapshot names ${capitals.length} Capitals, not one`)
  return {
    id: 'arcadia',
    name: `The islands of Arcadia, charted ${snapshot.charted}`,
    islands: snapshot.islands.map((island) => ({
      id: island.name,
      role: island.role,
      href: island.repository,
      glyph: islandGlyph(island.role),
      title: `${island.name} — ${island.role} · ${island.concern}`,
      ...(island.role === 'Capital' ? { capital: true as const } : {})
    }))
  }
}

export interface ArchipelagoManifest {
  source: { repository: string; path: string; ref: string }
  drawnFrom: { path: string; ref: string; charted: string; islands: string[] }
  glyphs: Readonly<Record<string, string>>
  files: Record<ArchipelagoLayoutName, string>
}

export const renderArchipelagoManifest = (manifest: ArchipelagoManifest): string =>
  [
    "// Vendored manifest of the islands chart on /arcadia/: Arcadia's public islands drawn as an archipelago.",
    '//',
    '// GENERATED FILE — do not edit. Regenerate with:',
    '//   bun run --cwd apps/site sync:design',
    '//',
    `// Drawn by ${SOURCE_REPOSITORY} ${ARCHIPELAGO.renderer} from ${ARCHIPELAGO.snapshot}.`,
    '// The source ref must match the ref declared in the sources frontmatter of src/arcadia/index.njk, and',
    '// drawnFrom must match the snapshot; verify:provenance fails the build when either disagrees.',
    '//',
    `// Drawn at ${manifest.source.ref}.`,
    JSON.stringify(manifest, null, 2),
    ''
  ].join('\n')

interface Hexmap {
  renderArchipelagoSvg: (archipelago: ArchipelagoInput, options: Record<string, unknown>) => string
}

/** Draws the snapshot in every layout and writes the SVGs and their manifest. */
export async function vendorArchipelago(
  hexmap: Hexmap,
  glyph: (id: string) => string | undefined,
  ref: string,
  out: (path: string) => string
): Promise<ArchipelagoManifest> {
  const snapshot = JSON5.parse(await readFile(out(ARCHIPELAGO.snapshot), 'utf-8')) as ArcadiaSnapshot
  const archipelago = archipelagoFromSnapshot(snapshot)
  const files = {} as Record<ArchipelagoLayoutName, string>
  for (const [name, layout] of Object.entries(ARCHIPELAGO.layouts) as [
    ArchipelagoLayoutName,
    (typeof ARCHIPELAGO.layouts)[ArchipelagoLayoutName]
  ][]) {
    const svg = hexmap.renderArchipelagoSvg(archipelago, {
      theme: 'auto',
      frame: false,
      glyph,
      variant: name,
      aspect: layout.aspect,
      labelSize: layout.labelSize,
      margin: 1
    })
    const note = `renderArchipelagoSvg drawing ${ARCHIPELAGO.snapshot} (${snapshot.source.repository} at ${snapshot.source.ref}, charted ${snapshot.charted}), unchanged below this comment`
    await writeFile(out(layout.file), `<!-- ${provenance(ARCHIPELAGO.renderer, ref, note)} -->\n${svg}`)
    files[name] = layout.file
  }
  const manifest: ArchipelagoManifest = {
    source: { repository: SOURCE_REPOSITORY, path: ARCHIPELAGO.renderer, ref },
    drawnFrom: {
      path: ARCHIPELAGO.snapshot,
      ref: snapshot.source.ref,
      charted: snapshot.charted,
      islands: snapshot.islands.map((island) => island.name)
    },
    glyphs: ISLAND_GLYPHS,
    files
  }
  await writeFile(out(ARCHIPELAGO.manifest), renderArchipelagoManifest(manifest))
  return manifest
}

/** The provenance line every vendored file carries, in the comment syntax of its own format. */
export const provenance = (path: string, ref: string, note = 'unchanged below this comment'): string =>
  `Vendored from ${SOURCE_REPOSITORY} at ${ref}: ${path}, ${note}. Do not edit here; refresh with ` +
  '`bun run --cwd apps/site sync:design` (GDR-KI-WEBSITE-002, ADR-KI-WEBSITE-001).'

const renderSnapshot = (snapshot: SymbolSnapshot): string =>
  [
    '// Vendored snapshot of the ki-design symbol library: official and agreed entries, without their notes.',
    '//',
    '// GENERATED FILE — do not edit. Regenerate with:',
    '//   bun run --cwd apps/site sync:design',
    '//',
    `// Taken from ${SOURCE_REPOSITORY} ${SYMBOLS_PATH}. Proposed entries are withheld: the site`,
    '// does not publish a proposal beside official entries. The ref below must match the ref declared in the sources',
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
  const icons = await load<{
    sprite: () => string
    iconBodies: Record<string, string>
    isIconName: (id: string) => boolean
  }>('packages/icons/src/index.ts')
  const hexmap = await load<Hexmap>('packages/hexmap/src/index.ts')
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
  const painting = await vendorPainting(from, out)
  const archipelago = await vendorArchipelago(
    hexmap,
    (id) => (icons.isIconName(id) ? icons.iconBodies[id] : undefined),
    ref,
    out
  )

  console.log(
    `sync-ki-design: vendored ${SOURCE_REPOSITORY} at ${ref} (${snapshot.counts.published} symbols published, ${snapshot.counts.withheldProposed} proposed withheld)`
  )
  console.log(
    `sync-ki-design: vendored ${PAINTING.path} at ${PAINTING.ref} as ${painting.variants.length} responsive images`
  )
  console.log(
    `sync-ki-design: drew ${archipelago.drawnFrom.islands.length} islands charted ${archipelago.drawnFrom.charted} as ${Object.keys(archipelago.files).length} archipelago layouts`
  )
  console.log('Advance the ki-design ref in src/field-guide/index.njk and src/arcadia/index.njk sources to match.')
}

if (import.meta.main) {
  await main()
}
