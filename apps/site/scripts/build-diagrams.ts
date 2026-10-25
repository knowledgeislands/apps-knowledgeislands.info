/** Repository-owned entry point for the harness builder and canonical SVG exporter. */
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { diagramSkill, repositoryRoot, siteManifest, slugPattern } from './lib/diagrams.ts'

export function buildDiagrams(args: string[]): void {
  const selected = args.filter((arg) => arg !== '--')
  const slugs = selected.filter((arg) => !arg.startsWith('--'))
  if (!slugs.length || selected.some((arg) => arg.startsWith('--') && !['--svg', '--check'].includes(arg))) {
    throw new Error('Usage: diagrams:build -- [--svg | --check] <slug> [...]')
  }
  const manifest = siteManifest()
  for (const slug of slugs) {
    if (!slugPattern.test(slug) || !manifest[slug]) throw new Error(`Unknown site diagram: ${slug}`)
    if (manifest[slug].svg_form !== 'ki' || manifest[slug].commit_html !== true)
      throw new Error(`${slug}: website diagrams require svg_form = "ki" and commit_html = true`)
  }
  if (selected.includes('--check')) {
    execFileSync('bun', [resolve(diagramSkill(), 'scripts/build-html.ts'), '--repo', repositoryRoot, ...selected], {
      stdio: 'inherit'
    })
    return
  }
  // Work outside the checkout. A diagram traced to another public repository uses its local
  // object store, so Archify can verify the pinned evidence without changing that checkout.
  for (const slug of slugs) {
    const entry = manifest[slug]
    const source = `${slug}.${entry.type}.json`
    const bytes = readFileSync(resolve(repositoryRoot, 'docs/diagrams', source))
    const candidate = JSON.parse(bytes.toString()) as { meta?: { repository?: { url: string; revision: string } } }
    const identity = candidate.meta?.repository
    const name = identity?.url.match(/^https:\/\/github\.com\/knowledgeislands\/([a-z0-9.-]+?)(?:\.git)?$/)?.[1]
    if (identity && !name) throw new Error(`${slug}: evidence must identify a public Knowledge Islands repository`)
    const evidenceRoot = name ? resolve(repositoryRoot, '..', name) : repositoryRoot
    if (!existsSync(resolve(evidenceRoot, '.git')))
      throw new Error(`${slug}: local evidence checkout is missing: ${name}`)
    const work = mkdtempSync(resolve(tmpdir(), 'site-diagrams-'))
    try {
      execFileSync('git', ['clone', '-q', '--shared', '--no-checkout', evidenceRoot, work], { stdio: 'pipe' })
      if (identity) {
        execFileSync('git', ['-C', work, 'remote', 'set-url', 'origin', identity.url], { stdio: 'pipe' })
        execFileSync('git', ['-C', work, 'checkout', '-q', '--detach', identity.revision], { stdio: 'pipe' })
      }
      mkdirSync(resolve(work, 'docs/diagrams'), { recursive: true })
      writeFileSync(
        resolve(work, 'docs/diagrams/diagrams.toml'),
        `[${slug}]\n${Object.entries(entry)
          .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
          .join('\n')}\n`
      )
      writeFileSync(resolve(work, 'docs/diagrams', source), bytes)
      // build-html delegates --svg to export-svg.ts --form ki using the manifest.
      execFileSync(
        'bun',
        [
          resolve(diagramSkill(), 'scripts/build-html.ts'),
          '--repo',
          work,
          ...(selected.includes('--svg') ? ['--svg'] : []),
          slug
        ],
        {
          cwd: work,
          stdio: 'inherit',
          env: { ...process.env, ARCHIFY_UPDATE_CHECK_DISABLED: '1' }
        }
      )
      for (const suffix of ['html', 'receipt.json', ...(selected.includes('--svg') ? ['svg'] : [])]) {
        copyFileSync(
          resolve(work, `docs/diagrams/${slug}.${suffix}`),
          resolve(repositoryRoot, `docs/diagrams/${slug}.${suffix}`)
        )
      }
    } catch (error) {
      const summary = resolve(work, `+/diagrams/${slug}/build/${slug}.finalize-summary.json`)
      if (existsSync(summary)) {
        const report = JSON.parse(readFileSync(summary, 'utf8')) as { diagnostics?: unknown }
        console.error(JSON.stringify(report.diagnostics))
      }
      throw error
    } finally {
      rmSync(work, { recursive: true, force: true })
    }
  }
}

if (import.meta.main) buildDiagrams(process.argv.slice(2))
