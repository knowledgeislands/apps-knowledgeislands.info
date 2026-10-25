/** Vendor committed diagram artefacts from a clean local checkout at an immutable ref. No network. */
import { execFileSync } from 'node:child_process'
import { mkdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { harnessRepository, parseManifest, repositoryRoot, siteRoot, type VendoredDiagrams } from './lib/diagrams.ts'

export function syncDiagrams(from: string, revision: string, destination = siteRoot): VendoredDiagrams {
  const git = (...args: string[]) => execFileSync('git', ['-C', from, ...args], { maxBuffer: 64 * 1024 * 1024 })
  if (git('status', '--porcelain').toString().trim())
    throw new Error('The harness checkout must be clean before syncing diagrams')
  if (!/^[0-9a-f]{7,40}$/.test(revision)) throw new Error('--ref must be an immutable commit SHA')
  const ref = git('rev-parse', '--verify', `${revision}^{commit}`).toString().trim()
  const path = 'docs/diagrams/diagrams.toml'
  const manifest = parseManifest(git('show', `${ref}:${path}`).toString())
  const snapshot: VendoredDiagrams = {
    source: { repository: harnessRepository, path, ref },
    synced: new Date().toISOString().slice(0, 10),
    diagrams: {}
  }
  // Read the whole snapshot before replacing it, so missing upstream files leave the existing one intact.
  const files = new Map<string, Buffer>()
  for (const [slug, entry] of Object.entries(manifest)) {
    if (entry.commit_html !== true) continue
    const names = { svg: `${slug}.svg`, html: `${slug}.html`, receipt: `${slug}.receipt.json` }
    for (const name of Object.values(names)) files.set(name, git('show', `${ref}:docs/diagrams/${name}`))
    snapshot.diagrams[slug] = { type: entry.type, question: entry.question, last_checked: entry.last_checked, ...names }
  }
  const target = resolve(destination, 'src/assets/diagrams/vendored/ki-agentic-harness')
  const temporary = `${target}.sync-${process.pid}`
  mkdirSync(temporary, { recursive: true })
  try {
    for (const [name, bytes] of files) writeFileSync(resolve(temporary, name), bytes)
    rmSync(target, { recursive: true, force: true })
    renameSync(temporary, target)
  } finally {
    rmSync(temporary, { recursive: true, force: true })
  }
  mkdirSync(resolve(destination, 'src/_data'), { recursive: true })
  writeFileSync(
    resolve(destination, 'src/_data/vendoredDiagrams.json5'),
    `// GENERATED FILE - do not edit.\n// bun run --cwd apps/site sync:diagrams -- --ref ${ref}\n// Copied byte for byte from ${harnessRepository}; source refs on embedding pages must match.\n${JSON.stringify(snapshot, null, 2)}\n`
  )
  return snapshot
}

if (import.meta.main) {
  const args = process.argv.slice(2).filter((arg) => arg !== '--')
  let from = resolve(repositoryRoot, '../ki-agentic-harness')
  let ref = ''
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--from' && args[i + 1]) from = resolve(args[++i])
    else if (args[i] === '--ref' && args[i + 1]) ref = args[++i]
    else throw new Error('Usage: sync:diagrams -- --ref <sha> [--from <path>]')
  }
  const snapshot = syncDiagrams(from, ref)
  console.log(`sync-diagrams: ${Object.keys(snapshot.diagrams).length} diagrams at ${snapshot.source.ref}`)
}
