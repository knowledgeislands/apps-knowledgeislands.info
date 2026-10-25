import assert from 'node:assert/strict'
import { copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { receiptFailures, repositoryRoot } from './diagrams.ts'

const slug = 'command-groups'
const type = 'architecture'
const names = [`${slug}.${type}.json`, `${slug}.html`, `${slug}.receipt.json`]

function withCopy(run: (directory: string) => void): void {
  const directory = mkdtempSync(resolve(tmpdir(), 'diagram-receipts-'))
  try {
    mkdirSync(directory, { recursive: true })
    for (const name of names) copyFileSync(resolve(repositoryRoot, 'docs/diagrams', name), resolve(directory, name))
    run(directory)
  } finally {
    rmSync(directory, { recursive: true, force: true })
  }
}

test('a committed receipt matching its source and viewer passes without the harness skill', () => {
  withCopy((directory) => assert.deepEqual(receiptFailures(directory, slug, type), []))
})

test('a changed viewer or source fails against the committed receipt', () => {
  withCopy((directory) => {
    writeFileSync(resolve(directory, `${slug}.html`), '<html>Stale viewer</html>')
    assert.deepEqual(receiptFailures(directory, slug, type), [
      `${slug}: the viewer ${slug}.html changed since the viewer was rendered`
    ])
  })
  withCopy((directory) => {
    const source = resolve(directory, `${slug}.${type}.json`)
    writeFileSync(source, `${readFileSync(source, 'utf8')}\n`)
    assert.match(receiptFailures(directory, slug, type)[0], /the source .* changed since the viewer was rendered/)
  })
})

test('a malformed receipt or one naming another diagram fails, and missing files are left to the presence check', () => {
  withCopy((directory) => {
    writeFileSync(resolve(directory, `${slug}.receipt.json`), '{')
    assert.match(receiptFailures(directory, slug, type)[0], /is not valid JSON/)
    writeFileSync(resolve(directory, `${slug}.receipt.json`), JSON.stringify({ schema: 2 }))
    assert.match(receiptFailures(directory, slug, type)[0], /does not hold a schema 1 receipt/)
    const receipt = JSON.parse(readFileSync(resolve(repositoryRoot, 'docs/diagrams', `${slug}.receipt.json`), 'utf8'))
    writeFileSync(resolve(directory, `${slug}.receipt.json`), JSON.stringify({ ...receipt, slug: 'other' }))
    assert.match(receiptFailures(directory, slug, type)[0], /names other as architecture/)
    rmSync(resolve(directory, `${slug}.html`))
    assert.deepEqual(receiptFailures(directory, slug, type), [])
  })
})
