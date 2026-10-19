/**
 * Charts Arcadia's public islands from a local Knowledge Islands Principal checkout into a dated snapshot.
 *
 * GDR-KI-DESIGN-031 decided that `/arcadia/` draws from a dated snapshot: public islands only, stamped
 * "Charted YYYY-MM-DD", never claiming to be live. An island is a repository; the territory's inventory is
 * owned by the Capital, Knowledge Islands Principal, in two places that must agree: the ordered roster
 * (`territory_members` under `[skills.ki-repo]` in its `.ki.toml`) and the role table under "Internal
 * inventory" in `Admin/Governance/Known Lands.md`. This reads both at the checkout's HEAD, refuses any
 * disagreement between them, and writes `src/_data/arcadiaSnapshot.json5` with the commit they came from
 * and the date it was charted.
 *
 * The snapshot is taken here, explicitly, and committed; the build only reads it. A build that charted the
 * territory itself would depend on when it ran and on the network, and `apps/site/dist/` must be
 * reproducible (docs/guides/developer/page-provenance.md). The stamp therefore says when the chart was
 * drawn, which is the honest claim GDR-KI-DESIGN-031 asks for.
 *
 * Only public islands are charted. Visibility is not taken from any declaration: each repository is asked
 * for anonymously, with no token and no cookie, and only one GitHub shows to a stranger (HTTP 200) is kept.
 * A 404 means the island is not public and it is dropped without trace: the snapshot records neither its
 * name nor that anything was dropped. Any other answer stops the sync, because "GitHub would not say" is
 * not "public". The shared GitHub client is deliberately not used here, because it sends a token, and a
 * token would show private repositories.
 *
 * Usage: bun scripts/sync-arcadia-snapshot.ts [--from <path-to-ki-principal>] [--charted YYYY-MM-DD]
 *        (default: ../ki-principal beside this repository, charted today in UTC)
 */

import { execFileSync } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

export const SOURCE_REPOSITORY = 'knowledgeislands/ki-principal'
export const INVENTORY_PATH = 'Admin/Governance/Known Lands.md'
export const ROSTER_PATH = '.ki.toml'
export const SNAPSHOT_PATH = 'src/_data/arcadiaSnapshot.json5'

const commitPattern = /^[0-9a-f]{40}$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/
const islandUrlPattern = /^https:\/\/github\.com\/knowledgeislands\/([a-z0-9]+(?:[-.][a-z0-9]+)*)$/

/** One row of the Capital's inventory: the repository, its role in the territory, and the concern it owns. */
export interface InventoryRow {
  name: string
  url: string
  role: string
  concern: string
}

export interface Roster {
  capital: string
  members: string[]
}

export interface Island {
  name: string
  repository: string
  role: string
  concern: string
}

export interface ArcadiaSnapshot {
  source: { repository: string; path: string; roster: string; ref: string }
  charted: string
  islands: Island[]
}

/** Matches `"…"` as a TOML basic string; the roster holds URLs, so no escapes are expected or accepted. */
const tomlString = (raw: string, where: string): string => {
  const match = raw.trim().match(/^"([^"\\]*)"$/)
  if (!match) throw new Error(`${where}: expected a plain quoted string, found ${raw.trim()}`)
  return match[1]
}

const islandName = (url: string, where: string): string => {
  const match = url.match(islandUrlPattern)
  if (!match) throw new Error(`${where}: "${url}" is not a knowledgeislands repository URL`)
  return match[1]
}

/**
 * Reads the Capital and the ordered roster from `[skills.ki-repo]`. A deliberately narrow reader rather than a
 * TOML parser: the site has no TOML dependency, and the two keys have one shape. Anything else is refused.
 */
export function parseRoster(toml: string): Roster {
  const lines = toml.split('\n')
  const start = lines.findIndex((line) => line.trim() === '[skills.ki-repo]')
  if (start === -1) throw new Error(`${ROSTER_PATH}: no [skills.ki-repo] table`)
  const end = lines.findIndex((line, index) => index > start && /^\s*\[/.test(line))
  const table = lines.slice(start + 1, end === -1 ? undefined : end)

  const capitalLine = table.find((line) => /^capital\s*=/.test(line))
  if (!capitalLine) throw new Error(`${ROSTER_PATH}: [skills.ki-repo] names no capital`)
  const capital = tomlString(capitalLine.slice(capitalLine.indexOf('=') + 1), `${ROSTER_PATH} capital`)
  islandName(capital, `${ROSTER_PATH} capital`)

  const open = table.findIndex((line) => /^territory_members\s*=\s*\[\s*$/.test(line))
  if (open === -1) throw new Error(`${ROSTER_PATH}: [skills.ki-repo] has no multi-line territory_members array`)
  const close = table.findIndex((line, index) => index > open && line.trim() === ']')
  if (close === -1) throw new Error(`${ROSTER_PATH}: territory_members is not closed`)

  const members: string[] = []
  for (const line of table.slice(open + 1, close)) {
    if (line.trim() === '') continue
    const url = tomlString(line.trim().replace(/,$/, ''), `${ROSTER_PATH} territory_members`)
    islandName(url, `${ROSTER_PATH} territory_members`)
    if (members.includes(url)) throw new Error(`${ROSTER_PATH}: ${url} is listed twice`)
    members.push(url)
  }
  if (!members.includes(capital)) throw new Error(`${ROSTER_PATH}: the capital ${capital} is not a territory member`)
  return { capital, members }
}

/**
 * Reads the role table under "## Internal inventory". Each row is `| [name][name] | Role | Concern |`, with the
 * link resolved from the note's reference definitions. Refuses an unexpected header, an unresolved link, a
 * row whose link does not match its name, or an empty cell.
 */
export function parseInventory(markdown: string): InventoryRow[] {
  const lines = markdown.split('\n')
  const start = lines.findIndex((line) => line.trim() === '## Internal inventory')
  if (start === -1) throw new Error(`${INVENTORY_PATH}: no "## Internal inventory" section`)
  const end = lines.findIndex((line, index) => index > start && (/^## /.test(line) || line.trim() === '---'))
  const section = lines.slice(start + 1, end === -1 ? undefined : end)

  const header = section.findIndex((line) => line.trim().startsWith('|'))
  const cells = (line: string): string[] =>
    line
      .trim()
      .replace(/^\||\|$/g, '')
      .split('|')
      .map((cell) => cell.trim())
  if (header === -1 || cells(section[header]).join('|') !== 'Repository|Role|Owned concern') {
    throw new Error(`${INVENTORY_PATH}: the internal inventory table must be headed Repository | Role | Owned concern`)
  }

  const definitions = new Map<string, string>()
  for (const line of lines) {
    const match = line.match(/^\[([^\]]+)\]:\s+(\S+)\s*$/)
    if (match) definitions.set(match[1], match[2])
  }

  const rows: InventoryRow[] = []
  for (const line of section.slice(header + 2)) {
    if (!line.trim().startsWith('|')) break
    const [repository, role, concern, ...rest] = cells(line)
    if (rest.length > 0 || !role || !concern) throw new Error(`${INVENTORY_PATH}: unreadable inventory row: ${line}`)
    const link = repository.match(/^\[([^\]]+)\]\[([^\]]+)\]$/)
    if (!link || link[1] !== link[2]) throw new Error(`${INVENTORY_PATH}: expected [name][name], found ${repository}`)
    const url = definitions.get(link[2])
    if (!url) throw new Error(`${INVENTORY_PATH}: [${link[2]}] has no link definition`)
    if (islandName(url, INVENTORY_PATH) !== link[1]) {
      throw new Error(`${INVENTORY_PATH}: [${link[1]}] links ${url}, a different repository`)
    }
    if (rows.some((row) => row.url === url)) throw new Error(`${INVENTORY_PATH}: ${link[1]} is listed twice`)
    rows.push({ name: link[1], url, role, concern })
  }
  if (rows.length === 0) throw new Error(`${INVENTORY_PATH}: the internal inventory lists no repositories`)
  return rows
}

/** The answer an anonymous visitor gets for a repository: shown, or not there for them. */
export type Visibility = 'public' | 'not-public'

/**
 * Asks GitHub for the repository page as a stranger would. Only 200 is public and only 404 is not; a redirect
 * (a renamed repository), a refusal or an outage stops the sync rather than guessing either way.
 */
export const probeVisibility = async (url: string): Promise<Visibility> => {
  const response = await fetch(url, { method: 'HEAD', redirect: 'manual', headers: { 'user-agent': 'ki-website' } })
  if (response.status === 200) return 'public'
  if (response.status === 404) return 'not-public'
  throw new Error(`${url} answered HTTP ${response.status} to an anonymous request; cannot tell whether it is public`)
}

/**
 * Reconciles the roster with the inventory, keeps the public islands, and orders them Capital first, then as
 * the roster lists them. The two inventories must agree exactly, as Known Lands says they do; a member in one
 * and not the other is a finding for the Capital's owners, not something to chart around.
 */
export async function buildArcadiaSnapshot(
  roster: Roster,
  inventory: readonly InventoryRow[],
  ref: string,
  charted: string,
  probe: (url: string) => Promise<Visibility> = probeVisibility
): Promise<ArcadiaSnapshot> {
  if (!commitPattern.test(ref)) throw new Error(`"${ref}" is not a 40-character commit`)
  if (!datePattern.test(charted) || Number.isNaN(Date.parse(charted))) {
    throw new Error(`"${charted}" is not an ISO date`)
  }

  const byUrl = new Map(inventory.map((row) => [row.url, row]))
  const missing = roster.members.filter((url) => !byUrl.has(url))
  const extra = inventory.filter((row) => !roster.members.includes(row.url)).map((row) => row.url)
  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      `the roster and the inventory disagree (only in ${ROSTER_PATH}: ${missing.join(', ') || 'none'}; only in ${INVENTORY_PATH}: ${extra.join(', ') || 'none'})`
    )
  }
  const capitalRow = byUrl.get(roster.capital)
  if (capitalRow?.role !== 'Capital') {
    throw new Error(`${INVENTORY_PATH}: the capital ${roster.capital} is not given the role Capital`)
  }

  const ordered = [roster.capital, ...roster.members.filter((url) => url !== roster.capital)]
  const islands: Island[] = []
  for (const url of ordered) {
    if ((await probe(url)) !== 'public') continue
    const row = byUrl.get(url) as InventoryRow
    islands.push({ name: row.name, repository: url, role: row.role, concern: row.concern })
  }
  if (islands[0]?.repository !== roster.capital) {
    throw new Error(`the capital ${roster.capital} is not public; refusing to chart Arcadia without it`)
  }
  return {
    source: { repository: SOURCE_REPOSITORY, path: INVENTORY_PATH, roster: ROSTER_PATH, ref },
    charted,
    islands
  }
}

export const renderSnapshot = (snapshot: ArcadiaSnapshot): string =>
  [
    "// Dated snapshot of Arcadia's public islands, charted from Knowledge Islands Principal (GDR-KI-DESIGN-031).",
    '//',
    '// GENERATED FILE — do not edit. Regenerate with:',
    '//   bun run --cwd apps/site sync:arcadia',
    '//',
    `// Taken from ${SOURCE_REPOSITORY} ${INVENTORY_PATH} (roles) and ${ROSTER_PATH} (the roster),`,
    '// which must agree. Only repositories GitHub shows to an anonymous visitor are kept; nothing about the others',
    '// is recorded. The ref below must match the ref declared for both files in the sources frontmatter of',
    '// src/arcadia/index.njk; verify:provenance fails the build when they disagree.',
    '//',
    `// Charted ${snapshot.charted} at ${snapshot.source.ref}.`,
    JSON.stringify(snapshot, null, 2),
    ''
  ].join('\n')

const git = (cwd: string, ...args: string[]): string =>
  execFileSync('git', ['-C', cwd, ...args])
    .toString()
    .trim()

const option = (name: string): string | undefined => {
  const index = process.argv.indexOf(name)
  return index === -1 ? undefined : process.argv[index + 1]
}

async function main(): Promise<void> {
  const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const from = resolve(option('--from') ?? resolve(siteRoot, '../../../ki-principal'))
  const charted = option('--charted') ?? new Date().toISOString().slice(0, 10)

  const ref = git(from, 'rev-parse', 'HEAD')
  const dirty = git(from, 'status', '--porcelain', '--untracked-files=no', '--', ROSTER_PATH, INVENTORY_PATH)
  if (dirty !== '') throw new Error(`${from} has uncommitted changes to ${ROSTER_PATH} or ${INVENTORY_PATH}`)

  const snapshot = await buildArcadiaSnapshot(
    parseRoster(git(from, 'show', `${ref}:${ROSTER_PATH}`)),
    parseInventory(git(from, 'show', `${ref}:${INVENTORY_PATH}`)),
    ref,
    charted
  )
  await writeFile(resolve(siteRoot, SNAPSHOT_PATH), renderSnapshot(snapshot))

  console.log(`sync-arcadia-snapshot: charted ${snapshot.islands.length} public islands at ${ref} on ${charted}`)
  console.log('Advance the ki-principal ref and reviewed date in src/arcadia/index.njk sources to match.')
}

// `import.meta.main` is Bun's; the comparison lets the same file run under Node's type stripping.
if (import.meta.main ?? process.argv[1] === fileURLToPath(import.meta.url)) {
  await main()
}
