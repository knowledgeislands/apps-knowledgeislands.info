/**
 * Vendors the harness's generated capability catalogue into site data.
 *
 * `/docs/ki-agentic-harness/skill-catalogue/` used to restate every skill in hand-written prose, which is
 * the one guidance page where the derived account added nothing: it was the upstream inventory,
 * reworded, and it rotted accordingly. The harness already publishes that inventory as a specified
 * interface — `ki-repo-harness` names the two markers normatively and fixes the fields between them
 * — so the site consumes it rather than paraphrasing it.
 *
 * The catalogue groups skills by source concern, the folder each lives in. The harness also keeps a
 * functional-area table — what each skill is for — as the reading aid its skill diagrams are drawn
 * from. That table lives in the generator, `skill-functions.ts`, not in `SKILL.md` frontmatter, so
 * this sync reads it from the same commit and attaches each skill's areas beside its entry. The two
 * files are one snapshot: the gate holds both to the ref the citing page declares.
 *
 * The snapshot is vendored at an immutable ref rather than fetched during the build. `apps/site/dist/`
 * must be reproducible, and a build that reached the network would depend on when it ran. Drift is
 * caught by the ordinary provenance sweep, because the page still declares the same `sources` entries.
 *
 * Usage: bun scripts/sync-skill-catalogue.ts --ref <tag-or-commit>
 * See docs/guides/developer/page-provenance.md.
 */

import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import JSON5 from 'json5'
import { githubFetchOk } from './lib/github.ts'

export const CATALOGUE_START = '<!-- ki-repo-harness:capability-catalogue:start -->'
export const CATALOGUE_END = '<!-- ki-repo-harness:capability-catalogue:end -->'

const SOURCE_REPOSITORY = 'knowledgeislands/ki-agentic-harness'
const SOURCE_PATH = 'skills/README.md'
/** The functional-area table the harness skill diagrams are generated from; read at the same commit. */
export const AREAS_PATH = 'skills/repo-structure/ki-repo-harness/scripts/rubric/contexts/skill-functions.ts'

const tagPattern = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const commitPattern = /^[0-9a-f]{40}$/

export interface CatalogueField {
  label: string
  value: string
}

export interface ParsedSkill {
  name: string
  description: string
  kind: string
  /** The published fields in the order upstream lists them, carried verbatim so the page renders a copy. */
  fields: CatalogueField[]
}

export interface ParsedDomain {
  name: string
  skills: ParsedSkill[]
}

/** The catalogue block alone, before the functional areas are attached. */
export interface ParsedCatalogue {
  counts: { total: number; governance: number; process: number }
  domains: ParsedDomain[]
}

/** One capability group inside a functional area; an untitled group is the area itself. */
export interface AreaGroup {
  title?: string
  skills: string[]
}

/** A functional area as the harness table states it, in drawing order. */
export interface FunctionalArea {
  slug: string
  title: string
  short: string
  purpose: string
  groups: AreaGroup[]
}

/** One area a skill serves, with the capability group it sits in where the area is split. */
export interface SkillArea {
  slug: string
  title: string
  group?: string
}

export interface CatalogueSkill extends ParsedSkill {
  /** The areas the skill serves, in table order; the first is its home. */
  areas: SkillArea[]
}

export interface CatalogueDomain {
  name: string
  skills: CatalogueSkill[]
}

export interface Catalogue {
  counts: { total: number; governance: number; process: number }
  areas: FunctionalArea[]
  domains: CatalogueDomain[]
}

/** Field values arrive as Markdown bullets; the label is fixed by the upstream standard. */
const fieldPattern = /^- \*\*([A-Za-z]+):\*\* (.+)$/

const REQUIRED_FIELDS = ['Kind', 'Applicability', 'Arguments', 'Dependencies', 'Runtime']

const parseSkill = (name: string, body: string): ParsedSkill => {
  const lines = body.split('\n')
  const description = lines
    .filter((line) => !fieldPattern.test(line))
    .join('\n')
    .trim()

  if (description === '') throw new Error(`${name}: entry carries no description`)

  const fields: CatalogueField[] = []
  for (const line of lines) {
    const match = line.match(fieldPattern)
    if (match) fields.push({ label: match[1], value: match[2].trim() })
  }

  const labels = fields.map((field) => field.label)
  const missing = REQUIRED_FIELDS.filter((field) => !labels.includes(field))
  if (missing.length > 0) {
    throw new Error(`${name}: entry is missing ${missing.join(', ')}`)
  }

  const kind = fields.find((field) => field.label === 'Kind')?.value as string
  if (kind !== 'Governance' && kind !== 'Process') {
    throw new Error(`${name}: Kind is "${kind}", expected Governance or Process`)
  }

  return { name, description, kind, fields }
}

/**
 * Parses the marker-delimited block out of the harness's `skills/README.md`.
 *
 * Every failure here is thrown rather than worked around. The block is a published contract, so a
 * shape this parser does not recognise means the contract changed — and a catalogue that silently
 * degrades to fewer skills is worse than one that refuses to build, because nobody would notice.
 */
export function parseCatalogue(markdown: string): ParsedCatalogue {
  const start = markdown.indexOf(CATALOGUE_START)
  const end = markdown.indexOf(CATALOGUE_END)
  if (start === -1 || end === -1) throw new Error('capability-catalogue markers not found')
  if (markdown.indexOf(CATALOGUE_START, start + 1) !== -1) throw new Error('duplicate start marker')
  if (start > end) throw new Error('capability-catalogue markers are reversed')

  const block = markdown.slice(start + CATALOGUE_START.length, end)

  // The generator states its own totals in the block's preamble; they are checked against the parse.
  const declared = block.match(/publishes (\d+) skills: (\d+) governance skills and (\d+) process skills/)
  if (!declared) throw new Error('capability-catalogue preamble does not state its skill counts')

  const domains: ParsedDomain[] = []
  let domain: ParsedDomain | null = null
  let skillName: string | null = null
  let skillLines: string[] = []

  const flushSkill = (): void => {
    if (!skillName) return
    if (!domain) throw new Error(`${skillName}: entry appears before any domain heading`)
    domain.skills.push(parseSkill(skillName, skillLines.join('\n')))
    skillName = null
    skillLines = []
  }

  for (const line of block.split('\n')) {
    const skillHeading = line.match(/^#### `([a-z0-9-]+)`$/)
    if (skillHeading) {
      flushSkill()
      skillName = skillHeading[1]
      continue
    }

    const domainHeading = line.match(/^### (.+)$/)
    if (domainHeading) {
      flushSkill()
      domain = { name: domainHeading[1].trim(), skills: [] }
      domains.push(domain)
      continue
    }

    if (skillName) skillLines.push(line)
  }
  flushSkill()

  const skills = domains.flatMap((entry) => entry.skills)
  const counts = {
    total: skills.length,
    governance: skills.filter((skill) => skill.kind === 'Governance').length,
    process: skills.filter((skill) => skill.kind === 'Process').length
  }

  const [, total, governance, processed] = declared.map(Number)
  if (counts.total !== total || counts.governance !== governance || counts.process !== processed) {
    throw new Error(
      `parsed ${counts.total} skills (${counts.governance} governance, ${counts.process} process) but the block declares ${total} (${governance} governance, ${processed} process)`
    )
  }

  const names = skills.map((skill) => skill.name)
  const duplicate = names.find((name, position) => names.indexOf(name) !== position)
  if (duplicate) throw new Error(`${duplicate}: appears more than once`)

  return { counts, domains }
}

const AREAS_DECLARATION = 'export const FUNCTIONAL_AREAS: readonly FunctionalArea[] = ['
const slugPattern = /^[a-z][a-z0-9-]*$/
const skillNamePattern = /^ki-[a-z0-9-]+$/

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const text = (where: string, record: Record<string, unknown>, key: string): string => {
  const value = record[key]
  if (typeof value !== 'string' || value.trim() === '') throw new Error(`${where}: ${key} must be a non-empty string`)
  return value
}

const onlyKeys = (where: string, record: Record<string, unknown>, allowed: readonly string[]): void => {
  const unknown = Object.keys(record).filter((key) => !allowed.includes(key))
  if (unknown.length > 0)
    throw new Error(`${where}: unexpected key${unknown.length > 1 ? 's' : ''} ${unknown.join(', ')}`)
}

const parseGroup = (where: string, value: unknown): AreaGroup => {
  if (!isRecord(value)) throw new Error(`${where}: each group must be an object`)
  onlyKeys(where, value, ['title', 'skills'])
  const skills = value.skills
  if (!Array.isArray(skills) || skills.length === 0) throw new Error(`${where}: skills must be a non-empty list`)
  for (const skill of skills) {
    if (typeof skill !== 'string' || !skillNamePattern.test(skill)) {
      throw new Error(`${where}: "${String(skill)}" is not a skill name`)
    }
  }
  return 'title' in value
    ? { title: text(where, value, 'title'), skills: skills as string[] }
    : { skills: skills as string[] }
}

/**
 * Parses the functional-area table out of the harness's `skill-functions.ts`.
 *
 * The table is a TypeScript array literal of plain values, which is also a JSON5 document, so it is
 * read as data rather than executed. Anything the table might one day gain — a computed value, a new
 * key, an identifier — fails here, because a silently narrowed reading would publish areas the
 * harness does not draw.
 */
export function parseFunctionalAreas(source: string): FunctionalArea[] {
  const declaration = source.indexOf(AREAS_DECLARATION)
  if (declaration === -1) throw new Error(`${AREAS_PATH}: FUNCTIONAL_AREAS declaration not found`)
  if (source.indexOf(AREAS_DECLARATION, declaration + 1) !== -1) {
    throw new Error(`${AREAS_PATH}: FUNCTIONAL_AREAS is declared more than once`)
  }
  const open = declaration + AREAS_DECLARATION.length - 1
  const close = source.indexOf('\n]', open)
  if (close === -1) throw new Error(`${AREAS_PATH}: FUNCTIONAL_AREAS literal is not closed`)
  const literal = source.slice(open, close + 2)

  let parsed: unknown
  try {
    parsed = JSON5.parse(literal)
  } catch (error) {
    throw new Error(`${AREAS_PATH}: FUNCTIONAL_AREAS is not a literal table (${(error as Error).message})`)
  }
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error(`${AREAS_PATH}: FUNCTIONAL_AREAS is empty`)

  const areas: FunctionalArea[] = []
  for (const [position, entry] of parsed.entries()) {
    const where = `${AREAS_PATH}: area ${position + 1}`
    if (!isRecord(entry)) throw new Error(`${where}: must be an object`)
    onlyKeys(where, entry, ['slug', 'title', 'short', 'purpose', 'groups'])
    const slug = text(where, entry, 'slug')
    if (!slugPattern.test(slug)) throw new Error(`${where}: slug "${slug}" is not lowercase and hyphenated`)
    if (!Array.isArray(entry.groups) || entry.groups.length === 0) {
      throw new Error(`${where} (${slug}): groups must be a non-empty list`)
    }
    areas.push({
      slug,
      title: text(where, entry, 'title'),
      short: text(where, entry, 'short'),
      purpose: text(where, entry, 'purpose'),
      groups: entry.groups.map((group, index) => parseGroup(`${AREAS_PATH}: ${slug} group ${index + 1}`, group))
    })
  }

  const slugs = areas.map((area) => area.slug)
  const duplicate = slugs.find((slug, position) => slugs.indexOf(slug) !== position)
  if (duplicate) throw new Error(`${AREAS_PATH}: area "${duplicate}" appears more than once`)

  return areas
}

/**
 * Attaches each skill's functional areas to the parsed catalogue.
 *
 * The same three agreements the harness tests hold between its table and its skills are held here
 * between the table and the catalogue: every skill is in at least one area, every listed skill is in
 * the catalogue, and no skill is in two groups of one area. The two files were taken at one commit,
 * so a disagreement means the snapshot is torn, not that the harness is.
 */
export function withFunctionalAreas(catalogue: ParsedCatalogue, areas: FunctionalArea[]): Catalogue {
  const names = new Set(catalogue.domains.flatMap((domain) => domain.skills.map((skill) => skill.name)))
  const issues: string[] = []
  const listed = new Set<string>()

  for (const area of areas) {
    const entries = area.groups.flatMap((group) => group.skills)
    for (const name of new Set(entries)) {
      listed.add(name)
      if (!names.has(name)) issues.push(`${area.slug}: lists ${name}, which the catalogue does not hold`)
      if (entries.filter((each) => each === name).length > 1)
        issues.push(`${area.slug}: ${name} is in more than one group`)
    }
  }
  for (const name of names) if (!listed.has(name)) issues.push(`${name} is in no functional area`)
  if (issues.length > 0) throw new Error(`functional areas and catalogue disagree:\n  ${issues.sort().join('\n  ')}`)

  const areasOf = (name: string): SkillArea[] =>
    areas.flatMap((area) => {
      const group = area.groups.find((each) => each.skills.includes(name))
      if (!group) return []
      return [
        group.title === undefined
          ? { slug: area.slug, title: area.title }
          : { slug: area.slug, title: area.title, group: group.title }
      ]
    })

  return {
    counts: catalogue.counts,
    areas,
    domains: catalogue.domains.map((domain) => ({
      name: domain.name,
      skills: domain.skills.map((skill) => ({ ...skill, areas: areasOf(skill.name) }))
    }))
  }
}

/** Kept verbatim so the emitted file explains itself to whoever opens it next. */
const header = (ref: string): string => `// Vendored snapshot of the harness's generated capability catalogue.
//
// GENERATED FILE — do not edit. Regenerate with:
//   bun run --cwd apps/site sync:skills -- --ref <tag-or-commit>
//
// Parsed from ${SOURCE_REPOSITORY} ${SOURCE_PATH} between the
// ki-repo-harness:capability-catalogue markers, which that standard names normatively, and from
// ${AREAS_PATH},
// the functional-area table its skill diagrams are drawn from, read at the same commit. The second
// file is recorded as the snapshot's \`roster\`, the key verify:provenance holds a second file under.
//
// The ref below must match the ref declared in the sources frontmatter of
// src/docs/ki-agentic-harness/skill-catalogue.md; verify:provenance fails the build when they disagree.
// See docs/guides/developer/page-provenance.md.
//
// Snapshot taken at ${ref}.
`

async function main(): Promise<void> {
  const refFlag = process.argv.indexOf('--ref')
  const ref = refFlag === -1 ? undefined : process.argv[refFlag + 1]
  if (!ref) throw new Error('usage: sync-skill-catalogue.ts --ref <tag-or-commit>')
  if (!tagPattern.test(ref) && !commitPattern.test(ref)) {
    throw new Error(`${ref} is not an immutable ref; pass an exact tag or a 40-character commit`)
  }

  const raw = (path: string): string => `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${ref}/${path}`
  const [readme, functions] = await Promise.all([
    githubFetchOk(raw(SOURCE_PATH)).then((response) => response.text()),
    githubFetchOk(raw(AREAS_PATH)).then((response) => response.text())
  ])

  const catalogue = withFunctionalAreas(parseCatalogue(readme), parseFunctionalAreas(functions))
  const payload = {
    source: { repository: SOURCE_REPOSITORY, path: SOURCE_PATH, roster: AREAS_PATH, ref },
    ...catalogue
  }

  const target = resolve(import.meta.dirname, '../src/_data/skillCatalogue.json5')
  await writeFile(target, `${header(ref)}${JSON.stringify(payload, null, 2)}\n`)

  console.log(
    `sync-skill-catalogue: ${catalogue.counts.total} skills (${catalogue.counts.governance} governance, ${catalogue.counts.process} process) across ${catalogue.domains.length} domains and ${catalogue.areas.length} functional areas at ${ref}`
  )
}

if (import.meta.main) {
  await main().catch((error: Error) => {
    console.error(`sync-skill-catalogue: ${error.message}`)
    process.exit(1)
  })
}
