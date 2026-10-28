import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { test } from 'node:test'
import { syncStoa } from './sync-stoa.ts'

/** A stand-in Stoa checkout: its export writes the files the sync reads, at the version units.json5 names. */
const exporter = `import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const [out, , commit] = process.argv.slice(2)
const version = /version: '([^']+)'/.exec(readFileSync(new URL('../../packages/stoa/units.json5', import.meta.url), 'utf8'))[1]
mkdirSync(out, { recursive: true })
const story = (id) => ({ id, group: 'G', title: id, note: 'Note.', inputs: {}, render: () => '' })
writeFileSync(join(out, 'stories.js'), 'export const stories = ' + JSON.stringify(['a', 'b', 'c', 'd', 'e'].map(story)))
writeFileSync(join(out, 'sample.js'), "export const themes = [{ id: 'one', name: 'One', description: 'd', detail: 'x' }, { id: 'two', name: 'Two', description: 'd', detail: 'x' }]")
writeFileSync(join(out, 'index.html'), '<!doctype html>')
writeFileSync(join(out, 'workbench.json'), JSON.stringify({ name: 'Stoa workbench', version, commit }))
`
const units = (version: string) =>
  `{ version: '${version}', units: [${['u1', 'u2', 'u3', 'u4', 'u5'].map((id) => `{ id: '${id}', note: 'N.' }`).join(', ')}] }`

test('sync exports the tagged tree, records its stories and refuses a dirty checkout or a moving ref', async () => {
  const root = mkdtempSync(resolve(tmpdir(), 'stoa-sync-test-'))
  const from = resolve(root, 'stoa')
  const destination = resolve(root, 'site')
  const git = (...args: string[]) => execFileSync('git', ['-C', from, ...args], { encoding: 'utf8' }).trim()
  try {
    mkdirSync(resolve(from, 'apps/workbench'), { recursive: true })
    mkdirSync(resolve(from, 'packages/stoa'), { recursive: true })
    git('init', '-q')
    git('config', 'user.name', 'Stoa fixture')
    git('config', 'user.email', 'fixture@example.invalid')
    writeFileSync(resolve(from, 'apps/workbench/export.js'), exporter)
    writeFileSync(resolve(from, 'packages/stoa/units.json5'), units('0.27.1'))
    git('add', '-A')
    git('-c', 'core.hooksPath=/dev/null', 'commit', '-q', '-m', 'test: stoa fixture')
    git('tag', 'v0.27.1')
    writeFileSync(resolve(from, 'packages/stoa/units.json5'), units('0.28.0'))
    await assert.rejects(syncStoa(from, 'v0.27.1', destination), /must be clean/)
    git('-c', 'core.hooksPath=/dev/null', 'commit', '-q', '-am', 'test: later version')
    await assert.rejects(syncStoa(from, 'main', destination), /release tag/)
    const snapshot = await syncStoa(from, 'v0.27.1', destination)
    assert.equal(snapshot.version, '0.27.1')
    assert.equal(snapshot.source.repository, 'knowledgeislands/packages-stoa')
    assert.equal(snapshot.source.ref, 'v0.27.1')
    assert.equal(snapshot.commit, git('rev-parse', 'v0.27.1'))
    assert.deepEqual(
      snapshot.stories.map((s) => s.id),
      ['a', 'b', 'c', 'd', 'e']
    )
    assert.equal(snapshot.themes.length, 2)
    assert.ok(existsSync(resolve(destination, 'vendor/stoa-workbench/index.html')))
    assert.match(readFileSync(resolve(destination, 'src/_data/stoaWorkbench.json5'), 'utf8'), /--ref v0\.27\.1/)
  } finally {
    rmSync(root, { recursive: true, force: true })
  }
})
