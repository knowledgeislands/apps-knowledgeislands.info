/**
 * Verifies that a Docs section is declared, ordered, and written in the site's own voice.
 *
 * Guidance used to be a section of its own, and it read as a routing layer over
 * other repositories' work: seventy links into GitHub across thirty-five pages,
 * six of them literally `[The full guide](…/tools-ki/blob/…)`. Moving those
 * pages under the projects that own them fixed where they lived (KI-WEBSITE-SITE-025);
 * this fixes what they say, because a page that moved and still points at a
 * README has changed its URL and nothing else.
 *
 * The pages have since moved again. A guide is not a thing a reader looks up
 * once — it is one page of a finite body of material with a beginning and an
 * end — so they now live in sections under `src/docs/` rather than beneath the
 * project each describes, and a project page links to its section rather than
 * listing its pages (KI-WEBSITE-SITE-037). This gate moved with them, and what it
 * resolves the binding against moved too: the authority is now
 * `src/_data/docsSections.json5`, the registry the Docs landing grid is built
 * from, rather than the project registry. A section must be declared to exist
 * and must exist to be declared, in both directions, so a card cannot point at
 * an empty section and a section cannot exist without a card.
 *
 * What is checked, all against source rather than `dist/` so the gate can run
 * before a build:
 *
 *   - every directory under `src/docs/` is a section the registry declares,
 *     and every declared section has a directory;
 *   - the directory data file beside the pages carries the binding, so a page
 *     added later belongs because of where it lives rather than because someone
 *     remembered a frontmatter line;
 *   - every page declares a unique reading position, because a section is read
 *     in a sequence somebody chose;
 *   - a Markdown page opens with prose before its first `##`, saying what the
 *     reader will be able to do;
 *   - no link text is a hand-off phrase.
 *
 * The last two are asked of Markdown pages only. Get Started and Contribute are
 * hand-built landing pages on `layouts/base.njk` carrying hero sections and
 * their own containers, so "the prose before the first heading" is not a thing
 * they have. They are still sections, still bound, and still ordered.
 *
 * A repository link is not banned and should not be. The test from
 * GDR-KI-WEBSITE-002 is whether it survives as a fact rather than as a
 * destination, and link text is the part of that a machine can judge: "the full
 * guide" names a destination, while "the installer published at v0.4.0" names a
 * fact. Provenance is `verify-provenance.ts`; this file owns voice.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSON5 from 'json5'
import { readFrontmatter } from './lib/frontmatter.ts'
import { byExtension, walk } from './lib/walk.ts'

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = resolve(siteRoot, 'src/docs')
const registryPath = resolve(siteRoot, 'src/_data/docsSections.json5')

/** The layout that carries the prose measure, the styling and the provenance footer. */
const proseLayout = 'layouts/page.njk'

/** A lead shorter than this is a label, not a claim about what the reader gains. */
const minimumLeadLength = 120

/**
 * Link text that names a destination instead of a fact.
 *
 * Matched against the whole anchor text, lowercased and trimmed of trailing
 * punctuation, so a sentence *containing* "the full guide" as part of a real
 * claim is untouched while a link whose entire text is that phrase is not.
 */
const deferralPhrases = [
  'the full guide',
  'the full documentation',
  'full documentation',
  'full guide',
  'see the readme',
  'see the docs',
  'see the documentation',
  'read more',
  'more here',
  'learn more',
  'the guide',
  'here',
  'docs',
  'documentation',
  'readme',
  'this page'
]

interface Section {
  slug: string
  title: string
  description: string
}

const failures: string[] = []

const fail = (message: string): void => {
  failures.push(message)
}

/** Every page below a section's directory, Markdown or hand-built. */
const sectionPages = (dir: string): string[] => (existsSync(dir) ? walk(dir, byExtension('.md', '.njk')) : [])

/** The frontmatter block and the body that follows it. */
const split = (contents: string): { frontmatter: string; body: string } => {
  const read = readFrontmatter(contents)
  return read.kind === 'block' ? { frontmatter: read.block, body: read.body } : { frontmatter: '', body: contents }
}

/**
 * The prose a reader meets before the first heading below the title.
 *
 * Nunjucks includes, HTML blocks and the `# Title` line itself are not prose a
 * reader can act on, so none of them count towards the lead.
 */
const lead = (body: string): string => {
  const collected: string[] = []
  for (const line of body.split('\n')) {
    const trimmed = line.trim()
    if (trimmed.startsWith('##')) break
    if (trimmed === '' || trimmed.startsWith('#') || trimmed.startsWith('{%') || trimmed.startsWith('<')) continue
    collected.push(trimmed)
  }
  return collected.join(' ')
}

/** Anchor texts in one body, with Markdown emphasis and code markers stripped. */
const linkTexts = (body: string): string[] =>
  [...body.matchAll(/\[([^\]]+)\]\([^)]*\)/g)].map((match) =>
    (match[1] as string)
      .replace(/[*_`]/g, '')
      .trim()
      .replace(/[.,;:!?]+$/, '')
      .toLowerCase()
  )

const registry = JSON5.parse(readFileSync(registryPath, 'utf-8')) as Section[]
const declared = new Set(registry.map((section) => section.slug))

const directories = readdirSync(docsDir).filter((name) => statSync(resolve(docsDir, name)).isDirectory())
const present = new Set(directories)

// The registry is what the landing grid iterates, so a slug in it with no directory renders a
// card for a section that does not exist, and a directory missing from it renders pages nothing
// links to. Both are silent without this.
for (const slug of declared) {
  if (!present.has(slug)) {
    fail(`src/_data/docsSections.json5 declares section "${slug}", but src/docs/${slug}/ does not exist.`)
  }
}

let pageCount = 0

for (const directory of directories) {
  const dataFile = resolve(docsDir, directory, `${directory}.json5`)
  const dataPath = relative(siteRoot, dataFile)

  if (!declared.has(directory)) {
    fail(
      `src/docs/${directory}/: no section with slug "${directory}" is declared in src/_data/docsSections.json5, so nothing links to its pages.`
    )
  }

  let data: { section?: string; layout?: string }
  try {
    data = JSON5.parse(readFileSync(dataFile, 'utf-8')) as { section?: string; layout?: string }
  } catch {
    fail(`${dataPath}: missing. A page belongs to its section by the directory data file, not by its own frontmatter.`)
    continue
  }

  if (data.section !== directory) {
    fail(`${dataPath}: declares section "${data.section}", but sits at src/docs/${directory}/.`)
  }

  const positions = new Map<number, string>()
  const files = sectionPages(resolve(docsDir, directory))
  const hasMarkdown = files.some((file) => file.endsWith('.md'))

  // A hand-built landing page brings its own layout and its own containers; a Markdown page has
  // neither, so a section holding Markdown must bind the prose chrome for it.
  if (hasMarkdown && data.layout !== proseLayout) {
    fail(
      `${dataPath}: declares layout "${data.layout}"; a section of Markdown pages needs "${proseLayout}" for its prose chrome and provenance footer.`
    )
  }

  for (const file of files) {
    pageCount += 1
    const page = relative(siteRoot, file)
    const { frontmatter, body } = split(readFileSync(file, 'utf-8'))

    // The first page a reader meets in a section decides whether they read a second, so the
    // sequence is an editorial decision rather than an accident of what was written when. Eleventy
    // sorts unpositioned pages last, which is a reasonable default and a poor rule: every page
    // added without one appends, and the reading order decays toward chronology with nothing
    // failing. Requiring the key makes the decision explicit; requiring it to be unique stops two
    // pages tying and falling through to a title sort nobody chose. (KI-WEBSITE-SITE-029)
    const orderLine = frontmatter.match(/^order:[ \t]*(.*)$/m)
    if (!orderLine) {
      fail(`${page}: declares no "order"; a section is read in a chosen sequence, not the order it was written.`)
    } else {
      const position = Number(orderLine[1]?.trim())
      if (!Number.isInteger(position) || position < 1) {
        fail(`${page}: "order: ${orderLine[1]?.trim()}" is not a positive whole number.`)
      } else {
        const taken = positions.get(position)
        if (taken) {
          fail(
            `${page}: takes order ${position}, which ${taken} already holds; the tie is broken by title rather than by a decision.`
          )
        } else {
          positions.set(position, page)
        }
      }
    }

    // The contents block and the landing card both print the title, so a page without one appears
    // in its own section as a blank line.
    if (!/^title:[ \t]*\S/m.test(frontmatter)) {
      fail(`${page}: declares no "title"; its own section's contents list has nothing to print.`)
    }

    if (!file.endsWith('.md')) continue

    const opening = lead(body)
    if (opening.length < minimumLeadLength) {
      fail(
        `${page}: opens with ${opening.length} characters before its first "##"; a reader needs at least ${minimumLeadLength} saying what they will be able to do.`
      )
    }

    for (const text of linkTexts(body)) {
      if (deferralPhrases.includes(text)) {
        fail(`${page}: a link reads "${text}", which names a destination rather than a fact the page states.`)
      }
    }
  }
}

if (failures.length > 0) {
  for (const message of failures) console.error(`error: ${message}`)
  console.error(`\nverify-docs-sections: ${failures.length} problem(s) found`)
  process.exit(1)
}

console.log(
  `verify-docs-sections: ${pageCount} page(s) across ${directories.length} Docs section${directories.length === 1 ? '' : 's'} verified`
)
