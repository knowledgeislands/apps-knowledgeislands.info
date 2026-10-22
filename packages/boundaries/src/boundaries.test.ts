/**
 * The dependency boundaries in `.dependency-cruiser.ts`, cruised over the site workspace and proven able to fail.
 *
 * A boundary checker fails open. Every rule matches on resolved paths, so a cruise that resolves nothing satisfies all
 * of them and prints a clean run. Here that is the default rather than a risk: dependency-cruiser reads TypeScript
 * through the compiler API and supports `typescript@>=2 <7`, and the repository is on TypeScript 7, so against the
 * repository's own install it cruises zero modules and reports zero violations. The cruise therefore runs through the
 * install root at `tooling/depcruise`, which holds a TypeScript it can drive, and this suite checks the graph — a
 * module floor, a type-only edge, a resolved crossing between layers — before it believes the violation count, then
 * cruises a fixture of deliberate crossings and expects each named rule to trip.
 *
 * It is its own Vitest workspace because the site's suites run under `bun test`, and the boundary proof needs one
 * bare `vitest run` entrypoint. It cruises the site from outside that workspace, so its `turbo.json` names the site's
 * sources, the ruleset and the tooling root as inputs.
 */

import { execFile } from 'node:child_process'
import { existsSync, readdirSync } from 'node:fs'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { promisify } from 'node:util'
import { afterAll, beforeAll, describe, expect, test } from 'vitest'

const execute = promisify(execFile)

const ROOT = resolve(import.meta.dirname, '..', '..', '..')

/** The checker's own install root, outside the repository's dependency tree; nothing else resolves it. */
const TOOLING = join(ROOT, 'tooling', 'depcruise')
const CHECKER = join(TOOLING, 'node_modules', '.bin', 'depcruise')

/** Every source root of the site workspace, and this proof's own; a root left out is a boundary nothing checks. */
const SOURCE_ROOTS = [
  'apps/site/eleventy.config.ts',
  'apps/site/src',
  'apps/site/scripts',
  'apps/site/types',
  'packages/boundaries/src'
]

/**
 * The fewest site modules a cruise may report and still count as having read the workspace. A cruise that reads
 * nothing reports 0, and one that reads only what it recognises reports a plausible fraction. The workspace holds about
 * 24 modules today.
 */
const MODULE_FLOOR = 20

interface Dependency {
  readonly module: string
  readonly resolved: string
  readonly couldNotResolve: boolean
  readonly dependencyTypes: readonly string[]
}

interface Module {
  readonly source: string
  readonly dependencies: readonly Dependency[]
}

interface Violation {
  readonly from: string
  readonly to: string
  readonly rule: { readonly name: string }
}

interface Cruise {
  readonly modules: readonly Module[]
  readonly summary: { readonly violations: readonly Violation[] }
}

interface Transpiler {
  readonly name: string
  readonly version: string
  readonly available: boolean
}

/** Run a command to completion and return what it printed, or throw whatever it said instead. */
const output = async (command: string, args: readonly string[], cwd: string): Promise<string> => {
  let text: string
  let status = 0
  let error = ''
  try {
    text = (await execute(command, [...args], { cwd, maxBuffer: 16 * 1024 * 1024 })).stdout
  } catch (failure) {
    // depcruise exits non-zero when it finds a violation, which the deliberate crossings below rely on, so the exit
    // status alone is not a failure: printing nothing is.
    const result = failure as { stdout?: string; stderr?: string; code?: number }
    text = result.stdout ?? ''
    status = result.code ?? 1
    error = result.stderr ?? String(failure)
  }
  if (text.trim() === '') throw new Error(`${command} ${args.join(' ')} printed nothing (exit ${status}): ${error}`)
  return text
}

/**
 * Install the tooling root from its lockfile when it is absent, as on a fresh clone or CI runner.
 *
 * An installed checker is never reinstalled: that would replace its binary in place. Whether it is current is asserted
 * below instead, so a stale tooling root fails the suite rather than cruising with whatever happens to be installed.
 */
const installTooling = async (): Promise<void> => {
  if (existsSync(CHECKER)) return
  try {
    await execute('bun', ['install', '--frozen-lockfile'], { cwd: TOOLING })
  } catch (failure) {
    throw new Error(`tooling/depcruise did not install from its lockfile: ${(failure as { stderr?: string }).stderr}`)
  }
}

/** Cruise paths through the tooling root's `depcruise`, from `cwd`, and return the graph it reports. */
const cruise = async (cwd: string, paths: readonly string[]): Promise<Cruise> =>
  JSON.parse(
    await output(CHECKER, ['--config', '.dependency-cruiser.ts', '--output-type', 'json', ...paths], cwd)
  ) as Cruise

/** The parsers dependency-cruiser can drive, asked of the install the cruise runs through. */
const transpilers = async (): Promise<readonly Transpiler[]> =>
  JSON.parse(
    await output(
      'node',
      [
        '--input-type=module',
        '--eval',
        "import { getAvailableTranspilers } from 'dependency-cruiser'; console.log(JSON.stringify(getAvailableTranspilers()))"
      ],
      TOOLING
    )
  ) as readonly Transpiler[]

/** The modules of the site workspace, as opposed to root files and dependency leaves also recorded. */
const siteModules = (graph: Cruise): readonly Module[] =>
  graph.modules.filter((module) => module.source.startsWith('apps/site/'))

/** The type-only imports the site's own modules make, wherever they land. */
const typeOnly = (graph: Cruise): readonly string[] =>
  siteModules(graph).flatMap((module) =>
    module.dependencies
      .filter((dependency) => dependency.dependencyTypes.includes('type-only') && !dependency.couldNotResolve)
      .map((dependency) => `${module.source} -> ${dependency.module}`)
  )

const manifest = async (path: string) =>
  JSON.parse(await readFile(join(ROOT, path), 'utf8')) as {
    readonly version?: string
    readonly dependencies?: Readonly<Record<string, string>>
    readonly devDependencies?: Readonly<Record<string, string>>
  }

/** The version the tooling lockfile pins for a package, read from its `"name": ["name@version", …]` entry. */
const locked = (lockfile: string, name: string): string | undefined =>
  new RegExp(`"${name}": \\["${name}@([^"]+)"`, 'u').exec(lockfile)?.[1]

/** The major a version specification asks for, ignoring the range operator in front of it. */
const major = (specification: string | undefined): number =>
  Number((specification ?? '').replace(/^\D*/u, '').split('.')[0])

let graph: Cruise
let typescript: Transpiler | undefined

beforeAll(async () => {
  await installTooling()
  const rootFiles = readdirSync(ROOT)
    .filter((name) => name.endsWith('.ts'))
    .sort()
  const [found, cruised] = await Promise.all([transpilers(), cruise(ROOT, [...SOURCE_ROOTS, ...rootFiles])])
  typescript = found.find((transpiler) => transpiler.name === 'typescript')
  graph = cruised
}, 120_000)

describe('the boundary tooling', () => {
  test('drives a TypeScript dependency-cruiser can read', () => {
    // When this fails the cruise below read no TypeScript, and every other assertion in this file is about nothing.
    expect(typescript?.available).toBe(true)
  })

  test('names the same dependency-cruiser as the repository', async () => {
    const [repository, tooling] = await Promise.all([
      manifest('package.json'),
      manifest('tooling/depcruise/package.json')
    ])

    expect(tooling.dependencies?.['dependency-cruiser']).toBe(repository.devDependencies?.['dependency-cruiser'])
  })

  test('is installed at the versions its lockfile pins', async () => {
    const lockfile = await readFile(join(TOOLING, 'bun.lock'), 'utf8')
    for (const name of ['dependency-cruiser', 'typescript']) {
      const installed = await manifest(`tooling/depcruise/node_modules/${name}/package.json`)
      expect(installed.version, `${name} in tooling/depcruise; run bun install there`).toBe(locked(lockfile, name))
    }
  })

  test('is still needed', async () => {
    // When this fails, dependency-cruiser drives the repository's own TypeScript and `tooling/depcruise` can go.
    const refused = Number(/<\s*(\d+)/u.exec(typescript?.version ?? '')?.[1])
    const repository = await manifest('package.json')

    expect(major(repository.devDependencies?.typescript)).toBeGreaterThanOrEqual(refused)
  })
})

describe('the cruise of the site workspace', () => {
  test('reads the repository it is checking', () => {
    expect(siteModules(graph).length).toBeGreaterThanOrEqual(MODULE_FLOOR)
  })

  test('sees type-only imports the compiler would erase', () => {
    // `tsPreCompilationDeps` is on, so a parser reading each module's own imports finds the config's type-only import
    // of Eleventy, and one that reads only the compiler's emit sees nothing. No site layer yet imports another only for
    // types, so the deliberate crossing below proves a type-only edge between layers is seen and refused.
    expect(typeOnly(graph)).toContain('apps/site/eleventy.config.ts -> @11ty/eleventy')
  })

  test('resolves a command reaching a shared helper to the real module', () => {
    const command = graph.modules.find((module) => module.source === 'apps/site/scripts/verify-provenance.ts')
    const helper = command?.dependencies.find((dependency) => dependency.module === './lib/github.ts')

    expect(helper?.couldNotResolve).toBe(false)
    expect(helper?.resolved).toBe('apps/site/scripts/lib/github.ts')
  })

  test('finds no violation', () => {
    expect(
      graph.summary.violations.map((violation) => `${violation.rule.name}: ${violation.from} -> ${violation.to}`)
    ).toEqual([])
  })
})

/**
 * A fixture of the site's layers, each probe crossing exactly one stated boundary. It lives in a temporary directory
 * with a copy of the ruleset, so the real tree is never written; its `tsconfig.json` extends the repository's by
 * absolute path with its own `include`, because a copied root config whose patterns match nothing fails before any
 * rule runs.
 */
const FIXTURE: Readonly<Record<string, string>> = {
  // The layers the probes reach into.
  'apps/site/src/_data/site.ts': 'export const site = {}\n',
  'apps/site/scripts/verify-projects.ts': 'export const projects = 0\n',
  'apps/site/scripts/verify-reachable.ts': 'export const reachable = 0\n',
  'apps/site/scripts/lib/walk.ts': 'export const walk = (): readonly string[] => []\n',
  'apps/site/scripts/lib/walk.test.ts': 'export const suite = 0\n',
  // The build reaching a helper, for types only: erased at run time, refused all the same.
  'apps/site/src/probe-build.ts': "import type { walk } from '../scripts/lib/walk.ts'\nexport type Walk = typeof walk\n",
  // A helper reaching up into a command.
  'apps/site/scripts/lib/probe-floor.ts': "export { reachable } from '../verify-reachable.ts'\n",
  // A helper reaching across into the build's data.
  'apps/site/scripts/lib/probe-build.ts': "export { site } from '../../src/_data/site.ts'\n",
  // A command importing another command.
  'apps/site/scripts/probe-command.ts': "export { projects } from './verify-projects.ts'\n",
  // A command importing a suite.
  'apps/site/scripts/probe-suite.ts': "export { suite } from './lib/walk.test.ts'\n",
  // A cycle, a value edge each way so it survives to run time.
  'apps/site/scripts/lib/probe-cycle-a.ts': "import './probe-cycle-b.ts'\n",
  'apps/site/scripts/lib/probe-cycle-b.ts': "import './probe-cycle-a.ts'\n"
}

const CROSSINGS = [
  ['the-build-does-not-run-the-commands', 'apps/site/src/probe-build.ts', 'apps/site/scripts/lib/walk.ts'],
  ['commands-verify-the-build-independently', 'apps/site/scripts/lib/probe-build.ts', 'apps/site/src/_data/site.ts'],
  ['helpers-are-the-floor', 'apps/site/scripts/lib/probe-floor.ts', 'apps/site/scripts/verify-reachable.ts'],
  ['commands-share-only-through-helpers', 'apps/site/scripts/probe-command.ts', 'apps/site/scripts/verify-projects.ts'],
  ['product-does-not-import-suites', 'apps/site/scripts/probe-suite.ts', 'apps/site/scripts/lib/walk.test.ts']
] as const

describe('a deliberate crossing', () => {
  let fixture: string
  let crossed: Cruise

  beforeAll(async () => {
    fixture = await mkdtemp(join(tmpdir(), 'ki-website-boundaries-'))
    await writeFile(join(fixture, '.dependency-cruiser.ts'), await readFile(join(ROOT, '.dependency-cruiser.ts')))
    await writeFile(
      join(fixture, 'tsconfig.json'),
      JSON.stringify({ extends: join(ROOT, 'tsconfig.json'), include: ['**/*.ts'], exclude: [] })
    )
    for (const [path, text] of Object.entries(FIXTURE)) {
      await mkdir(dirname(join(fixture, path)), { recursive: true })
      await writeFile(join(fixture, path), text)
    }
    crossed = await cruise(fixture, ['apps'])
  }, 120_000)

  afterAll(async () => {
    if (fixture) await rm(fixture, { recursive: true, force: true })
  })

  test('is seen as a type-only edge where it imports only types', () => {
    expect(typeOnly(crossed)).toContain('apps/site/src/probe-build.ts -> ../scripts/lib/walk.ts')
  })

  test('trips no-circular on a cycle', () => {
    expect(
      crossed.summary.violations.some(
        (violation) =>
          violation.rule.name === 'no-circular' && violation.from.startsWith('apps/site/scripts/lib/probe-cycle-')
      )
    ).toBe(true)
  })

  test.each(CROSSINGS)('trips %s', (rule, from, to) => {
    const source = crossed.modules.find((module) => module.source === from)
    expect(source?.dependencies).toContainEqual(expect.objectContaining({ resolved: to, couldNotResolve: false }))
    expect(
      crossed.summary.violations
        .filter((violation) => violation.from === from && violation.to === to)
        .map((violation) => violation.rule.name)
    ).toContain(rule)
  })
})
