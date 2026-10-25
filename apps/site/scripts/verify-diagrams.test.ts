import assert from 'node:assert/strict'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { harnessRepository, parseManifest, repositoryRoot, type VendoredDiagrams } from './lib/diagrams.ts'
import { checkPage, figureSlugs, verifyDiagrams } from './verify-diagrams.ts'

const ref = '8897008fcee7b2c71a22115735ed038efccf7f32'
const snapshot: VendoredDiagrams = {
  source: { repository: harnessRepository, path: 'docs/diagrams/diagrams.toml', ref },
  synced: '2026-10-25',
  diagrams: {
    'skill-map': {
      type: 'architecture',
      question: 'What skills exist?',
      last_checked: ref,
      svg: 'skill-map.svg',
      html: 'skill-map.html',
      receipt: 'skill-map.receipt.json'
    }
  }
}
const page = (sources = '') =>
  `---\ntitle: Example\nsources:\n${sources}\n---\n{% figure "skill-map", "The skills" %}\n`
const source = (repository: string, revision: string) =>
  `  - repository: ${repository}\n    path: docs/diagrams/diagrams.toml\n    ref: ${revision}`

test('figures recognise both quote styles and whitespace control, excluding fenced examples and frontmatter', () => {
  assert.deepEqual(
    figureSlugs(
      '---\ntitle: figure\n---\n{% figure "one", "One" %}\n{%- figure \'two\', \'Two\' -%}\n\n```njk\n{% figure "example", "Example" %}\n```\n'
    ),
    ['one', 'two']
  )
  assert.throws(() => figureSlugs('{% figure slug, "Caption" %}'), /literal slug/)
})

test('site figures resolve without a harness source and unknown or duplicate slugs fail', () => {
  assert.deepEqual(checkPage('page.md', '{% figure "local", "Caption" %}', new Set(['local']), snapshot), [])
  assert.match(
    checkPage('page.md', '{% figure "missing", "Caption" %}', new Set(), snapshot)[0],
    /unknown figure missing/
  )
  assert.match(
    checkPage('page.md', page(source(harnessRepository, ref)), new Set(['skill-map']), snapshot)[0],
    /ambiguous figure/
  )
})

test('vendored figures require the matching ref on the harness entry itself', () => {
  assert.deepEqual(checkPage('page.md', page(source(harnessRepository, ref)), new Set(), snapshot), [])
  assert.equal(checkPage('page.md', page(), new Set(), snapshot).length, 1)
  assert.equal(checkPage('page.md', page(source(harnessRepository, 'old')), new Set(), snapshot).length, 1)
  const mixed = `${source(harnessRepository, 'old')}\n${source('knowledgeislands/tools-ki', ref)}`
  assert.equal(checkPage('page.md', page(mixed), new Set(), snapshot).length, 1)
})

test('manifest rejects unsupported types and unsafe slugs before copying upstream files', () => {
  assert.throws(() => parseManifest('[example]\ntype = "tree"'), /Invalid diagram/)
  assert.throws(() => parseManifest('["../escape"]\ntype = "architecture"'), /Invalid diagram/)
})

test('the full gate detects missing artefacts and stale viewer receipts', () => {
  const root = mkdtempSync(resolve(tmpdir(), 'diagram-verification-'))
  try {
    mkdirSync(resolve(root, 'docs/diagrams'), { recursive: true })
    mkdirSync(resolve(root, 'apps/site/src/_data'), { recursive: true })
    mkdirSync(resolve(root, 'apps/site/src/docs'), { recursive: true })
    writeFileSync(
      resolve(root, 'apps/site/src/_data/vendoredDiagrams.json5'),
      JSON.stringify({ ...snapshot, diagrams: {} })
    )
    const manifestText = readFileSync(resolve(repositoryRoot, 'docs/diagrams/diagrams.toml'), 'utf8')
    writeFileSync(resolve(root, 'docs/diagrams/diagrams.toml'), manifestText)
    for (const [slug, entry] of Object.entries(parseManifest(manifestText))) {
      const names = [`${slug}.${entry.type}.json`, `${slug}.svg`]
      if (entry.commit_html) names.push(`${slug}.html`, `${slug}.receipt.json`)
      for (const name of names) {
        copyFileSync(resolve(repositoryRoot, 'docs/diagrams', name), resolve(root, 'docs/diagrams', name))
      }
    }
    assert.deepEqual(verifyDiagrams(root), [])
    rmSync(resolve(root, 'docs/diagrams/command-groups.svg'))
    assert.ok(verifyDiagrams(root).some((failure) => failure.includes('missing command-groups.svg')))
    copyFileSync(
      resolve(repositoryRoot, 'docs/diagrams/command-groups.svg'),
      resolve(root, 'docs/diagrams/command-groups.svg')
    )
    writeFileSync(resolve(root, 'docs/diagrams/command-groups.html'), '<html>Stale viewer</html>')
    assert.ok(verifyDiagrams(root).some((failure) => failure.startsWith('build-html --check:')))
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})

test('passthrough viewers and SVGs remain byte-identical after the site build', () => {
  const site = resolve(repositoryRoot, 'apps/site')
  const metadata = JSON.parse(
    readFileSync(resolve(site, 'src/_data/vendoredDiagrams.json5'), 'utf8').replace(/^\/\/.*\n/gm, '')
  ) as VendoredDiagrams
  for (const entry of Object.values(metadata.diagrams)) {
    for (const name of [entry.svg, entry.html]) {
      assert.deepEqual(
        readFileSync(resolve(site, 'dist/diagrams/vendored/ki-agentic-harness', name)),
        readFileSync(resolve(site, 'src/assets/diagrams/vendored/ki-agentic-harness', name))
      )
    }
  }
  for (const suffix of ['svg', 'html'])
    assert.deepEqual(
      readFileSync(resolve(site, `dist/diagrams/site/command-groups.${suffix}`)),
      readFileSync(resolve(repositoryRoot, `docs/diagrams/command-groups.${suffix}`))
    )
  const pageHtml = readFileSync(resolve(site, 'dist/docs/ki/command-groups/index.html'), 'utf8')
  assert.match(pageHtml, /<figure class="figure-diagram">/)
  assert.match(pageHtml, /href="\.\.\/\.\.\/\.\.\/diagrams\/site\/command-groups.html" target="_blank" rel="noopener"/)
})
