import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import {
  CATALOGUE_END,
  CATALOGUE_START,
  parseCatalogue,
  parseFunctionalAreas,
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
