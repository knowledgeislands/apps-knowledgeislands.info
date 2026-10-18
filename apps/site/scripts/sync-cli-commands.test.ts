import assert from 'node:assert/strict'
import { describe, test } from 'node:test'
import { parseCliManual } from './sync-cli-commands.ts'

/** One `.TP` block: the invocation, then its description. */
const entry = (command: string, ...description: string[]): string[] => ['.TP', command, ...description]

/** One `.SS` group as SYNOPSIS writes it: no purpose paragraph, and terser descriptions. */
const synopsisGroup = (name: string, ...entries: string[][]): string[] => [
  `.SS ${name}`,
  '\\&',
  ...(entries.length === 0 ? entry('.B ki group-0 command-0', 'Does thing 0.') : entries.flat())
]

/** One `.SS` group: a heading, a purpose paragraph, then entries. */
const group = (name: string, purpose: string, ...entries: string[][]): string[] => [
  `.SS ${name}`,
  '\\&',
  '.PP',
  purpose,
  ...entries.flat()
]

/**
 * Builds a manual around the sections under test.
 *
 * The padding matters: the parser must find each section among other `.SH`
 * sections and stop at the next one, rather than reading to the end of the file.
 *
 * SYNOPSIS defaults to restating a group COMMAND GROUPS already carries, which
 * is the ordinary case — the two sections agree and the cross-check adds
 * nothing. Pass `synopsis` to model the case where they do not.
 */
const manual = (groups: string[][], synopsis: string[][] = [synopsisGroup('Group 0')]): string =>
  [
    '.TH KI 1 "2026-09-18" "Knowledge Islands" "User Commands"',
    '.SH SYNOPSIS',
    ...synopsis.flat(),
    '.SH COMMAND GROUPS',
    '\\&',
    '.PP',
    'KI divides commands into groups by operational scope and purpose.',
    ...groups.flat(),
    '.SH EXIT STATUS',
    '.PP',
    'A trailing section the parser must not read.'
  ].join('\n')

/** Enough groups and commands to clear the parser's structural floor. */
const padding = (count: number): string[][] =>
  Array.from({ length: count }, (_, index) =>
    group(
      `Group ${index}`,
      `Use these commands for group ${index}.`,
      ...Array.from({ length: 6 }, (_, position) =>
        entry(`.B ki group-${index} command-${position}`, `Does thing ${position}.`)
      )
    )
  )

const parseWithPadding = (...groups: string[][]) => parseCliManual(manual([...groups, ...padding(8)]))

const parseWithSynopsis = (synopsis: string[][], ...groups: string[][]) =>
  parseCliManual(manual([...groups, ...padding(8)], synopsis))

describe('parseCliManual', () => {
  test('reads groups, their purpose, and their commands', () => {
    const inventory = parseWithPadding(
      group(
        'Installation',
        'Use this command to bootstrap the user-managed KI environment.',
        entry('.B ki bootstrap [--refresh]', 'Detect agents and install the canonical harness.')
      )
    )

    const installation = inventory.groups[0]
    assert.equal(installation?.name, 'Installation')
    assert.equal(installation?.purpose, 'Use this command to bootstrap the user-managed KI environment.')
    assert.deepEqual(installation?.commands, [
      { command: 'ki bootstrap [--refresh]', description: 'Detect agents and install the canonical harness.' }
    ])
    assert.equal(inventory.counts.groups, 9)
    assert.equal(inventory.counts.commands, 49)
  })

  test('joins a description that roff wrapped across several lines', () => {
    const inventory = parseWithPadding(
      group(
        'Local management',
        'Use these commands to inspect the local KI installation.',
        entry('.B ki manage docs [topic]', 'Print canonical KI documentation', 'locations.')
      )
    )

    assert.equal(inventory.groups[0]?.commands[0]?.description, 'Print canonical KI documentation locations.')
  })

  test('joins a description continued in an indented paragraph', () => {
    const inventory = parseWithPadding(
      group(
        'Agents',
        'Use these commands to run background agents.',
        entry('.B ki agent watch <run>', 'Print each new event.', '.IP', 'Each run keeps an event log.')
      )
    )

    assert.equal(inventory.groups[0]?.commands[0]?.description, 'Print each new event. Each run keeps an event log.')
  })

  test('continues an invocation onto a wrapped option list', () => {
    const inventory = parseWithPadding(
      group(
        'Acquisition',
        'Acquisition is action-first and adapter-driven.',
        entry('.B ki acquire list', '.RI [--repo\\ <path>]', 'List discovered acquisition sources.')
      )
    )

    assert.deepEqual(inventory.groups[0]?.commands[0], {
      command: 'ki acquire list [--repo <path>]',
      description: 'List discovered acquisition sources.'
    })
  })

  test('attaches punctuation to an alternating-font run without a space', () => {
    const inventory = parseWithPadding(
      group(
        'Trades',
        'Use these commands where repositories declare trade routes.',
        entry('.B ki trade routes list', 'Pass', '.BR --table ,', 'to render a table.')
      )
    )

    assert.equal(inventory.groups[0]?.commands[0]?.description, 'Pass --table, to render a table.')
  })

  test('keeps an escaped space inside one bold run', () => {
    const inventory = parseWithPadding(
      group(
        'Harness management',
        'Use these commands to install compatible harness payloads.',
        entry('.B ki harness install <harness-id>', 'Authenticate first with', '.BR gh\\ auth\\ login .')
      )
    )

    assert.equal(inventory.groups[0]?.commands[0]?.description, 'Authenticate first with gh auth login.')
  })

  test('normalises an italicised placeholder onto the angle-bracket spelling', () => {
    const inventory = parseWithPadding(
      group(
        'Harness management',
        'Use these commands to install compatible harness payloads.',
        entry('.B ki harness install \\fIharness-id\\fR', 'Install one configured compatible harness.')
      )
    )

    assert.equal(inventory.groups[0]?.commands[0]?.command, 'ki harness install <harness-id>')
  })

  test('rejects a manual with no COMMAND GROUPS section', () => {
    assert.throws(() => parseCliManual('.TH KI 1\n.SH SYNOPSIS\n.PP\nNothing here.\n'), /section not found/)
  })

  test('rejects a group that lists no commands', () => {
    assert.throws(
      () => parseWithPadding(group('Empty', 'Use these commands for nothing at all.')),
      /Empty: group lists no commands/
    )
  })

  test('rejects a command with no description', () => {
    assert.throws(
      () => parseWithPadding(group('Installation', 'Use this command to bootstrap.', entry('.B ki bootstrap'))),
      /ki bootstrap: command carries no description/
    )
  })

  test('rejects a roff macro it does not understand', () => {
    assert.throws(
      () =>
        parseWithPadding(
          group(
            'Installation',
            'Use this command to bootstrap.',
            entry('.B ki bootstrap', '.XX something', 'Detect agents.')
          )
        ),
      /unsupported roff macro "\.XX"/
    )
  })

  test('rejects a manual whose structure has shrunk below recognition', () => {
    assert.throws(
      () =>
        parseCliManual(
          manual([group('Installation', 'Use this command to bootstrap.', entry('.B ki bootstrap', 'Detect agents.'))])
        ),
      /the manual's structure has changed/
    )
  })

  test('carries a group the reference section omits, marked as such', () => {
    const inventory = parseWithSynopsis([
      synopsisGroup('Group 0'),
      synopsisGroup('Batch records', entry('.B ki batch validate <record>', 'Validate one canonical batch record.'))
    ])

    const recovered = inventory.groups.at(-1)
    assert.equal(recovered?.name, 'Batch records')
    assert.equal(recovered?.omittedFromReference, true)
    assert.equal(recovered?.purpose, '')
    assert.deepEqual(recovered?.commands, [
      { command: 'ki batch validate <record>', description: 'Validate one canonical batch record.' }
    ])
    assert.equal(inventory.counts.omittedGroups, 1)
  })

  test('does not repeat a group both sections carry', () => {
    const inventory = parseWithSynopsis([synopsisGroup('Group 0'), synopsisGroup('Group 1')])

    assert.equal(inventory.counts.omittedGroups, 0)
    assert.equal(inventory.groups.filter((entry) => entry.name === 'Group 1').length, 1)
  })

  test('accepts a synopsis entry with no description of its own', () => {
    const inventory = parseWithSynopsis([synopsisGroup('Batch records', ['.TP', '.B ki batch close <record>'])])

    assert.equal(inventory.groups.at(-1)?.commands[0]?.description, '')
  })

  test('rejects a duplicated command', () => {
    assert.throws(
      () =>
        parseWithPadding(
          group(
            'Installation',
            'Use this command to bootstrap.',
            entry('.B ki bootstrap', 'Detect agents.'),
            entry('.B ki bootstrap', 'Detect agents again.')
          )
        ),
      /ki bootstrap: command appears more than once/
    )
  })
})
