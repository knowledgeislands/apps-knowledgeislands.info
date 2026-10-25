/**
 * Verifies the feature-area crosswalk against the catalogue and the Docs tree.
 *
 * `src/_data/featureAreas.json5` is the planning view of the documentation: the areas a reader
 * must be able to understand, each mapped to the skills and commands that provide it and to the
 * page that explains it. The Docs sections are the reading view. Nothing in the build would
 * notice the two drifting apart: an area could name a skill the harness has since renamed, point
 * at a page that was moved, or a page could be written in Ways of working that no area claims
 * and so carries no Provided by box. This gate holds the two views together.
 *
 * What is checked, all against source so the gate can run before a build:
 *
 *   - every area has a unique slug and a title;
 *   - every skill an area names exists in the vendored catalogue, `src/_data/skillCatalogue.json5`,
 *     so a rename upstream fails here when the catalogue is refreshed rather than publishing a
 *     name the harness no longer has;
 *   - every `page` an area names resolves to a Markdown page under `src/docs/` whose permalink
 *     is that path;
 *   - every Markdown page under the Skills, Ways of working, Knowledge and Standards sections is
 *     claimed by exactly one area. Skills pages are exempt: they are about skills in general, not
 *     about one area, and carry no box.
 *
 * Commands are not checked against the CLI inventory. The inventory is vendored at its own pin,
 * and an area may name a command group the pinned release spells differently; the skill names
 * are the contract the harness guarantees.
 *
 * See docs/guides/developer/feature-areas.md.
 */

import { readFileSync } from 'node:fs'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSON5 from 'json5'
import { readFrontmatter } from './lib/frontmatter.ts'
import { byExtension, walk } from './lib/walk.ts'

export type FeatureArea = {
  slug: string
  title: string
  skills: string[]
  commands: string[]
  page?: string | string[]
  interim?: boolean
}

/** The sections whose Markdown pages an area must claim. Skills is listed to be walked, then exempted. */
export const CLAIMED_SECTIONS = ['skills', 'ways-of-working', 'knowledge', 'standards'] as const
export const EXEMPT_SECTIONS = ['skills'] as const

/** The `page` field as a list, whether it was written as one path or several. */
export const pagesOf = (area: FeatureArea): string[] =>
  area.page === undefined ? [] : Array.isArray(area.page) ? area.page : [area.page]

/** The permalink a Docs page declares, read from its frontmatter block. */
export const permalinkOf = (contents: string): string | undefined => {
  const frontmatter = readFrontmatter(contents)
  if (frontmatter.kind !== 'block') return undefined
  const match = frontmatter.block.match(/^permalink:\s*['"]?([^'"\n]+?)['"]?\s*$/m)
  return match?.[1]
}

export type DocsPageRecord = { path: string; section: string; permalink: string | undefined }

/**
 * The failures, each a one-line sentence naming the file or area at fault. Pure, so a suite can
 * hand in a crosswalk, a skill roster and a page list and read the verdict.
 */
export const checkFeatureAreas = (
  areas: FeatureArea[],
  catalogueSkills: ReadonlySet<string>,
  pages: DocsPageRecord[]
): string[] => {
  const failures: string[] = []
  const slugs = new Set<string>()
  const claims = new Map<string, string[]>()

  for (const area of areas) {
    const label = `featureAreas.json5: ${area.slug ?? '(no slug)'}`
    if (!area.slug || !/^[a-z][a-z0-9-]*$/.test(area.slug))
      failures.push(`${label}: slug must be a lower-case kebab-case key.`)
    else if (slugs.has(area.slug)) failures.push(`${label}: slug is declared twice.`)
    slugs.add(area.slug)
    if (!area.title) failures.push(`${label}: missing title.`)
    if (!Array.isArray(area.skills) || area.skills.length === 0) failures.push(`${label}: names no skills.`)
    if (!Array.isArray(area.commands)) failures.push(`${label}: commands must be a list, empty if none.`)

    for (const skill of area.skills ?? []) {
      if (!catalogueSkills.has(skill)) {
        failures.push(`${label}: names skill "${skill}", which is not in src/_data/skillCatalogue.json5.`)
      }
    }

    for (const path of pagesOf(area)) {
      if (!path.startsWith('/docs/') || !path.endsWith('/')) {
        failures.push(`${label}: page "${path}" must be a site path under /docs/ ending in a slash.`)
        continue
      }
      const page = pages.find((candidate) => candidate.permalink === path)
      if (!page) failures.push(`${label}: page "${path}" matches no Markdown page under src/docs/.`)
      claims.set(path, [...(claims.get(path) ?? []), area.slug])
    }
  }

  for (const page of pages) {
    if (!CLAIMED_SECTIONS.includes(page.section as (typeof CLAIMED_SECTIONS)[number])) continue
    if (EXEMPT_SECTIONS.includes(page.section as (typeof EXEMPT_SECTIONS)[number])) continue
    if (!page.permalink) {
      failures.push(`${page.path}: declares no permalink, so no area can claim it.`)
      continue
    }
    const claimants = claims.get(page.permalink) ?? []
    if (claimants.length === 0)
      failures.push(`${page.path}: no feature area claims it; add its path to an area's page.`)
    if (claimants.length > 1)
      failures.push(
        `${page.path}: claimed by ${claimants.length} areas (${claimants.join(', ')}); one area explains a page.`
      )
  }

  return failures
}

/** Every skill name in the vendored catalogue. */
export const catalogueSkillNames = (catalogue: { domains: { skills: { name: string }[] }[] }): Set<string> =>
  new Set(catalogue.domains.flatMap((domain) => domain.skills.map((skill) => skill.name)))

const main = (): void => {
  const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
  const docsDir = resolve(siteRoot, 'src/docs')
  const areas = JSON5.parse(readFileSync(resolve(siteRoot, 'src/_data/featureAreas.json5'), 'utf-8')) as FeatureArea[]
  const catalogue = JSON5.parse(readFileSync(resolve(siteRoot, 'src/_data/skillCatalogue.json5'), 'utf-8'))

  const pages: DocsPageRecord[] = walk(docsDir, byExtension('.md')).map((file) => ({
    path: relative(siteRoot, file),
    section: relative(docsDir, file).split('/')[0] ?? '',
    permalink: permalinkOf(readFileSync(file, 'utf-8'))
  }))

  const failures = checkFeatureAreas(areas, catalogueSkillNames(catalogue), pages)
  for (const failure of failures) console.error(`verify-feature-areas: ${failure}`)
  if (failures.length > 0) {
    console.error(`verify-feature-areas: ${failures.length} failure${failures.length === 1 ? '' : 's'}`)
    process.exit(1)
  }
  const claimed = areas.flatMap(pagesOf).length
  console.log(
    `verify-feature-areas: ${areas.length} areas, ${claimed} page${claimed === 1 ? '' : 's'} claimed, ${pages.length} docs pages read`
  )
}

if (import.meta.main) main()
