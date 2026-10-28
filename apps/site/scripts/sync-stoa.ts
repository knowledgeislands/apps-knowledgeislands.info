/**
 * Vendor the Stoa workbench from a clean local `packages-stoa` checkout at a release tag. No network.
 *
 * Stoa's own export (`apps/workbench/export.js`, from v0.27.0) writes the workbench, its stage and its single-story
 * view as static files that run from any folder. This runs that export over the tagged tree, not the working one,
 * replaces `vendor/stoa-workbench/` with it (published at /stoa/workbench/), and records the stories, units and
 * sample themes the Stoa pages describe in `src/_data/stoaWorkbench.json5`, headed with the tag and commit.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import JSON5 from 'json5'
import { repositoryRoot, siteRoot } from './lib/diagrams.ts'

export const stoaRepository = 'knowledgeislands/packages-stoa'
const tagPattern = /^v\d+\.\d+\.\d+$/

interface Story {
  id: string
  group: string
  title: string
  note: string
}
interface Unit {
  id: string
  note: string
  element?: string
}
interface Theme {
  id: string
  name: string
  description: string
  detail: string
}
export interface StoaWorkbench {
  source: { repository: string; path: string; ref: string }
  commit: string
  version: string
  synced: string
  stories: Story[]
  units: Unit[]
  themes: Theme[]
}

export async function syncStoa(from: string, tag: string, destination = siteRoot): Promise<StoaWorkbench> {
  const git = (...args: string[]) => execFileSync('git', ['-C', from, ...args], { maxBuffer: 64 * 1024 * 1024 })
  if (!tagPattern.test(tag)) throw new Error('--ref must be a release tag such as v0.27.1')
  if (git('status', '--porcelain').toString().trim()) throw new Error('The Stoa checkout must be clean before syncing')
  const commit = git('rev-parse', '--verify', `${tag}^{commit}`).toString().trim()
  const tree = mkdtempSync(resolve(tmpdir(), 'stoa-sync-'))
  try {
    execFileSync('tar', ['-x', '-C', tree], { input: git('archive', '--format=tar', commit) })
    if (!existsSync(resolve(tree, 'apps/workbench/export.js')))
      throw new Error(`${tag} has no workbench export; it arrived in Stoa v0.27.0`)
    const out = resolve(tree, '.export')
    execFileSync(process.execPath, [resolve(tree, 'apps/workbench/export.js'), out, '--commit', commit], {
      stdio: 'pipe'
    })
    const manifest = JSON.parse(readFileSync(resolve(out, 'workbench.json'), 'utf8')) as { version: string }
    if (`v${manifest.version}` !== tag) throw new Error(`${tag} exports version ${manifest.version}`)
    const { stories } = (await import(pathToFileURL(resolve(out, 'stories.js')).href)) as { stories: Story[] }
    const { themes } = (await import(pathToFileURL(resolve(out, 'sample.js')).href)) as { themes: Theme[] }
    const { units } = JSON5.parse(readFileSync(resolve(tree, 'packages/stoa/units.json5'), 'utf8')) as { units: Unit[] }
    if (stories.length < 5 || units.length < 5 || themes.length < 2) throw new Error('The Stoa export looks incomplete')
    const snapshot: StoaWorkbench = {
      source: { repository: stoaRepository, path: 'apps/workbench/stories.js', ref: tag },
      commit,
      version: manifest.version,
      synced: new Date().toISOString().slice(0, 10),
      stories: stories.map(({ id, group, title, note }) => ({ id, group, title, note })),
      units: units.map(({ id, note, element }) => ({ id, note, ...(element ? { element } : {}) })),
      themes: themes.map(({ id, name, description, detail }) => ({ id, name, description, detail }))
    }
    const target = resolve(destination, 'vendor/stoa-workbench')
    mkdirSync(resolve(destination, 'vendor'), { recursive: true })
    rmSync(target, { recursive: true, force: true })
    renameSync(out, target)
    mkdirSync(resolve(destination, 'src/_data'), { recursive: true })
    writeFileSync(
      resolve(destination, 'src/_data/stoaWorkbench.json5'),
      `// GENERATED FILE - do not edit.\n// bun run --cwd apps/site sync:stoa -- --ref ${tag}\n// The Stoa workbench at ${tag} (${commit}); vendor/stoa-workbench/ holds its export, and pages citing it must cite this tag.\n${JSON.stringify(snapshot, null, 2)}\n`
    )
    return snapshot
  } finally {
    rmSync(tree, { recursive: true, force: true })
  }
}

if (import.meta.main) {
  const args = process.argv.slice(2).filter((arg) => arg !== '--')
  let from = resolve(repositoryRoot, '../packages-stoa')
  let ref = ''
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) from = resolve(args[++i])
    else if (args[i] === '--ref' && args[i + 1]) ref = args[++i]
    else throw new Error('Usage: sync:stoa -- --ref <tag> [--from <path>]')
  }
  const snapshot = await syncStoa(from, ref)
  console.log(`sync-stoa: Stoa ${snapshot.version}, ${snapshot.stories.length} stories at ${snapshot.source.ref}`)
}
