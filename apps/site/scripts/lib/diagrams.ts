import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSON5 from 'json5'

export const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..')
export const repositoryRoot = resolve(siteRoot, '../..')
export const harnessRepository = 'knowledgeislands/ki-agentic-harness'
export const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const types = ['architecture', 'workflow', 'sequence', 'dataflow', 'lifecycle']

export interface Diagram {
  type: string
  question: string
  audience: string
  traced: string[]
  stale_when: string
  regenerate: string
  last_checked: string
  commit_html?: boolean
  svg_form?: string
}

export interface VendoredDiagrams {
  source: { repository: string; path: string; ref: string }
  synced: string
  diagrams: Record<
    string,
    Pick<Diagram, 'type' | 'question' | 'last_checked'> & { svg: string; html: string; receipt: string }
  >
}

/** Refuse an upstream shape change before copying any files. */
export function parseManifest(text: string): Record<string, Diagram> {
  const manifest = Bun.TOML.parse(text) as Record<string, Diagram>
  for (const [slug, entry] of Object.entries(manifest)) {
    if (!slugPattern.test(slug) || !entry || !types.includes(entry.type)) throw new Error(`Invalid diagram: ${slug}`)
    for (const key of ['question', 'audience', 'stale_when', 'regenerate', 'last_checked'] as const) {
      if (typeof entry[key] !== 'string' || !entry[key].trim()) throw new Error(`${slug}: missing ${key}`)
    }
    if (
      !Array.isArray(entry.traced) ||
      !entry.traced.length ||
      entry.traced.some(
        (path) => typeof path !== 'string' || !path || path.startsWith('/') || path.split('/').includes('..')
      )
    ) {
      throw new Error(`${slug}: invalid traced paths`)
    }
    if (entry.commit_html !== undefined && typeof entry.commit_html !== 'boolean')
      throw new Error(`${slug}: invalid commit_html`)
    if (entry.svg_form !== undefined && !['dual', 'light', 'ki', 'ki-night'].includes(entry.svg_form))
      throw new Error(`${slug}: invalid svg_form`)
  }
  return manifest
}

export const siteManifest = (root = repositoryRoot): Record<string, Diagram> =>
  parseManifest(readFileSync(resolve(root, 'docs/diagrams/diagrams.toml'), 'utf8'))

export const vendoredManifest = (root = siteRoot): VendoredDiagrams =>
  JSON5.parse(readFileSync(resolve(root, 'src/_data/vendoredDiagrams.json5'), 'utf8')) as VendoredDiagrams

/** Installed harnesses work in CI too; generation may explicitly select another installation. */
export function diagramSkill(): string {
  const relative = 'skills/governance/ki-diagrams'
  const candidates = [
    process.env.KI_DIAGRAMS_HOME,
    resolve(homedir(), '.agents/skills/ki-diagrams'),
    resolve(homedir(), '.claude/skills/ki-diagrams'),
    resolve(homedir(), '.local/share/ki/harnesses', harnessRepository, relative),
    resolve(repositoryRoot, '../ki-agentic-harness', relative)
  ]
  const found = candidates.find((path) => path && existsSync(resolve(path, 'scripts/build-html.ts')))
  if (!found)
    throw new Error('Install the KI harness diagram skill or set KI_DIAGRAMS_HOME to its ki-diagrams directory')
  return found
}
