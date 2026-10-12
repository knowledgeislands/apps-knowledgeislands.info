/**
 * Verifies the released tools in the project registry and the routes from them.
 *
 * A released tool is a `kind: 'tool'` entry in `projects.json5` — a project
 * that happens to ship a binary, and therefore carries the release and install
 * fields checked here. They used to live in a registry of their own; the split
 * produced two indistinguishable sections and was merged (KI-WEBSITE-SITE-020).
 *
 * The website is a discoverability and indirection layer: it does not own any
 * tool's executable behaviour, release artefacts or installer script. What it
 * can be held to is that every advertised route resolves, and that every
 * machine route points at an installer published at an explicit immutable
 * release tag rather than at a moving branch.
 *
 * Offline checks run by default. `--network` additionally fetches each
 * installer target and compares the declared version against the tool's
 * published latest release, reporting drift so the registry advances
 * deliberately rather than silently following upstream.
 */

import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSON5 from 'json5'
import { githubFetch } from './lib/github.ts'
import { byExtension, walk } from './lib/walk.ts'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const registryPath = resolve(siteRoot, 'src/_data/projects.json5')
const iconsPath = resolve(siteRoot, 'src/_includes/macros/icons.njk')
const distDir = resolve(siteRoot, 'dist')

const maturities = ['stable', 'preview', 'experimental']
const accents = ['gold', 'teal', 'forest']
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const versionPattern = /^v\d+\.\d+\.\d+$/
const ownerPrefix = 'knowledgeislands/'

interface Tool {
  slug: string
  name: string
  tagline: string
  description: string
  repository: string
  version: string
  maturity: string
  formula: string | null
  installer: string
  manual: string
  changelog: string
  icon: string
  accent: string
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

/**
 * Extracts the git ref a raw.githubusercontent.com or github.com/blob URL
 * reads from, so an immutable tag can be told apart from a moving branch.
 */
const refOf = (url: string): string | null => {
  const raw = /^https:\/\/raw\.githubusercontent\.com\/[^/]+\/[^/]+\/([^/]+)\//.exec(url)
  if (raw) return raw[1] as string
  const blob = /^https:\/\/github\.com\/[^/]+\/[^/]+\/blob\/([^/]+)\//.exec(url)
  if (blob) return blob[1] as string
  return null
}

const repositoryOf = (url: string): string | null => {
  const match = /^https:\/\/(?:raw\.githubusercontent\.com|github\.com)\/([^/]+\/[^/]+?)(?:\/|$)/.exec(url)
  return match ? (match[1] as string) : null
}

const requireText = (tool: Record<string, unknown>, field: string, where: string): void => {
  const value = tool[field]
  if (typeof value !== 'string' || value.trim() === '') fail(`${where}: "${field}" must be a non-empty string`)
}

const checkPinnedUrl = (url: unknown, field: string, tool: Tool, where: string): void => {
  if (typeof url !== 'string' || !url.startsWith('https://')) {
    fail(`${where}: "${field}" must be an https URL`)
    return
  }
  const repository = repositoryOf(url)
  if (repository === null || !repository.startsWith(ownerPrefix)) {
    fail(`${where}: "${field}" must point at a ${ownerPrefix}* GitHub repository, got ${url}`)
    return
  }
  const ref = refOf(url)
  if (ref === null) {
    fail(`${where}: "${field}" must address an explicit git ref, got ${url}`)
    return
  }
  if (ref !== tool.version) {
    fail(`${where}: "${field}" reads ref "${ref}" but the registry declares version "${tool.version}"`)
  }
}

const readRegistry = (): Tool[] => {
  const parsed = JSON5.parse(readFileSync(registryPath, 'utf-8')) as unknown
  if (!Array.isArray(parsed) || parsed.length === 0) {
    fail('src/_data/projects.json5 must be a non-empty array of project declarations')
    return []
  }
  const tools = (parsed as (Tool & { kind?: string })[]).filter((entry) => entry.kind === 'tool')
  if (tools.length === 0) fail("src/_data/projects.json5 declares no kind: 'tool' entries")
  return tools
}

const checkRegistry = (tools: Tool[]): void => {
  const icons = declaredIcons()
  const seen = new Set<string>()

  for (const [index, tool] of tools.entries()) {
    const where = `tools[${index}]${typeof tool.slug === 'string' ? ` (${tool.slug})` : ''}`
    const record = tool as unknown as Record<string, unknown>

    for (const field of [
      'slug',
      'name',
      'tagline',
      'description',
      'repository',
      'version',
      'maturity',
      'icon',
      'accent'
    ]) {
      requireText(record, field, where)
    }

    if (typeof tool.slug === 'string') {
      if (!slugPattern.test(tool.slug)) fail(`${where}: "slug" must be lowercase kebab-case`)
      if (seen.has(tool.slug)) fail(`${where}: duplicate slug "${tool.slug}"`)
      seen.add(tool.slug)
    }

    if (typeof tool.version === 'string' && !versionPattern.test(tool.version)) {
      fail(`${where}: "version" must be an exact v-prefixed semantic version, got "${tool.version}"`)
    }

    if (!maturities.includes(tool.maturity)) {
      fail(`${where}: "maturity" must be one of ${maturities.join(', ')}, got "${tool.maturity}"`)
    }

    if (!accents.includes(tool.accent)) {
      fail(`${where}: "accent" must be one of ${accents.join(', ')}, got "${tool.accent}"`)
    }

    if (typeof tool.icon === 'string' && !icons.has(tool.icon)) {
      fail(`${where}: "icon" is "${tool.icon}", which macros/icons.njk does not define`)
    }

    if (tool.formula !== null && (typeof tool.formula !== 'string' || tool.formula.trim() === '')) {
      fail(`${where}: "formula" must be a Homebrew formula name or null`)
    }

    if (typeof tool.repository !== 'string' || !tool.repository.startsWith(`https://github.com/${ownerPrefix}`)) {
      fail(`${where}: "repository" must be a https://github.com/${ownerPrefix}* URL`)
    }

    for (const field of ['installer', 'manual', 'changelog'] as const) {
      checkPinnedUrl(record[field], field, tool, where)
    }
  }
}

/** Checks the built output when one is present; a clean tree simply skips this. */
const checkBuild = (tools: Tool[]): void => {
  const redirectsPath = resolve(distDir, '_redirects')
  if (!existsSync(distDir)) {
    warn('dist/ is absent, so the generated routes were not checked; run the site build first')
    return
  }

  if (!existsSync(redirectsPath)) {
    fail('dist/_redirects was not generated')
  } else {
    const redirects = readFileSync(redirectsPath, 'utf-8')
    const lines = redirects.split('\n').map((line) => line.trim())
    for (const tool of tools) {
      const expected = `/install/${tool.slug} ${tool.installer} 302`
      if (!lines.includes(expected)) fail(`dist/_redirects is missing the generated line: ${expected}`)
    }
    if (lines.some((line) => line.startsWith('/harness/install'))) {
      fail('dist/_redirects still carries the retired /harness/install route')
    }
  }

  for (const tool of tools) {
    if (!existsSync(resolve(distDir, 'projects', tool.slug, 'index.html'))) {
      fail(`dist/projects/${tool.slug}/index.html was not generated`)
    }
  }

  if (existsSync(resolve(distDir, 'tooling'))) {
    fail('dist/tooling/ still exists; run the clean script before building')
  }
}

const checkNetwork = async (tools: Tool[]): Promise<void> => {
  for (const tool of tools) {
    try {
      const response = await githubFetch(tool.installer, { init: { redirect: 'follow' } })
      if (!response.ok) {
        fail(`${tool.slug}: installer target returned HTTP ${response.status} — ${tool.installer}`)
      } else if ((await response.text()).trim() === '') {
        fail(`${tool.slug}: installer target is empty — ${tool.installer}`)
      }
    } catch (error) {
      fail(`${tool.slug}: installer target could not be fetched — ${(error as Error).message}`)
    }

    const repository = repositoryOf(tool.repository)
    if (repository === null) continue
    try {
      const response = await githubFetch(`https://api.github.com/repos/${repository}/releases/latest`)
      if (!response.ok) {
        warn(`${tool.slug}: could not read the published latest release (HTTP ${response.status})`)
        continue
      }
      const latest = ((await response.json()) as { tag_name?: string }).tag_name
      if (typeof latest === 'string' && latest !== tool.version) {
        warn(
          `${tool.slug}: the registry advertises ${tool.version} but ${repository} has published ${latest}; advance the registry when that release is ready to be recommended`
        )
      }
    } catch (error) {
      warn(`${tool.slug}: could not read the published latest release — ${(error as Error).message}`)
    }
  }
}

/**
 * Guards against a page that still *links to* a retired route. Prose may name
 * one — explaining that an older release prints the old address is useful — so
 * only link and redirect targets are rejected.
 */
const checkRetiredRoutes = (): void => {
  const retired = ['/tooling/', '/harness/install']
  for (const path of walk(resolve(siteRoot, 'src'), byExtension('.njk', '.md', '.ts'))) {
    const source = readFileSync(path, 'utf-8')
    for (const route of retired) {
      const escaped = route.replace(/[/]/g, '\\/')
      const asTarget = new RegExp(`(?:href=["']|\\]\\()(?:https?:\\/\\/[^"')]*)?${escaped}`)
      if (asTarget.test(source)) {
        fail(`${path.slice(siteRoot.length + 1)} still links to the retired route ${route}`)
      }
    }
  }
}

const tools = readRegistry()
checkRegistry(tools)
checkRetiredRoutes()
checkBuild(tools)
if (process.argv.includes('--network')) await checkNetwork(tools)

for (const message of warnings) console.warn(`warning: ${message}`)

if (failures.length > 0) {
  for (const message of failures) console.error(`error: ${message}`)
  console.error(`\nverify-tool-routes: ${failures.length} problem(s) found`)
  process.exit(1)
}

console.log(`verify-tool-routes: ${tools.length} tool route(s) verified`)
