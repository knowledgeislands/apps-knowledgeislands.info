import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  buildArcadiaSnapshot,
  parseInventory,
  parseRoster,
  renderSnapshot,
  type Visibility
} from './sync-arcadia-snapshot.ts'

const ref = 'df270aa2f24c95be72205403c94d3d6b63e20602'
const url = (name: string): string => `https://github.com/knowledgeislands/${name}`

const toml = (members: string[], capital = url('ki-principal')): string =>
  [
    '[repo]',
    'harnesses = ["knowledgeislands/ki-agentic-harness"]',
    '',
    '[skills.ki-repo]',
    `capital = "${capital}"`,
    'territory_members = [',
    ...members.map((member) => `  "${url(member)}",`),
    ']',
    '',
    '[skills.ki-authoring]',
    'capital = "https://github.com/knowledgeislands/not-this-one"'
  ].join('\n')

const knownLands = (rows: [string, string, string][]): string =>
  [
    '# Known Lands',
    '',
    '## Internal inventory',
    '',
    'The current inventory.',
    '',
    '| Repository | Role | Owned concern |',
    '| --- | --- | --- |',
    ...rows.map(([name, role, concern]) => `| [${name}][${name}] | ${role} | ${concern} |`),
    '',
    'Prose after the table.',
    '',
    '---',
    '',
    '## Estate territories',
    '',
    '| Territory | Handle |',
    '| --- | --- |',
    '| Personal | `personal` |',
    '',
    ...rows.map(([name]) => `[${name}]: ${url(name)}`)
  ].join('\n')

const rows: [string, string, string][] = [
  ['apps-knowledgeislands.info', 'Publication', 'Public source-labelled website'],
  ['apps-observatory.local', 'Product', 'Repository and knowledge reader'],
  ['ki-design', 'Capability', 'Shared design system'],
  ['ki-principal', 'Capital', 'KI governance, model and engineering practice']
]
const members = rows.map(([name]) => name)
const privateRepos = new Set([url('apps-observatory.local')])
const probe = async (repository: string): Promise<Visibility> =>
  privateRepos.has(repository) ? 'not-public' : 'public'

describe('parseRoster', () => {
  test('reads the capital and the ordered members from [skills.ki-repo] alone', () => {
    const roster = parseRoster(toml(members))
    assert.equal(roster.capital, url('ki-principal'))
    assert.deepEqual(roster.members, members.map(url))
  })

  test('refuses a capital outside the roster', () => {
    assert.throws(() => parseRoster(toml(['ki-design'])), /not a territory member/)
  })

  test('refuses a member that is not a knowledgeislands repository', () => {
    assert.throws(
      () => parseRoster(toml(members).replace(url('ki-design'), 'https://github.com/someone/else')),
      /not a knowledgeislands repository/
    )
  })

  test('refuses a duplicate member', () => {
    assert.throws(() => parseRoster(toml([...members, 'ki-design'])), /listed twice/)
  })
})

describe('parseInventory', () => {
  test('reads only the internal inventory table, resolving each reference link', () => {
    const inventory = parseInventory(knownLands(rows))
    assert.deepEqual(
      inventory.map((row) => [row.name, row.role, row.concern]),
      rows
    )
    assert.equal(inventory[0].url, url('apps-knowledgeislands.info'))
  })

  test('refuses an unexpected header', () => {
    assert.throws(() => parseInventory(knownLands(rows).replace('| Owned concern |', '| Concern |')), /headed/)
  })

  test('refuses a row whose reference has no definition', () => {
    const markdown = knownLands(rows).replace(`[ki-design]: ${url('ki-design')}`, '')
    assert.throws(() => parseInventory(markdown), /no link definition/)
  })
})

describe('buildArcadiaSnapshot', () => {
  test('charts the public islands, Capital first, and records nothing about the rest', async () => {
    const snapshot = await buildArcadiaSnapshot(
      parseRoster(toml(members)),
      parseInventory(knownLands(rows)),
      ref,
      '2026-10-19',
      probe
    )
    assert.deepEqual(
      snapshot.islands.map((island) => [island.name, island.role]),
      [
        ['ki-principal', 'Capital'],
        ['apps-knowledgeislands.info', 'Publication'],
        ['ki-design', 'Capability']
      ]
    )
    assert.equal(snapshot.charted, '2026-10-19')
    assert.deepEqual(snapshot.source, {
      repository: 'knowledgeislands/ki-principal',
      path: 'Admin/Governance/Known Lands.md',
      roster: '.ki.toml',
      ref
    })
    assert.equal(renderSnapshot(snapshot).includes('observatory'), false)
  })

  test('refuses a roster and an inventory that disagree', async () => {
    await assert.rejects(
      buildArcadiaSnapshot(
        parseRoster(toml([...members, 'tools-ki'])),
        parseInventory(knownLands(rows)),
        ref,
        '2026-10-19',
        probe
      ),
      /disagree/
    )
  })

  test('refuses a capital the inventory does not call Capital', async () => {
    const demoted = rows.map(([name, role, concern]): [string, string, string] => [
      name,
      name === 'ki-principal' ? 'Knowledge' : role,
      concern
    ])
    await assert.rejects(
      buildArcadiaSnapshot(parseRoster(toml(members)), parseInventory(knownLands(demoted)), ref, '2026-10-19', probe),
      /role Capital/
    )
  })

  test('stops when visibility cannot be told, rather than guessing', async () => {
    await assert.rejects(
      buildArcadiaSnapshot(parseRoster(toml(members)), parseInventory(knownLands(rows)), ref, '2026-10-19', () =>
        Promise.reject(new Error('answered HTTP 429'))
      ),
      /429/
    )
  })

  test('refuses a branch name or a malformed date', async () => {
    const roster = parseRoster(toml(members))
    const inventory = parseInventory(knownLands(rows))
    await assert.rejects(buildArcadiaSnapshot(roster, inventory, 'main', '2026-10-19', probe), /40-character/)
    await assert.rejects(buildArcadiaSnapshot(roster, inventory, ref, '19 October', probe), /ISO date/)
  })
})
