/**
 * Verifies that every published page declares what it was written from.
 *
 * The site deliberately restates material owned by other repositories, so its prose drifts from
 * those sources between refreshes. That is intended; invisible drift is not. Every published
 * Markdown page therefore declares a `sources` list — or claims `original` — and this check
 * refuses a page that declares neither.
 *
 * Those pages live under `src/docs/`, one directory per section, having been through two moves:
 * out of a single `/guidance/` collection and under the project each described (KI-WEBSITE-SITE-025),
 * then out from under the projects and into sections a reader works through (KI-WEBSITE-SITE-037).
 * Provenance did not change across either, which is the point: a page restating somebody's
 * material declares it wherever it lives, and moving a page must not be a way to shed the
 * declaration. Checking the whole tree rather than a list of directories is what makes that true
 * of the next move as well.
 *
 * Offline checks run by default. `--network` additionally resolves each pinned ref against its
 * upstream repository and reports pages whose source document has moved since it was reviewed, and
 * resolves the links a page's prose makes into Knowledge Islands repositories. Both are warnings,
 * never failures: an upstream repository editing or retiring its own guide must not break this
 * site's build. See docs/guides/developer/page-provenance.md.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSON5 from 'json5'
import { readFrontmatter } from './lib/frontmatter.ts'
import { githubFetch, isRateLimited, rateLimitMessage } from './lib/github.ts'
import { byExtension, walk } from './lib/walk.ts'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const publishedDirs = ['src/docs'].map((dir) => resolve(siteRoot, dir))
const sourcesPartial = 'partials/sources.njk'
const proseLayout = resolve(siteRoot, 'src/_includes/layouts/page.njk')
/**
 * Hand-built pages that restate or vendor another repository's material. They carry their own layout, so they
 * cannot inherit the provenance footer from the prose layout; each must include it itself, and is checked for it.
 */
const handBuiltPages = ['src/field-guide/index.njk', 'src/arcadia/index.njk'].map((page) => resolve(siteRoot, page))
/** Vendored snapshots, each held to the ref its citing page declares. */
const vendoredData = [
  'src/_data/skillCatalogue.json5',
  'src/_data/kiSymbols.json5',
  'src/_data/arcadiaPainting.json5',
  'src/_data/arcadiaSnapshot.json5',
  'src/_data/arcadiaArchipelago.json5'
].map((file) => resolve(siteRoot, file))

const repositoryOwner = 'knowledgeislands'
const repositoryPattern = /^knowledgeislands\/[a-z0-9]+(?:[-.][a-z0-9]+)*$/
const tagPattern = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const prereleasePattern = /^v\d+\.\d+\.\d+-[0-9A-Za-z.-]+$/
const commitPattern = /^[0-9a-f]{40}$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/

const knownKeys = new Set(['repository', 'path', 'ref', 'url', 'title', 'governs', 'reviewed'])

/** Frontmatter values are quoted where a plain scalar would be ambiguous to Eleventy's YAML reader. */
const unquote = (value: string): string => value.replace(/^'(.*)'$/, '$1').replace(/^"(.*)"$/, '$1')

interface Source {
  repository?: string
  path?: string
  ref?: string
  url?: string
  title?: string
  governs?: string
  reviewed?: string
}

interface ProseLink {
  repository: string
  ref: string
  path: string
}

const failures: string[] = []
const warnings: string[] = []

const fail = (message: string): void => {
  failures.push(message)
}

const warn = (message: string): void => {
  warnings.push(message)
}

const markdownFiles = (dir: string): string[] => walk(dir, byExtension('.md')).sort()

/**
 * Reads the `sources` key out of a page's frontmatter.
 *
 * This is a deliberately narrow reader rather than a YAML parser: the site has no YAML dependency,
 * and the schema is one scalar or a list of flat string entries. Anything outside that shape is
 * reported rather than guessed at, so a malformed declaration fails loudly instead of parsing to
 * something plausible.
 */
const readSources = (
  contents: string
):
  | { kind: 'missing' }
  | { kind: 'original' }
  | { kind: 'list'; entries: Source[] }
  | { kind: 'malformed'; reason: string } => {
  const frontmatter = readFrontmatter(contents)
  if (frontmatter.kind === 'none') {
    return { kind: 'malformed', reason: 'the file has no frontmatter block' }
  }
  if (frontmatter.kind === 'unterminated') {
    return { kind: 'malformed', reason: 'the frontmatter block is unterminated' }
  }
  const lines = frontmatter.block.split('\n')

  const index = lines.findIndex((line) => line === 'sources: original' || line === 'sources:')
  if (index === -1) {
    return { kind: 'missing' }
  }
  if (lines[index] === 'sources: original') {
    return { kind: 'original' }
  }

  const entries: Source[] = []
  let current: Source | null = null
  for (const line of lines.slice(index + 1)) {
    if (line.trim() === '') continue
    if (!line.startsWith('  ')) break
    const item = line.match(/^ {2}- ([a-z]+): (.+)$/)
    if (item) {
      current = {}
      entries.push(current)
      current[item[1] as keyof Source] = unquote(item[2].trim())
      continue
    }
    const field = line.match(/^ {4}([a-z]+): (.+)$/)
    if (field && current) {
      current[field[1] as keyof Source] = unquote(field[2].trim())
      continue
    }
    return { kind: 'malformed', reason: `unreadable sources entry: ${line.trim()}` }
  }

  if (entries.length === 0) {
    return { kind: 'malformed', reason: 'sources is declared but lists no entries' }
  }
  return { kind: 'list', entries }
}

const today = new Date().toISOString().slice(0, 10)

const checkEntry = (page: string, position: number, source: Source): void => {
  const where = `${page} source ${position + 1}`

  for (const key of Object.keys(source)) {
    if (!knownKeys.has(key)) {
      fail(`${where}: unknown field "${key}".`)
    }
  }

  if (source.repository && source.url) {
    fail(`${where}: declares both "repository" and "url"; a source is one or the other.`)
  }
  if (!source.repository && !source.url) {
    fail(`${where}: declares neither "repository" nor "url".`)
  }

  if (source.repository) {
    if (!repositoryPattern.test(source.repository)) {
      fail(`${where}: "${source.repository}" is not an ${repositoryOwner}/<repo> repository.`)
    }
    if (!source.path) {
      fail(`${where}: a repository source must name the upstream "path".`)
    } else if (source.path.startsWith('/') || source.path.includes('..')) {
      fail(`${where}: "${source.path}" must be a plain repository-relative path.`)
    }
    if (!source.ref) {
      fail(`${where}: a repository source must pin a "ref".`)
    } else if (!tagPattern.test(source.ref) && !commitPattern.test(source.ref)) {
      fail(`${where}: "${source.ref}" is not an immutable ref; pin an exact tag or a 40-character commit.`)
    }
  }

  if (source.url) {
    if (!source.url.startsWith('https://')) {
      fail(`${where}: "${source.url}" must be an https URL.`)
    }
    if (!source.title) {
      fail(`${where}: an external source must carry a readable "title"; the published table links it by name.`)
    }
  }

  if (!source.governs) {
    fail(`${where}: must say what it "governs" in this page.`)
  }

  if (!source.reviewed) {
    fail(`${where}: must record the "reviewed" date.`)
  } else if (!datePattern.test(source.reviewed)) {
    fail(`${where}: "${source.reviewed}" is not an ISO date.`)
  } else if (source.reviewed > today) {
    fail(`${where}: reviewed date "${source.reviewed}" is in the future.`)
  }
}

let refused = false

/**
 * Asks GitHub about one path, returning `null` when the answer carries no verdict.
 *
 * Unauthenticated callers get sixty requests an hour, and this sweep resolves more than sixty paths.
 * A 403 or 429 therefore means "GitHub declined to answer", not "the document is gone" — reporting
 * one as the other is how a quiet afternoon turns into a page of invented breakages. The first
 * refusal stops the remaining network calls, since they would all be refused too.
 */
const api = async (url: string): Promise<Response | null> => {
  if (refused) return null
  const response = await githubFetch(url)
  if (!isRateLimited(response.status)) return response

  refused = true
  warn(`${rateLimitMessage(response.status)} The remaining network checks were skipped.`)
  return null
}

/**
 * Extracts links into Knowledge Islands repositories from a page's prose.
 *
 * These are not `sources` — a page links documents it never restated — but they rot the same way,
 * and until this check existed nothing looked at them. Two links to documents the harness had
 * deliberately removed sat published for weeks because the `sources` sweep only reads frontmatter.
 */
const proseLinks = (contents: string): ProseLink[] => {
  // A link is as likely to sit in inline code — a command's printed output — as in a Markdown target,
  // so the delimiter class carries backticks and quotes, and sentence punctuation is trimmed after.
  const pattern = /https:\/\/github\.com\/(knowledgeislands\/[A-Za-z0-9._-]+)\/blob\/([^/\s)`>"']+)\/([^\s)`>"'#]+)/g
  const found: ProseLink[] = []
  for (const match of contents.matchAll(pattern)) {
    found.push({ repository: match[1], ref: match[2], path: match[3].replace(/[.,;:]+$/, '') })
  }
  return found
}

const checkProseLink = async (pages: string[], link: ProseLink): Promise<void> => {
  const endpoint = `https://api.github.com/repos/${link.repository}/contents/${link.path}?ref=${link.ref}`
  const response = await api(endpoint)
  if (!response || response.ok) return

  warn(
    `${pages.join(', ')}: links ${link.repository}/${link.path} at ${link.ref}, which does not resolve (HTTP ${response.status}). Readers following that link get nothing.`
  )
}

const upstreamHead = async (repository: string, path: string): Promise<string | null> => {
  const endpoint = `https://api.github.com/repos/${repository}/commits?path=${encodeURIComponent(path)}&per_page=1`
  const response = await api(endpoint)
  if (!response?.ok) return null
  const commits = (await response.json()) as { sha?: string }[]
  return commits[0]?.sha ?? null
}

/**
 * The newest release tag a repository has published, or `null` when it publishes none.
 *
 * Resolved once per repository. A sweep touching a dozen pages of one repository would
 * otherwise spend a dozen of the sixty unauthenticated requests an hour asking the same
 * question, and the first refusal stops every check after it.
 */
const latestReleases = new Map<string, string | null>()

const latestRelease = async (repository: string): Promise<string | null> => {
  const cached = latestReleases.get(repository)
  if (cached !== undefined) return cached

  const response = await api(`https://api.github.com/repos/${repository}/releases/latest`)
  if (!response?.ok) {
    // A refusal is not an answer, so it is not cached as one.
    if (response) latestReleases.set(repository, null)
    return null
  }
  const release = (await response.json()) as { tag_name?: string }
  const tag = release.tag_name ?? null
  latestReleases.set(repository, tag)
  return tag
}

const checkDrift = async (page: string, source: Source): Promise<void> => {
  if (!source.repository || !source.path || !source.ref) return

  const pinned = `https://api.github.com/repos/${source.repository}/contents/${source.path}?ref=${source.ref}`
  const pinnedResponse = await api(pinned)
  if (!pinnedResponse) return
  if (!pinnedResponse.ok) {
    fail(`${page}: ${source.repository}@${source.ref} does not serve ${source.path} (HTTP ${pinnedResponse.status}).`)
    return
  }
  const pinnedFile = (await pinnedResponse.json()) as { sha?: string }

  // A page pinned to a release tag is asking about releases, so that is what it is told about.
  // Comparing such a page against the default branch reports every unreleased upstream commit as
  // a refresh this site owes — which is true of any correctly pinned tag, fires from the moment
  // upstream merges anything, and cannot be resolved by refreshing, because there is nothing newer
  // to refresh to. A warning in that state is permanent, and a permanent warning teaches its reader
  // to skip the whole sweep. So the question becomes the one the page can act on: is there a newer
  // release? (KI-WEBSITE-SITE-026)
  // `releases/latest` answers with the newest non-prerelease, so it is the wrong comparand for a
  // page pinned to a prerelease: it would report an older stable tag as the refresh that is owed,
  // which is a refresh backwards. A prerelease pin falls through to the file comparison below,
  // which asks the question that pin can act on — has the file itself moved? (KI-WEBSITE-SITE-034)
  if (tagPattern.test(source.ref) && !prereleasePattern.test(source.ref)) {
    const latest = await latestRelease(source.repository)
    if (latest) {
      if (latest !== source.ref) {
        warn(
          `${page}: cites ${source.repository}/${source.path} at ${source.ref}, but ${latest} is released; a refresh is owed.`
        )
      }
      return
    }
    // No published release to compare against, so fall through to the branch comparison below.
  }

  const headResponse = await api(`https://api.github.com/repos/${source.repository}/contents/${source.path}`)
  if (!headResponse) return
  if (!headResponse.ok) {
    warn(
      `${page}: ${source.repository} no longer serves ${source.path} on its default branch; the source may have moved.`
    )
    return
  }
  const headFile = (await headResponse.json()) as { sha?: string }

  if (pinnedFile.sha && headFile.sha && pinnedFile.sha !== headFile.sha) {
    const moved = await upstreamHead(source.repository, source.path)
    const at = moved ? ` (now ${moved.slice(0, 7)})` : ''
    warn(`${page}: ${source.repository}/${source.path} has changed since ${source.ref}${at}; a refresh is owed.`)
  }
}

const network = process.argv.includes('--network')
const pages = [...publishedDirs.flatMap(markdownFiles).sort(), ...handBuiltPages]

if (pages.length === 0) {
  fail('No published pages found; expected Markdown below src/docs/.')
}

// A declaration readers never see is not a published citation. Every page here
// renders through the prose layout, so the layout is where that is held: the
// check used to run per page, back when thirty-five bodies each pasted the
// include in for themselves (KI-WEBSITE-SITE-024).
if (!readFileSync(proseLayout, 'utf-8').includes(sourcesPartial)) {
  fail(`${relative(siteRoot, proseLayout)}: does not include "${sourcesPartial}", so no page publishes its sources.`)
}
for (const page of handBuiltPages) {
  if (!readFileSync(page, 'utf-8').includes(sourcesPartial)) {
    fail(`${relative(siteRoot, page)}: does not include "${sourcesPartial}", so it does not publish its sources.`)
  }
}

const repositorySources: { page: string; source: Source }[] = []
const linkTargets = new Map<string, { link: ProseLink; pages: string[] }>()

for (const file of pages) {
  const page = relative(siteRoot, file)
  const contents = readFileSync(file, 'utf-8')
  const parsed = readSources(contents)

  // Gathered before the branches below: a page claiming `sources: original` still links upstream documents.
  for (const link of proseLinks(contents)) {
    const key = `${link.repository}@${link.ref}:${link.path}`
    const target = linkTargets.get(key)
    if (target) {
      if (!target.pages.includes(page)) target.pages.push(page)
    } else {
      linkTargets.set(key, { link, pages: [page] })
    }
  }

  if (parsed.kind === 'malformed') {
    fail(`${page}: ${parsed.reason}.`)
    continue
  }
  if (parsed.kind === 'missing') {
    fail(
      `${page}: declares no "sources". Restated pages list their sources; pages with no upstream declare "sources: original".`
    )
    continue
  }
  if (parsed.kind === 'original') {
    continue
  }

  parsed.entries.forEach((source, position) => {
    checkEntry(page, position, source)
    if (source.repository) repositorySources.push({ page, source })
  })
}

/**
 * Holds a vendored snapshot to the ref its page cites.
 *
 * A vendored page publishes its snapshot's content and its frontmatter's citation as one claim. If
 * the two refs drift apart the page cites a document it is not showing, which is a local
 * inconsistency rather than upstream movement — so unlike drift, this fails, and fails offline.
 */
const checkVendoredSnapshot = (vendored: string): void => {
  let snapshot: { source?: Source & { roster?: string }; charted?: unknown }
  try {
    snapshot = JSON5.parse(readFileSync(vendored, 'utf-8'))
  } catch (error) {
    fail(`${relative(siteRoot, vendored)}: could not be read (${(error as Error).message}).`)
    return
  }

  const { repository, path, ref, roster } = snapshot.source ?? {}
  if (!repository || !path || !ref) {
    fail(`${relative(siteRoot, vendored)}: must declare the repository, path, and ref it was taken from.`)
    return
  }

  // A dated snapshot (GDR-KI-DESIGN-031) publishes its date as a stamp, so the date is held like `reviewed`.
  if (snapshot.charted !== undefined) {
    const charted = String(snapshot.charted)
    if (!datePattern.test(charted) || Number.isNaN(Date.parse(charted))) {
      fail(`${relative(siteRoot, vendored)}: charted "${charted}" is not an ISO date.`)
    } else if (charted > today) {
      fail(`${relative(siteRoot, vendored)}: charted date "${charted}" is in the future.`)
    }
  }

  // A snapshot drawn from two files of one repository at one commit names the second as its `roster`, and
  // both must be cited at that commit.
  for (const vendoredPath of roster ? [path, roster] : [path]) {
    const citing = repositorySources.filter(
      (entry) => entry.source.repository === repository && entry.source.path === vendoredPath
    )
    if (citing.length === 0) {
      fail(
        `${relative(siteRoot, vendored)}: vendors ${repository}/${vendoredPath}, but no published page declares it as a source. A vendored snapshot nobody cites is an undeclared copy.`
      )
      continue
    }

    for (const { page, source } of citing) {
      if (source.ref !== ref) {
        fail(
          `${page}: cites ${repository}/${vendoredPath} at ${source.ref}, but the vendored snapshot was taken at ${ref}. Re-run its sync at the cited ref, or advance the citation.`
        )
      }
    }
  }
}

for (const vendored of vendoredData) checkVendoredSnapshot(vendored)

/**
 * Holds the islands chart on /arcadia/ to the snapshot it draws (GDR-KI-DESIGN-031).
 *
 * The chart is `ki-design`'s renderer run over this site's own snapshot at sync time, so it can fall behind
 * the snapshot it sits beside: `sync:arcadia` re-charts the islands and the chart still shows the old ones.
 * The manifest records what it drew, so a stale or hand-edited chart fails here rather than publishing a
 * different set of islands from the list under it.
 */
const checkArchipelago = (): void => {
  const manifestPath = resolve(siteRoot, 'src/_data/arcadiaArchipelago.json5')
  const snapshotPath = resolve(siteRoot, 'src/_data/arcadiaSnapshot.json5')
  const where = relative(siteRoot, manifestPath)
  let manifest: {
    source?: Source
    drawnFrom?: { path?: string; ref?: string; charted?: string; islands?: string[] }
    files?: Record<string, string>
  }
  let snapshot: { source?: Source; charted?: string; islands?: { name: string }[] }
  try {
    manifest = JSON5.parse(readFileSync(manifestPath, 'utf-8'))
    snapshot = JSON5.parse(readFileSync(snapshotPath, 'utf-8'))
  } catch (error) {
    fail(`${where}: could not be read with its snapshot (${(error as Error).message}).`)
    return
  }

  const drawn = manifest.drawnFrom ?? {}
  const names = (snapshot.islands ?? []).map((island) => island.name)
  if (drawn.path !== relative(siteRoot, snapshotPath)) {
    fail(`${where}: drawnFrom.path must name ${relative(siteRoot, snapshotPath)}.`)
  }
  if (drawn.ref !== snapshot.source?.ref || drawn.charted !== snapshot.charted) {
    fail(
      `${where}: drew the snapshot taken at ${drawn.ref} on ${drawn.charted}, but the snapshot is ${snapshot.source?.ref} on ${snapshot.charted}. Re-run sync:design after sync:arcadia.`
    )
  }
  if (JSON.stringify(drawn.islands) !== JSON.stringify(names)) {
    fail(`${where}: drew islands ${JSON.stringify(drawn.islands)}, but the snapshot lists ${JSON.stringify(names)}.`)
  }

  const files = Object.values(manifest.files ?? {})
  if (files.length === 0) fail(`${where}: lists no chart files.`)
  for (const file of files) {
    const path = resolve(siteRoot, file)
    if (!existsSync(path)) {
      fail(`${where}: lists ${file}, which does not exist.`)
      continue
    }
    const svg = readFileSync(path, 'utf-8')
    const header = svg.slice(0, svg.indexOf('-->'))
    if (!header.includes(`at ${manifest.source?.ref}:`) || !header.includes(`at ${snapshot.source?.ref},`)) {
      fail(`${file}: its provenance header does not name the renderer ref and snapshot ref the manifest records.`)
    }
    const drawnIslands = [...svg.matchAll(/ data-island="([^"]*)"/g)].map((match) => match[1])
    if (JSON.stringify([...drawnIslands].sort()) !== JSON.stringify([...names].sort())) {
      fail(`${file}: draws islands ${JSON.stringify(drawnIslands)}, not the snapshot's ${JSON.stringify(names)}.`)
    }
  }
}

checkArchipelago()

if (network && failures.length === 0) {
  for (const { page, source } of repositorySources) {
    await checkDrift(page, source)
  }
  for (const { link, pages: linkedFrom } of linkTargets.values()) {
    await checkProseLink(linkedFrom, link)
  }
}

for (const message of warnings) {
  console.warn(`warning: ${message}`)
}

if (failures.length > 0) {
  for (const message of failures) {
    console.error(`error: ${message}`)
  }
  console.error(`\nProvenance check failed with ${failures.length} error(s).`)
  process.exit(1)
}

const scope = network
  ? `${pages.length} pages, ${repositorySources.length} repository sources and ${linkTargets.size} prose links resolved`
  : `${pages.length} pages`
console.log(`Provenance verified (${scope}).`)
