/**
 * Verifies the website-owned directory of ecosystem projects.
 *
 * This is the one registry behind `/projects/`, released command-line tools
 * included. A tool is a project that ships a binary, so a `kind: 'tool'` entry
 * carries release and install fields and every other kind must carry none of
 * them — that boundary is what this check holds, along with completeness and
 * the rule that every card leads somewhere the build actually produced.
 *
 * Completeness now includes the reader-facing fields a generated page is built
 * from. An entry without a `route` becomes `/projects/<slug>/`, so it must be
 * able to say what problem it solves, who has that problem, what it does, what
 * state it is in and what it does not do. Without that gate the template would
 * render a page with empty sections, which is worse than the thin page it
 * replaced because it looks deliberate (KI-WEBSITE-SITE-023).
 *
 * The release fields themselves — version shape, pinned refs, immutable tags —
 * are `verify-tool-routes.ts`. This file owns which entries may declare them.
 *
 * Offline checks run by default. `--network` additionally confirms every
 * declared repository is a public `knowledgeislands` repository, so the
 * directory cannot quietly advertise a private or deleted one.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSON5 from 'json5'
import { githubFetch } from './lib/github.ts'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryPath = resolve(siteRoot, 'src/_data/projects.json5')
const iconsPath = resolve(siteRoot, 'src/_includes/macros/icons.njk')
const distDir = resolve(siteRoot, 'dist')

const kinds = ['principal', 'capability', 'standard', 'tool', 'mcp', 'platform']
const releaseFields = ['version', 'maturity', 'formula', 'installer', 'manual', 'changelog']
const readerFields = ['problem', 'audience', 'state', 'limits']

// Floors, not targets. They exist to catch a placeholder — a field filled with
// "TODO" or a restated tagline — rather than to judge prose. Every entry in the
// registry today clears them by a wide margin.
const minimumReaderLength = 80
const minimumCapabilities = 3
const minimumCapabilityLength = 20

const availabilities = ['published', 'source']
const accents = ['gold', 'teal', 'forest']
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const repositoryPrefix = 'https://github.com/knowledgeislands/'

interface Project {
  slug: string
  name: string
  kind: string
  tagline: string
  description: string
  role: string
  usage: string
  repository: string
  availability: string
  route?: string
  icon: string
  accent: string
  version?: string
  problem?: string
  audience?: string
  capabilities?: string[]
  state?: string
  limits?: string
}

const failures: string[] = []
const warnings: string[] = []

const fail = (message: string): void => {
  failures.push(message)
}

const warn = (message: string): void => {
  warnings.push(message)
}

/** Reads the KI symbol names the icon macro actually defines. */
const declaredIcons = (): Set<string> => {
  const source = readFileSync(iconsPath, 'utf-8')
  return new Set([...source.matchAll(/name == "([^"]+)"/g)].map((match) => match[1] as string))
}

const requireText = (record: Record<string, unknown>, field: string, where: string): void => {
  const value = record[field]
  if (typeof value !== 'string' || value.trim() === '') fail(`${where}: "${field}" must be a non-empty string`)
}

/**
 * Holds a generated page's entry to the material that page is built from.
 *
 * An entry that declares a `route` has a richer home elsewhere on the site and
 * is exempt; anything it does declare is still checked, so an exemption cannot
 * be used to smuggle in a half-written field.
 */
const checkReaderFields = (project: Project, where: string): void => {
  const record = project as unknown as Record<string, unknown>
  const generated = typeof project.route !== 'string'

  for (const field of readerFields) {
    const value = record[field]
    if (value === undefined) {
      if (generated) fail(`${where}: a generated page must declare "${field}"`)
      continue
    }
    if (typeof value !== 'string' || value.trim() === '') {
      fail(`${where}: "${field}" must be a non-empty string`)
      continue
    }
    if (value.trim().length < minimumReaderLength) {
      fail(`${where}: "${field}" is ${value.trim().length} characters; a reader needs at least ${minimumReaderLength}`)
    }
  }

  const capabilities = record.capabilities
  if (capabilities === undefined) {
    if (generated) fail(`${where}: a generated page must declare "capabilities"`)
    return
  }

  if (!Array.isArray(capabilities)) {
    fail(`${where}: "capabilities" must be an array of plain sentences`)
    return
  }

  if (capabilities.length < minimumCapabilities) {
    fail(`${where}: "capabilities" lists ${capabilities.length} item(s); at least ${minimumCapabilities} are needed`)
  }

  for (const [index, capability] of capabilities.entries()) {
    if (typeof capability !== 'string' || capability.trim().length < minimumCapabilityLength) {
      fail(`${where}: capabilities[${index}] must be a sentence of at least ${minimumCapabilityLength} characters`)
    }
  }
}

const readRegistry = <T>(path: string, label: string): T[] => {
  const parsed = JSON5.parse(readFileSync(path, 'utf-8')) as unknown
  if (!Array.isArray(parsed) || parsed.length === 0) {
    fail(`${label} must be a non-empty array of declarations`)
    return []
  }
  return parsed as T[]
}

/**
 * Resolves a declared `route` to the file the build should have written, so a
 * card pointing at a section that was renamed or removed fails the gate
 * instead of shipping as a dead link.
 */
const outputFor = (route: string): string => resolve(distDir, `.${route.endsWith('/') ? `${route}index.html` : route}`)

const checkRegistry = (projects: Project[]): void => {
  const icons = declaredIcons()
  const seen = new Set<string>()

  for (const [index, project] of projects.entries()) {
    const where = `projects[${index}]${typeof project.slug === 'string' ? ` (${project.slug})` : ''}`
    const record = project as unknown as Record<string, unknown>

    for (const field of [
      'slug',
      'name',
      'kind',
      'tagline',
      'description',
      'role',
      'usage',
      'repository',
      'availability',
      'icon',
      'accent'
    ]) {
      requireText(record, field, where)
    }

    // Project fields render as plain text (see the registry header), so Markdown
    // syntax would reach the reader as literal characters (KI-WEBSITE-SITE-032).
    for (const field of ['tagline', 'description', 'usage', 'capabilities', ...readerFields]) {
      const values = ([] as unknown[]).concat(record[field] ?? [])
      if (values.some((value) => typeof value === 'string' && value.includes('`'))) {
        fail(`${where}: "${field}" contains a backtick; project prose renders as plain text`)
      }
    }

    if (typeof project.slug === 'string') {
      if (!slugPattern.test(project.slug)) fail(`${where}: "slug" must be lowercase kebab-case`)
      if (seen.has(project.slug)) fail(`${where}: duplicate slug "${project.slug}"`)
      seen.add(project.slug)
    }

    if (!kinds.includes(project.kind)) {
      fail(`${where}: "kind" must be one of ${kinds.join(', ')}, got "${project.kind}"`)
    }

    if (!availabilities.includes(project.availability)) {
      fail(`${where}: "availability" must be one of ${availabilities.join(', ')}, got "${project.availability}"`)
    }

    if (!accents.includes(project.accent)) {
      fail(`${where}: "accent" must be one of ${accents.join(', ')}, got "${project.accent}"`)
    }

    if (typeof project.icon === 'string' && !icons.has(project.icon)) {
      fail(`${where}: "icon" is "${project.icon}", which macros/icons.njk does not define`)
    }

    if (typeof project.repository !== 'string' || !project.repository.startsWith(repositoryPrefix)) {
      fail(`${where}: "repository" must be a ${repositoryPrefix}* URL`)
    }

    if (project.route !== undefined) {
      if (typeof project.route !== 'string' || !project.route.startsWith('/')) {
        fail(`${where}: "route" must be an absolute site path, or be omitted entirely`)
      } else if (project.route.startsWith('/projects/')) {
        fail(`${where}: "route" must not point back into /projects/; omit it and the page is generated`)
      }
    }

    checkReaderFields(project, where)

    // A version and an installer are a promise about a specific release, and
    // only a released tool is allowed to make one. Requiring the whole set on a
    // tool matters as much as forbidding it elsewhere: a half-declared entry
    // renders an install block with a missing link rather than failing here.
    for (const field of releaseFields) {
      const declared = record[field] !== undefined
      if (project.kind === 'tool' && !declared) {
        fail(`${where}: a released tool must declare "${field}"`)
      }
      if (project.kind !== 'tool' && declared) {
        fail(`${where}: "${field}" belongs to a kind: 'tool' entry, not to a ${project.kind} project`)
      }
    }
  }

  const missingKinds = kinds.filter((kind) => !projects.some((project) => project.kind === kind))
  if (missingKinds.length > 0) {
    warn(`no project declares the kind(s) ${missingKinds.join(', ')}; /projects/ will render an empty group`)
  }
}

/** Checks the built output when one is present; a clean tree simply skips this. */
const checkBuild = (projects: Project[]): void => {
  if (!existsSync(distDir)) {
    warn('dist/ is absent, so the generated routes were not checked; run the site build first')
    return
  }

  if (!existsSync(resolve(distDir, 'projects', 'index.html'))) {
    fail('dist/projects/index.html was not generated')
  }

  for (const project of projects) {
    if (typeof project.route === 'string') {
      if (!existsSync(outputFor(project.route))) {
        fail(`${project.slug}: declared route ${project.route} has no generated page in dist/`)
      }
      if (existsSync(resolve(distDir, 'projects', project.slug, 'index.html'))) {
        fail(
          `${project.slug}: declares route ${project.route} but dist/projects/${project.slug}/ also exists; run the clean script before building`
        )
      }
      continue
    }

    if (!existsSync(resolve(distDir, 'projects', project.slug, 'index.html'))) {
      fail(`dist/projects/${project.slug}/index.html was not generated`)
    }
  }
}

const checkNetwork = async (projects: Project[]): Promise<void> => {
  for (const project of projects) {
    const repository = project.repository.slice('https://github.com/'.length)
    try {
      const response = await githubFetch(`https://api.github.com/repos/${repository}`)
      if (response.status === 404) {
        fail(`${project.slug}: ${project.repository} is not publicly visible`)
        continue
      }
      if (!response.ok) {
        warn(`${project.slug}: could not read ${repository} (HTTP ${response.status})`)
        continue
      }
      const metadata = (await response.json()) as { private?: boolean; archived?: boolean }
      if (metadata.private === true) fail(`${project.slug}: ${repository} is private and must not be listed`)
      if (metadata.archived === true) warn(`${project.slug}: ${repository} is archived; confirm it still belongs here`)
    } catch (error) {
      warn(`${project.slug}: could not read ${repository} — ${(error as Error).message}`)
    }
  }
}

const projects = readRegistry<Project>(registryPath, 'src/_data/projects.json5')
checkRegistry(projects)
checkBuild(projects)
if (process.argv.includes('--network')) await checkNetwork(projects)

for (const message of warnings) console.warn(`warning: ${message}`)

if (failures.length > 0) {
  for (const message of failures) console.error(`error: ${message}`)
  console.error(`\nverify-projects: ${failures.length} problem(s) found`)
  process.exit(1)
}

const tools = projects.filter((project) => project.kind === 'tool')
console.log(
  `verify-projects: ${projects.length} project entr(ies) verified, including ${tools.length} released tool(s)`
)
