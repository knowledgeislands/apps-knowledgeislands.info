import assert from 'node:assert/strict'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rename, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { describe, test } from 'node:test'
import {
  AREAS_PATH,
  CATALOGUE_END,
  CATALOGUE_START,
  parseCatalogue,
  parseFunctionalAreas,
  readCatalogueSources,
  withFunctionalAreas
} from './sync-skill-catalogue.ts'

/** Mirrors the upstream block's shape: a preamble stating counts, domain headings, uniform entries. */
const block = (body: string, counts = '2 skills: 1 governance skills and 1 process skills'): string =>
  [
    '# skills',
    '',
    'Prose above the block, which the parser must ignore.',
    '',
    CATALOGUE_START,
    '## Generated capability catalogue',
    '',
    `This source harness publishes ${counts}. The entries below are generated from canonical \`SKILL.md\` frontmatter.`,
    '',
    body,
    AREAS_PATH,
    CATALOGUE_END,
    '',
    'Prose below the block, which the parser must also ignore.'
  ].join('\n')

const governance = [
  '### Governance',
  '',
  '#### `ki-authoring`',
  '',
  'Governs Markdown and TOML style across the estate.',
  '',
  '- **Kind:** Governance',
  '- **Applicability:** Detected',
  '- **Arguments:** `audit <repo> | conform <repo>`',
  '- **Dependencies:** `ki-git`, `ki-repo`',
  '- **Runtime:** Portable',
  ''
].join('\n')

const processSkill = [
  '### Change Management',
  '',
  '#### `ki-plan`',
  '',
  'Shapes a selected item through the explicit Ready gate, then stops.',
  '',
  '- **Kind:** Process',
  '- **Applicability:** Invocation Only',
  '- **Arguments:** `<item>`',
  '- **Dependencies:** None',
  '- **Runtime:** Runtime-bound: `claude-code`',
  ''
].join('\n')

describe('parseCatalogue', () => {
  test('reads entries grouped by domain, ignoring prose outside the markers', () => {
    const catalogue = parseCatalogue(block(`${governance}\n${processSkill}`))

    assert.equal(catalogue.domains.length, 2)
    assert.deepEqual(
      catalogue.domains.map((domain) => domain.name),
      ['Governance', 'Change Management']
    )
    assert.deepEqual(catalogue.counts, { total: 2, governance: 1, process: 1 })
  })

  test('carries every published field verbatim, in the order upstream lists them', () => {
    const [skill] = parseCatalogue(block(`${governance}\n${processSkill}`)).domains[0].skills

    assert.equal(skill.name, 'ki-authoring')
    assert.equal(skill.description, 'Governs Markdown and TOML style across the estate.')
    assert.equal(skill.kind, 'Governance')
    assert.deepEqual(skill.fields, [
      { label: 'Kind', value: 'Governance' },
      { label: 'Applicability', value: 'Detected' },
      { label: 'Arguments', value: '`audit <repo> | conform <repo>`' },
      { label: 'Dependencies', value: '`ki-git`, `ki-repo`' },
      { label: 'Runtime', value: 'Portable' }
    ])
  })

  test('carries an optional field in its published position', () => {
    const detected = governance.replace('- **Runtime:** Portable', '- **Detects:** `*.md`\n- **Runtime:** Portable')
    const [skill] = parseCatalogue(block(`${detected}\n${processSkill}`)).domains[0].skills

    assert.deepEqual(
      skill.fields.map((field) => field.label),
      ['Kind', 'Applicability', 'Arguments', 'Dependencies', 'Detects', 'Runtime']
    )
    assert.equal(skill.description, 'Governs Markdown and TOML style across the estate.')
  })

  test('refuses a block whose declared counts disagree with its entries', () => {
    const wrong = block(`${governance}\n${processSkill}`, '3 skills: 2 governance skills and 1 process skills')

    assert.throws(() => parseCatalogue(wrong), /parsed 2 skills .* but the block declares 3/)
  })

  test('refuses an entry missing a published field', () => {
    const incomplete = governance.replace('- **Runtime:** Portable\n', '')
    const counts = '1 skills: 1 governance skills and 0 process skills'

    assert.throws(() => parseCatalogue(block(incomplete, counts)), /ki-authoring: entry is missing Runtime/)
  })

  test('refuses an unrecognised Kind rather than dropping the entry from both counts', () => {
    const odd = governance.replace('- **Kind:** Governance', '- **Kind:** Something else')
    const counts = '1 skills: 1 governance skills and 0 process skills'

    assert.throws(() => parseCatalogue(block(odd, counts)), /ki-authoring: Kind is "Something else"/)
  })

  test('refuses a document with no markers', () => {
    assert.throws(() => parseCatalogue('# skills\n\nNo catalogue here.\n'), /markers not found/)
  })

  test('refuses reversed markers', () => {
    const reversed = `${CATALOGUE_END}\n## Generated capability catalogue\n\n${CATALOGUE_START}\n`

    assert.throws(() => parseCatalogue(reversed), /reversed/)
  })

  test('refuses a preamble that states no counts, since the parse would be unchecked', () => {
    const silent = [CATALOGUE_START, '## Generated capability catalogue', '', governance, CATALOGUE_END].join('\n')

    assert.throws(() => parseCatalogue(silent), /does not state its skill counts/)
  })
})

/** Mirrors the harness table's shape: a typed array literal of plain values, closed at the line start. */
const areasModule = (body: string): string =>
  [
    "import type { SkillGraphNode } from './skill-graph.ts'",
    '',
    'export type FunctionalArea = { slug: string }',
    '',
    '/** Every functional area, in drawing order. */',
    'export const FUNCTIONAL_AREAS: readonly FunctionalArea[] = [',
    body,
    ']',
    '',
    'export const areaSkills = (area: FunctionalArea): string[] => []'
  ].join('\n')

const fundamentals = [
  '  {',
  "    slug: 'fundamentals',",
  "    title: 'Fundamentals',",
  "    short: 'fundamentals',",
  "    purpose: 'every repository builds on',",
  '    groups: [',
  "      { title: 'Repository and writing', skills: ['ki-authoring'] },",
  "      { skills: ['ki-plan'] }",
  '    ]',
  '  }'
].join('\n')

const delivery = [
  '  {',
  "    slug: 'work-and-delivery',",
  "    title: 'Work and delivery',",
  "    short: 'work',",
  "    purpose: 'move work from capture to acceptance',",
  "    groups: [{ title: 'Delivery cycle', skills: ['ki-plan'] }]",
  '  }'
].join('\n')

describe('parseFunctionalAreas', () => {
  test('reads the table in drawing order, with titled and untitled groups', () => {
    const areas = parseFunctionalAreas(areasModule(`${fundamentals},\n${delivery}`))

    assert.deepEqual(
      areas.map((area) => area.slug),
      ['fundamentals', 'work-and-delivery']
    )
    assert.deepEqual(areas[0].groups, [
      { title: 'Repository and writing', skills: ['ki-authoring'] },
      { skills: ['ki-plan'] }
    ])
    assert.equal(areas[1].purpose, 'move work from capture to acceptance')
  })

  test('refuses a module with no table', () => {
    assert.throws(() => parseFunctionalAreas('export const OTHER = []\n'), /declaration not found/)
  })

  test('refuses a table that is not a literal, since it would otherwise have to be executed', () => {
    const computed = fundamentals.replace("skills: ['ki-authoring']", 'skills: CORE_SKILLS')

    assert.throws(() => parseFunctionalAreas(areasModule(computed)), /not a literal table/)
  })

  test('refuses an area carrying a key this reader does not know', () => {
    const extra = fundamentals.replace("short: 'fundamentals',", "short: 'fundamentals',\n    colour: 'ochre',")

    assert.throws(() => parseFunctionalAreas(areasModule(extra)), /unexpected key colour/)
  })

  test('refuses a group entry that is not a skill name', () => {
    const odd = fundamentals.replace("['ki-plan']", "['plan']")

    assert.throws(() => parseFunctionalAreas(areasModule(odd)), /"plan" is not a skill name/)
  })

  test('refuses a duplicated area', () => {
    assert.throws(
      () => parseFunctionalAreas(areasModule(`${fundamentals},\n${fundamentals}`)),
      /appears more than once/
    )
  })
})

describe('withFunctionalAreas', () => {
  const catalogue = parseCatalogue(block(`${governance}\n${processSkill}`))
  const areas = parseFunctionalAreas(areasModule(`${fundamentals},\n${delivery}`))

  test('attaches each skill its areas in table order, naming the group where the area is split', () => {
    const joined = withFunctionalAreas(catalogue, areas)

    assert.equal(joined.areas.length, 2)
    const authoring = joined.domains[0].skills[0]
    const plan = joined.domains[1].skills[0]
    assert.deepEqual(authoring.areas, [
      { slug: 'fundamentals', title: 'Fundamentals', group: 'Repository and writing' }
    ])
    assert.deepEqual(plan.areas, [
      { slug: 'fundamentals', title: 'Fundamentals' },
      { slug: 'work-and-delivery', title: 'Work and delivery', group: 'Delivery cycle' }
    ])
  })

  test('keeps the vendored fields untouched beside the attached areas', () => {
    const [skill] = withFunctionalAreas(catalogue, areas).domains[0].skills

    assert.deepEqual(
      skill.fields.map((field) => field.label),
      ['Kind', 'Applicability', 'Arguments', 'Dependencies', 'Runtime']
    )
  })

  test('refuses a catalogue skill that no area holds', () => {
    const onlyAuthoring = parseFunctionalAreas(
      areasModule(
        fundamentals.replace("      { skills: ['ki-plan'] }\n", '').replace("'ki-authoring'] },", "'ki-authoring'] }")
      )
    )

    assert.throws(() => withFunctionalAreas(catalogue, onlyAuthoring), /ki-plan is in no functional area/)
  })

  test('refuses an area listing a skill the catalogue does not hold', () => {
    const ghost = parseFunctionalAreas(
      areasModule(`${fundamentals.replace("['ki-plan']", "['ki-plan', 'ki-ghost']")},\n${delivery}`)
    )

    assert.throws(() => withFunctionalAreas(catalogue, ghost), /fundamentals: lists ki-ghost/)
  })

  test('refuses a skill in two groups of one area', () => {
    const twice = parseFunctionalAreas(
      areasModule(
        `${fundamentals.replace("{ skills: ['ki-plan'] }", "{ skills: ['ki-plan', 'ki-authoring'] }")},\n${delivery}`
      )
    )

    assert.throws(() => withFunctionalAreas(catalogue, twice), /fundamentals: ki-authoring is in more than one group/)
  })
})

/** Real Git objects prove that the adapter cannot substitute working-tree files. */
const localFixture = async (missing?: string) => {
  const root = await mkdtemp(join(tmpdir(), 'ki-catalogue $; '))
  const git = (...args: string[]): string =>
    execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()
  git('init', '-q')
  const readme = block(`${governance}\n${processSkill}`)
  const functions = areasModule(`${fundamentals},\n${delivery}`)
  for (const [path, content] of [
    ['skills/README.md', readme],
    [AREAS_PATH, functions]
  ]) {
    if (path === missing) continue
    await mkdir(dirname(join(root, path)), { recursive: true })
    await writeFile(join(root, path), content)
    git('add', '--', path)
  }
  git(
    '-c',
    'user.name=Catalogue test',
    '-c',
    'user.email=catalogue@example.invalid',
    '-c',
    'core.hooksPath=/dev/null',
    '-c',
    'commit.gpgsign=false',
    'commit',
    '-qm',
    'test fixture'
  )
  git('tag', 'v1.2.3')
  return { root, git, ref: git('rev-parse', 'HEAD'), readme, functions }
}

describe('readCatalogueSources', () => {
  test('reads both exact commit and tag blobs despite dirty files, without fetch', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', () => {
      throw new Error('unexpected network')
    })
    const fixture = await localFixture()
    await writeFile(join(fixture.root, 'skills/README.md'), 'dirty README')
    await writeFile(join(fixture.root, AREAS_PATH), 'dirty functions')
    for (const ref of [fixture.ref, 'v1.2.3']) {
      const sources = await readCatalogueSources(ref, fixture.root)
      assert.deepEqual(sources, [fixture.readme, fixture.functions])
      assert.equal(withFunctionalAreas(parseCatalogue(sources[0]), parseFunctionalAreas(sources[1])).counts.total, 2)
    }
    assert.equal(fetch.mock.calls.length, 0)
    t.mock.restoreAll()
  })

  test('rejects mutable, abbreviated and absent refs without network fallback', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', () => {
      throw new Error('unexpected network')
    })
    const { root } = await localFixture()
    for (const ref of ['', 'main', '8897008', 'v1.2.3; echo unsafe']) {
      await assert.rejects(readCatalogueSources(ref, root), /not an immutable ref/)
    }
    for (const ref of ['v9.9.9', 'f'.repeat(40)]) {
      await assert.rejects(readCatalogueSources(ref, root), /rev-parse/)
    }
    await assert.rejects(readCatalogueSources('v1.2.3', join(root, 'absent-repository')), /git/)
    await assert.rejects(readCatalogueSources('v1.2.3', ''), /local repository path/)
    assert.equal(fetch.mock.calls.length, 0)
    t.mock.restoreAll()
  })

  for (const missing of ['skills/README.md', AREAS_PATH]) {
    test(`fails closed when the pinned commit lacks ${missing}`, async (t) => {
      const fetch = t.mock.method(globalThis, 'fetch', () => {
        throw new Error('unexpected network')
      })
      const { root, ref } = await localFixture(missing)
      await mkdir(dirname(join(root, missing)), { recursive: true })
      await writeFile(join(root, missing), 'untracked file cannot replace absent blob')
      await assert.rejects(readCatalogueSources(ref, root), /cat-file/)
      assert.equal(fetch.mock.calls.length, 0)
      t.mock.restoreAll()
    })
  }

  test('does not lazily fetch an absent blob from a promisor remote', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', () => {
      throw new Error('unexpected network')
    })
    const { root, git, ref } = await localFixture()
    const blob = git('rev-parse', `${ref}:skills/README.md`)
    await rename(join(root, '.git/objects', blob.slice(0, 2), blob.slice(2)), join(root, 'withheld-blob'))
    git('config', 'extensions.partialClone', 'origin')
    git('config', 'remote.origin.promisor', 'true')
    git('config', 'remote.origin.url', join(root, 'absent-remote'))
    const trace = join(root, 'git-trace.log')
    const previousTrace = process.env.GIT_TRACE
    process.env.GIT_TRACE = trace
    try {
      await assert.rejects(readCatalogueSources(ref, root), /cat-file/)
    } finally {
      if (previousTrace === undefined) delete process.env.GIT_TRACE
      else process.env.GIT_TRACE = previousTrace
    }
    assert.doesNotMatch(await readFile(trace, 'utf8'), /\bfetch\b|upload-pack/)
    assert.equal(fetch.mock.calls.length, 0)
    t.mock.restoreAll()
  })

  test('retains the two existing GitHub source URLs when local input is omitted', async (t) => {
    const ref = '8'.repeat(40)
    const fetch = t.mock.method(
      globalThis,
      'fetch',
      async (url: string | URL | Request) =>
        new Response(String(url).endsWith('/skills/README.md') ? 'remote README' : 'remote functions')
    )
    assert.deepEqual(await readCatalogueSources(ref), ['remote README', 'remote functions'])
    assert.deepEqual(
      fetch.mock.calls.map((call) => String(call.arguments[0])).sort(),
      ['skills/README.md', AREAS_PATH]
        .map((path) => `https://raw.githubusercontent.com/knowledgeislands/ki-agentic-harness/${ref}/${path}`)
        .sort()
    )
    t.mock.restoreAll()
  })

  test('CLI requires --ref and a value for explicit --from', () => {
    for (const args of [
      ['--from', '/unused'],
      ['--ref', 'v1.2.3', '--from'],
      ['--ref', 'v1.2.3', '--from', '--other']
    ]) {
      const result = spawnSync(process.execPath, [join(import.meta.dirname, 'sync-skill-catalogue.ts'), ...args], {
        encoding: 'utf8'
      })
      assert.equal(result.status, 1)
      assert.match(result.stderr, /usage: sync-skill-catalogue.ts/)
    }
  })
})
