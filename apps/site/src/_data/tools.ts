/**
 * The released command-line tools, derived from the one project registry.
 *
 * Tools used to live in their own `tools.json5`, which gave the site two
 * registries describing the same kind of thing and, downstream of that, two
 * indistinguishable sections. They are now `kind: 'tool'` entries in
 * `projects.json5` carrying release and install fields (KI-WEBSITE-SITE-020).
 *
 * This view exists because several templates ask a narrower question than
 * "what are the projects" — `redirects.njk` generates one `/install/<slug>`
 * line per tool, and the projects index answers "what can I install today".
 * It is a projection of the registry, never a second declaration.
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import JSON5 from 'json5'

interface RegistryEntry {
  kind: string
}

const registryPath = resolve(dirname(fileURLToPath(import.meta.url)), 'projects.json5')
const projects = JSON5.parse(readFileSync(registryPath, 'utf-8')) as RegistryEntry[]

export default projects.filter((project) => project.kind === 'tool')
