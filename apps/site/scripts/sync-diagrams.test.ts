import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { syncDiagrams } from './sync-diagrams.ts'

test('sync reads the requested commit, selects committed viewers and refuses a dirty checkout', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'diagram-sync-'))
  const from = resolve(root, 'harness')
  const destination = resolve(root, 'site')
  mkdirSync(resolve(from, 'docs/diagrams'), { recursive: true })
  const git = (...args: string[]) => execFileSync('git', ['-C', from, ...args], { encoding: 'utf8' }).trim()
  const manifest = (slug: string, html: boolean) =>
    `[${slug}]\ntype = "architecture"\nquestion = "What exists?"\naudience = "Users"\ntraced = ["README.md"]\nstale_when = "parts change"\nregenerate = "Draw the parts"\nlast_checked = "0000000"\ncommit_html = ${html}\n`
  try {
    git('init', '-q')
    git('config', 'user.name', 'Diagram fixture')
    git('config', 'user.email', 'fixture@example.invalid')
    writeFileSync(
      resolve(from, 'docs/diagrams/diagrams.toml'),
      `${manifest('included', true)}\n${manifest('omitted', false)}`
    )
    for (const suffix of ['svg', 'html', 'receipt.json'])
      writeFileSync(resolve(from, `docs/diagrams/included.${suffix}`), `Original ${suffix}\n`)
    git('add', '--', 'docs/diagrams')
    git('-c', 'core.hooksPath=/dev/null', 'commit', '-q', '-m', 'test: original diagram fixture')
    const original = git('rev-parse', 'HEAD')
    writeFileSync(resolve(from, 'docs/diagrams/included.svg'), 'Changed SVG\n')
    assert.throws(() => syncDiagrams(from, original, destination), /must be clean/)
    git('add', '--', 'docs/diagrams/included.svg')
    git('-c', 'core.hooksPath=/dev/null', 'commit', '-q', '-m', 'test: changed diagram fixture')
    const snapshot = syncDiagrams(from, original, destination)
    assert.deepEqual(Object.keys(snapshot.diagrams), ['included'])
    assert.equal(snapshot.source.ref, original)
    assert.equal(
      readFileSync(resolve(destination, 'src/assets/diagrams/vendored/ki-agentic-harness/included.svg'), 'utf8'),
      'Original svg\n'
    )
    assert.throws(() => syncDiagrams(from, 'main', destination), /immutable commit SHA/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
