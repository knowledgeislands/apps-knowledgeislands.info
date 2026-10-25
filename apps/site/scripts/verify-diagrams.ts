/** Refuse unresolved figures, stale site viewers and vendored figures cited at a different ref. */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { relative, resolve } from 'node:path'
import {
  diagramSkill,
  harnessRepository,
  repositoryRoot,
  siteManifest,
  siteRoot,
  type VendoredDiagrams,
  vendoredManifest
} from './lib/diagrams.ts'
import { readFrontmatter } from './lib/frontmatter.ts'
import { byExtension, walk } from './lib/walk.ts'

/** Literal shortcode calls are the authoring interface; fenced examples are not embeddings. */
export function figureSlugs(markdown: string): string[] {
  const body = readFrontmatter(markdown).body.replace(/^(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\1[ \t]*$/gm, '')
  const calls = [...body.matchAll(/{%[-]?\s*figure\b([\s\S]*?)[-]?%}/g)]
  return calls.map((call) => {
    const slug = call[1].match(/^\s*(["'])([a-z0-9]+(?:-[a-z0-9]+)*)\1\s*,/)
    if (!slug) throw new Error('figure requires a literal slug and caption')
    return slug[2]
  })
}

export function checkPage(
  path: string,
  markdown: string,
  siteSlugs: ReadonlySet<string>,
  vendored: VendoredDiagrams
): string[] {
  const failures: string[] = []
  const frontmatter = readFrontmatter(markdown)
  const block = frontmatter.kind === 'block' ? frontmatter.block : ''
  // Read each source independently: a ref on a tools-ki entry cannot satisfy a harness citation.
  const sources = block.match(/^sources:\s*\n((?:[ \t]+[^\n]*\n?)*)/m)?.[1] ?? ''
  const entries = sources.split(/^ {2}- /m).slice(1)
  const unquote = (value: string) => value.trim().replace(/^(['"])(.*)\1$/, '$2')
  const matchingSource = entries.some((entry) => {
    const fields = Object.fromEntries(
      [...entry.matchAll(/^\s*([a-z]+):\s*([^\n]+)$/gm)].map((match) => [match[1], unquote(match[2])])
    )
    return fields.repository === harnessRepository && fields.ref === vendored.source.ref
  })
  for (const slug of figureSlugs(markdown)) {
    const isSite = siteSlugs.has(slug)
    const isVendored = !!vendored.diagrams[slug]
    if (!isSite && !isVendored) failures.push(`${path}: unknown figure ${slug}`)
    if (isSite && isVendored) failures.push(`${path}: ambiguous figure ${slug}`)
    if (isVendored && !matchingSource)
      failures.push(`${path}: ${slug} requires a harness source at ${vendored.source.ref}`)
  }
  return failures
}

export function verifyDiagrams(root = repositoryRoot): string[] {
  const site = resolve(root, 'apps/site')
  const manifest = siteManifest(root)
  const vendored = vendoredManifest(site)
  const failures: string[] = []
  if (vendored.source.repository !== harnessRepository || !/^[a-f0-9]{40}$/.test(vendored.source.ref))
    failures.push('Invalid vendored diagram source')
  for (const [slug, entry] of Object.entries(manifest)) {
    if (entry.svg_form !== 'ki' || entry.commit_html !== true)
      failures.push(`${slug}: website diagrams require ki SVG and committed HTML`)
    for (const name of [`${slug}.${entry.type}.json`, `${slug}.svg`, `${slug}.html`, `${slug}.receipt.json`]) {
      if (!existsSync(resolve(root, 'docs/diagrams', name))) failures.push(`${slug}: missing ${name}`)
    }
  }
  for (const [slug, entry] of Object.entries(vendored.diagrams)) {
    for (const name of [entry.svg, entry.html, entry.receipt]) {
      if (!existsSync(resolve(site, 'src/assets/diagrams/vendored/ki-agentic-harness', name)))
        failures.push(`${slug}: missing vendored ${name}`)
    }
  }
  for (const file of walk(resolve(site, 'src/docs'), byExtension('.md'))) {
    try {
      failures.push(
        ...checkPage(relative(site, file), readFileSync(file, 'utf8'), new Set(Object.keys(manifest)), vendored)
      )
    } catch (error) {
      failures.push(`${relative(site, file)}: ${String(error)}`)
    }
  }
  // The canonical receipt checker validates source and HTML hashes, not merely file presence.
  try {
    execFileSync('bun', [resolve(diagramSkill(), 'scripts/build-html.ts'), '--repo', root, '--check'], {
      encoding: 'utf8',
      stdio: 'pipe'
    })
  } catch (error) {
    failures.push(`build-html --check: ${String(error)}`)
  }
  return failures
}

if (import.meta.main) {
  const failures = verifyDiagrams()
  for (const failure of failures) console.error(`verify-diagrams: ${failure}`)
  if (failures.length) process.exitCode = 1
  else
    console.log(
      `verify-diagrams: site receipts and figures in ${relative(siteRoot, resolve(siteRoot, 'src/docs'))} checked`
    )
}
