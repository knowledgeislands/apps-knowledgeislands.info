/**
 * Vendors the `ki` command inventory out of the tool's own manual page.
 *
 * `/projects/ki/command-groups/` was 136 words and five links — the shortest page on the
 * site, and a reader who wanted to know what `ki` can do had to leave for a
 * repository to find out. Carrying that inventory in hand-written prose is the
 * wrong fix: eighty-four commands that change every release is exactly the
 * material that rotted the skill catalogue to 42 entries against an upstream
 * 61 with nothing noticing (KI-WEBSITE-SITE-022).
 *
 * So the site consumes the published interface instead. `man/ki.1` is the
 * manual the CLI ships and installs; its COMMAND GROUPS section is a grouped
 * inventory with a purpose paragraph per group and a description per command,
 * and its SYNOPSIS lists the same commands more tersely. This parses both at an
 * immutable ref, reconciles them, and writes the result to
 * `src/_data/cliCommands.json5`.
 *
 * The snapshot is vendored rather than fetched during the build, for the same
 * reason the skill catalogue is: `apps/site/dist/` must be reproducible, and a
 * build that reached the network would depend on when it ran. Drift is caught
 * by the ordinary provenance sweep, because the page still declares `man/ki.1`
 * at this ref in its `sources`.
 *
 * Unlike the harness catalogue, roff carries no marker naming this block as a
 * published contract, so the parse asserts on structure it can check and
 * refuses anything it does not recognise rather than degrading quietly. The
 * durable fix is a machine-readable command projection from `tools-ki`; see
 * the handoff recorded against KI-WEBSITE-SITE-022.
 *
 * Usage: bun scripts/sync-cli-commands.ts --ref <tag-or-commit>
 * See docs/guides/developer/page-provenance.md.
 */

import { writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { githubFetchOk } from './lib/github.ts'

const SOURCE_REPOSITORY = 'knowledgeislands/tools-ki'
const SOURCE_PATH = 'man/ki.1'

/** The manual section carrying the grouped inventory, as opposed to SYNOPSIS. */
const SECTION = '.SH COMMAND GROUPS'

/**
 * The manual's other inventory, parsed only to check the first one for holes.
 *
 * SYNOPSIS lists every command with a one-line description; COMMAND GROUPS
 * lists them again, grouped, with a purpose per group and a fuller description
 * per command. The second is what this site renders — and at v0.4.0 it was
 * missing an entire group the first one had, so a page claiming to list every
 * command was four commands short with nothing to say so. The two sections are
 * therefore both parsed, and a group present only in SYNOPSIS is carried with
 * that section's descriptions and marked as the omission it is.
 */
const SYNOPSIS_SECTION = '.SH SYNOPSIS'

/** Below these, the parse is reading a manual it does not recognise. */
const MINIMUM_GROUPS = 8
const MINIMUM_COMMANDS = 40

/** Stands in for an escaped space while a macro's arguments are being split. */
const SPACE = '\u0000'

const tagPattern = /^v\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/
const commitPattern = /^[0-9a-f]{40}$/

export interface CliCommand {
  /** The invocation as the manual writes it, argument placeholders included. */
  command: string
  description: string
}

export interface CliGroup {
  name: string
  /**
   * True when COMMAND GROUPS omits this group and it was recovered from
   * SYNOPSIS. The page says so rather than presenting it as equivalent.
   */
  omittedFromReference?: boolean
  /** The manual's own paragraph on what the group is for. */
  purpose: string
  commands: CliCommand[]
}

export interface CliInventory {
  counts: { groups: number; commands: number; omittedGroups: number }
  groups: CliGroup[]
}

/**
 * Resolves the inline escapes roff uses inside a macro argument.
 *
 * Only the forms this manual actually uses are handled: font selection, the
 * zero-width `\\&` that roff pads blocks with, and escaped hyphens, spaces and
 * backslashes. An unhandled escape would reach the page as a literal, so
 * `assertRendered` rejects the leftovers rather than publishing them.
 */
const unroff = (text: string): string =>
  text
    .replace(/\\f[BIRP]/g, '')
    .replace(/\\&/g, '')
    .replace(/\\-/g, '-')
    .replace(/\\ /g, ' ')
    .replaceAll(SPACE, ' ')
    .replace(/\\\\/g, '\\')

/**
 * Splits a macro's arguments on whitespace, honouring roff's double quoting.
 *
 * An escaped space is not an argument boundary — `.BR gh\\ auth\\ login` is one
 * bold run, not three — so it is parked on a sentinel that `unroff` restores.
 */
const macroArguments = (text: string): string[] =>
  [...text.replace(/\\ /g, SPACE).matchAll(/"([^"]*)"|(\S+)/g)].map((match) => (match[1] ?? match[2]) as string)

/**
 * Renders one line of roff to the text a reader would see.
 *
 * A plain line is its own text. A single-font macro takes the rest of the line.
 * The alternating-font macros concatenate their arguments with no separator,
 * which is how the manual attaches trailing punctuation to a bold run —
 * `.BR --write ,` is "--write,", not "--write ,". Any other macro throws: this
 * parser reads a published interface, and a construct it does not understand
 * means the interface changed.
 */
const renderLine = (line: string): string => {
  if (!line.startsWith('.')) return unroff(line).replace(/\s+/g, ' ').trim()

  const macro = line.slice(1).split(/\s/, 1)[0] as string
  const rest = line.slice(macro.length + 1).trim()

  if (['B', 'I', 'R', 'SM'].includes(macro)) {
    return macroArguments(rest).map(unroff).join(' ').replace(/\s+/g, ' ').trim()
  }

  if (['BR', 'RB', 'IR', 'RI', 'BI', 'IB'].includes(macro)) {
    return macroArguments(rest).map(unroff).join('').replace(/\s+/g, ' ').trim()
  }

  throw new Error(`unsupported roff macro ".${macro}" in "${line}"`)
}

/**
 * Marks an italicised run inside an invocation as the placeholder it is.
 *
 * The manual writes argument placeholders two ways — `<harness-id>` in the
 * synopsis, `\\fIharness-id\\fR` in one command-group entry — and dropping the
 * font selection alone would publish `ki harness install harness-id`, which
 * reads as a literal argument. Angle brackets are the form the manual uses
 * everywhere else, so the two spellings are normalised onto it.
 */
const markPlaceholders = (line: string): string => line.replace(/\\fI([^\\]+)\\f[RP]/g, '<$1>')

/**
 * Whether a macro line continues the invocation a `.TP` block just opened.
 *
 * Five acquisition commands wrap their option list onto a second `.RI` line, so
 * the command is not always one line. The test is deliberately narrow — an
 * argument continuation opens a bracket or an angle — so that a description
 * beginning with a macro is not swallowed into the command.
 */
const continuesCommand = (line: string): boolean =>
  /^\.(?:RI|IR|BR|RB|BI|IB)\s/.test(line) && /^[[<]/.test(renderLine(line))

const assertRendered = (text: string, where: string): string => {
  if (text.includes('\\')) throw new Error(`${where}: unrendered roff escape in "${text}"`)
  return text
}

/**
 * Parses one grouped-inventory section of `ki.1`.
 *
 * The shape relied on is roff's own: `.SS` opens a group, the paragraph before
 * the first `.TP` is the group's purpose, and each `.TP` introduces one command
 * as a `.B` line followed by its description. Every failure below is thrown
 * rather than worked around — a structure the parser does not recognise means
 * the manual changed, and an inventory that silently loses half its commands is
 * worse than one that refuses to build, because nobody would notice.
 */
const parseSection = (roff: string, section: string, reference: boolean): CliGroup[] => {
  const start = roff.indexOf(`\n${section}\n`)
  if (start === -1) throw new Error(`${section} section not found`)
  if (roff.indexOf(`\n${section}\n`, start + 1) !== -1) throw new Error(`duplicate ${section} section`)

  const body = roff.slice(start + section.length + 2)
  const end = body.search(/\n\.SH /)
  const lines = (end === -1 ? body : body.slice(0, end)).split('\n')

  const groups: CliGroup[] = []
  let group: CliGroup | null = null
  let reading: 'purpose' | 'command' | null = null
  let command: string[] | null = null
  let description: string[] = []
  let purpose: string[] = []

  const flushCommand = (): void => {
    if (command === null) return
    const joined = command.join(' ')
    if (group === null) throw new Error(`${joined}: command appears before any .SS group heading`)
    const rendered = assertRendered(joined.replace(/\s+/g, ' ').trim(), 'command')
    const text = assertRendered(description.join(' ').replace(/\s+/g, ' ').trim(), rendered)
    if (rendered === '') throw new Error('a .TP block carries an empty command')
    if (reference && text === '') throw new Error(`${rendered}: command carries no description`)
    group.commands.push({ command: rendered, description: text })
    command = null
    description = []
  }

  const flushGroup = (): void => {
    if (group === null) return
    flushCommand()
    group.purpose = assertRendered(purpose.join(' ').replace(/\s+/g, ' ').trim(), `${group.name} purpose`)
    if (reference && group.purpose === '') throw new Error(`${group.name}: group states no purpose`)
    if (group.commands.length === 0) throw new Error(`${group.name}: group lists no commands`)
    purpose = []
  }

  for (const line of lines) {
    const heading = line.match(/^\.SS (.+)$/)
    if (heading) {
      flushGroup()
      const name = unroff(heading[1] as string)
        .replace(/\s+/g, ' ')
        .trim()
      group = { name: assertRendered(name, 'group heading'), purpose: '', commands: [] }
      groups.push(group)
      reading = 'purpose'
      continue
    }

    if (line === '.TP') {
      flushCommand()
      reading = 'command'
      continue
    }

    // A bare `.IP` continues a `.TP` description in a new paragraph; the site joins it like `.PP`.
    if (line === '.PP' || line === '.IP' || line.trim() === '' || line.trim() === '\\&') continue

    if (reading === 'command') {
      if (command === null) command = [renderLine(markPlaceholders(line))]
      else if (description.length === 0 && continuesCommand(line)) command.push(renderLine(markPlaceholders(line)))
      else description.push(renderLine(line))
    } else if (reading === 'purpose') {
      purpose.push(renderLine(line))
    }
  }
  flushGroup()

  return groups
}

/**
 * Parses `ki.1` into the inventory the site publishes.
 *
 * COMMAND GROUPS supplies the inventory; SYNOPSIS is parsed only to find groups
 * the first section left out, which are appended in the order SYNOPSIS gives
 * them. The floors and the duplicate checks apply to the merged result, because
 * what the page publishes is what has to be sound.
 */
export function parseCliManual(roff: string): CliInventory {
  const groups = parseSection(roff, SECTION, true)
  const referenced = new Set(groups.map((entry) => entry.name))
  const omitted = parseSection(roff, SYNOPSIS_SECTION, false)
    .filter((entry) => !referenced.has(entry.name))
    .map((entry) => ({ ...entry, omittedFromReference: true }))

  groups.push(...omitted)

  const commands = groups.flatMap((entry) => entry.commands)
  if (groups.length < MINIMUM_GROUPS || commands.length < MINIMUM_COMMANDS) {
    throw new Error(
      `parsed ${groups.length} group(s) and ${commands.length} command(s); expected at least ${MINIMUM_GROUPS} and ${MINIMUM_COMMANDS}, so the manual's structure has changed`
    )
  }

  const names = groups.map((entry) => entry.name)
  const duplicateGroup = names.find((name, position) => names.indexOf(name) !== position)
  if (duplicateGroup) throw new Error(`${duplicateGroup}: group appears more than once`)

  const invocations = commands.map((entry) => entry.command)
  const duplicate = invocations.find((name, position) => invocations.indexOf(name) !== position)
  if (duplicate) throw new Error(`${duplicate}: command appears more than once`)

  return {
    counts: { groups: groups.length, commands: commands.length, omittedGroups: omitted.length },
    groups
  }
}

/** Kept in the generated file so its origin survives being read out of context. */
const header = (ref: string): string => `// GENERATED FILE — do not edit by hand.
//
// bun run --cwd apps/site sync:cli -- --ref <tag-or-commit>
//
// Vendored from ${SOURCE_REPOSITORY} ${SOURCE_PATH} at ${ref},
// parsed out of its COMMAND GROUPS section, reconciled against its SYNOPSIS.
//
// The page that renders it is src/projects/ki/command-groups.md; the reason the site
// vendors rather than paraphrases is in docs/guides/developer/page-provenance.md.

`

async function main(): Promise<void> {
  const refFlag = process.argv.indexOf('--ref')
  const ref = refFlag === -1 ? undefined : process.argv[refFlag + 1]
  if (!ref) throw new Error('usage: sync-cli-commands.ts --ref <tag-or-commit>')
  if (!tagPattern.test(ref) && !commitPattern.test(ref)) {
    throw new Error(`${ref} is not an immutable ref; pass an exact tag or a 40-character commit`)
  }

  const url = `https://raw.githubusercontent.com/${SOURCE_REPOSITORY}/${ref}/${SOURCE_PATH}`
  const response = await githubFetchOk(url)

  const inventory = parseCliManual(await response.text())
  const payload = { source: { repository: SOURCE_REPOSITORY, path: SOURCE_PATH, ref }, ...inventory }

  const target = resolve(import.meta.dirname, '../src/_data/cliCommands.json5')
  await writeFile(target, `${header(ref)}${JSON.stringify(payload, null, 2)}\n`)

  console.log(
    `sync-cli-commands: ${inventory.counts.commands} commands across ${inventory.counts.groups} groups at ${ref}`
  )
}

if (import.meta.main) {
  await main().catch((error: Error) => {
    console.error(`sync-cli-commands: ${error.message}`)
    process.exit(1)
  })
}
