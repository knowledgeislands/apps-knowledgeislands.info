/**
 * Verifies that every `ki-...` name the Docs pages mention is a name the harness still has.
 *
 * A skill token in prose is a claim: `ki-delegation` tells the reader there is a skill they can
 * reach for by that name. The harness renames and retires skills, and the catalogue the site
 * vendors (`src/_data/skillCatalogue.json5`) follows it at a pinned ref, but the prose that named
 * the old skill does not: a page written when the skill was `ki-delegate` kept saying so after
 * the rename and nothing failed. This gate reads every `ki-[a-z-]+` token in `src/docs/**\/*.md`,
 * code spans included, and requires each to be one of:
 *
 *   - a skill in the vendored catalogue;
 *   - a token that appears in the vendored CLI inventory, `src/_data/cliCommands.json5`, because
 *     the CLI's own text names conventions such as `.ki-meta/` and `ki-checkpoint` that are not
 *     skills and are correct to repeat;
 *   - a name on the allow-list below, each with its reason.
 *
 * Fenced code blocks are skipped: a code block quotes output, configuration or a transcript as
 * it is, and a historical name inside one is a fact about that artefact rather than a claim about
 * the harness. Inline code spans are checked, because a span in a sentence is the sentence
 * naming a thing.
 *
 * See docs/guides/developer/feature-areas.md.
 */

import { readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSON5 from 'json5'
import { byExtension, walk } from './lib/walk.ts'

/**
 * Names that look like skills and are not, each kept for a stated reason. A name that stops being
 * true leaves this list; the gate then fails on the page that still uses it.
 */
export const ALLOWED_NAMES: ReadonlyMap<string, string> = new Map([
  // Repository names in the ecosystem, which share the prefix.
  ['ki-principal', 'repository: Knowledge Islands Principal'],
  ['ki-design', 'repository: the design system and site structure'],
  ['ki-specifications', 'repository: KI Specifications'],
  ['ki-agentic-harness', 'repository: the KI Agentic Harness'],
  ['ki-techne-harness', 'repository: the Techne Harness'],
  ['ki-website', 'repository: this site'],
  // Configuration and convention names a reader types as written.
  ['ki-self', 'the [skills.ki-self] table in .ki.toml, a repository-owned provider rather than a harness skill'],
  ['ki-depends-on', 'the SKILL.md frontmatter key that declares composition'],
  ['ki-chatgpt-capture', 'the ChatGPT local-capture configuration value a reader sets'],
  ['ki-mcporter', 'the mcporter MCP bridge server name as it appears in a client configuration']
])

/**
 * A skill-shaped token: the prefix, then hyphenated lower-case words. A token followed by `-` or
 * `*` is a glob such as `ki-repo-*`, which names a family rather than a skill, and is not checked.
 */
export const SKILL_TOKEN = /\bki-[a-z][a-z-]*[a-z]\b(?![-*])/g

/** The body with fenced code blocks removed, so only prose and inline code spans remain. */
export const stripFences = (markdown: string): string =>
  markdown.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')

/** Every distinct `ki-...` token in `markdown`, outside fenced code blocks, in first-seen order. */
export const skillTokens = (markdown: string): string[] => {
  const seen = new Set<string>()
  for (const match of stripFences(markdown).matchAll(SKILL_TOKEN)) seen.add(match[0])
  return [...seen]
}

/** Every `ki-...` token the vendored CLI inventory's own text uses. */
export const inventoryTokens = (inventoryText: string): Set<string> => new Set(inventoryText.match(SKILL_TOKEN) ?? [])

/**
 * The failures for one page: each unknown token as a one-line sentence. Pure, so a suite can hand
 * in a body and the rosters and read the verdict.
 */
export const checkPage = (
  path: string,
  markdown: string,
  catalogueSkills: ReadonlySet<string>,
  inventory: ReadonlySet<string>,
  allowed: ReadonlyMap<string, string> = ALLOWED_NAMES
): string[] =>
  skillTokens(markdown)
    .filter((token) => !catalogueSkills.has(token) && !inventory.has(token) && !allowed.has(token))
    .map(
      (token) => `${path}: names "${token}", which is not a catalogue skill, a CLI inventory token or an allowed name.`
    )

const main = (): void => {
  const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const docsDir = resolve(siteRoot, 'src/docs')
  const catalogue = JSON5.parse(readFileSync(resolve(siteRoot, 'src/_data/skillCatalogue.json5'), 'utf-8')) as {
    domains: { skills: { name: string }[] }[]
  }
  const catalogueSkills = new Set(catalogue.domains.flatMap((domain) => domain.skills.map((skill) => skill.name)))
  const inventory = inventoryTokens(readFileSync(resolve(siteRoot, 'src/_data/cliCommands.json5'), 'utf-8'))

  const files = walk(docsDir, byExtension('.md'))
  const failures = files.flatMap((file) =>
    checkPage(relative(siteRoot, file), readFileSync(file, 'utf-8'), catalogueSkills, inventory)
  )
  for (const failure of failures) console.error(`verify-skill-names: ${failure}`)
  if (failures.length > 0) {
    console.error(`verify-skill-names: ${failures.length} failure${failures.length === 1 ? '' : 's'}`)
    process.exit(1)
  }
  console.log(`verify-skill-names: ${files.length} pages checked against ${catalogueSkills.size} catalogue skills`)
}

if (import.meta.main) main()
