/**
 * The dependency boundaries of the site workspace, enforced rather than described.
 *
 * `apps/site` has three layers with different lifetimes. The Eleventy build — `eleventy.config.ts` and the data
 * modules under `src/` — turns committed content into `dist/`. The commands under `scripts/` run around that build:
 * the `verify-*` gates check what it produced, and the `sync-*` commands refresh the vendored data it reads. The
 * helpers under `scripts/lib/` are what those commands share. Each rule below keeps one of those directions honest.
 *
 * The rules are cruised by `packages/boundaries/src/boundaries.test.ts` through the install root at
 * `tooling/depcruise`.
 * dependency-cruiser reads TypeScript through the compiler API and supports `typescript@>=2 <7`; against this
 * repository's TypeScript 7 it would read nothing at all, and an empty graph satisfies every rule here.
 */

import type { IConfiguration } from 'dependency-cruiser'

/** The site workspace, which every rule below governs. */
const site = '^apps/site/'

/** One or more areas of the site workspace, matched as whole directories or files wherever an import lands in them. */
const areas = (...names: readonly ('build' | 'commands' | 'helpers')[]): string =>
  `^apps/site/(${names
    .map(
      (name) =>
        ({
          // The Eleventy configuration and the data modules it loads from src/.
          build: 'eleventy\\.config\\.ts$|src/',
          // The verify-* and sync-* entrypoints the workspace's package scripts invoke.
          commands: 'scripts/[^/]+$',
          // The shared helpers under scripts/lib/.
          helpers: 'scripts/lib/'
        })[name]
    )
    .join('|')})`

/** A suite, which may import the module it tests. */
const testFile = '\\.test\\.ts$'

const config: IConfiguration = {
  forbidden: [
    {
      name: 'no-circular',
      comment:
        'A cycle is two modules disagreeing about which of them is underneath. Move the shared part down a layer.',
      severity: 'error',
      from: {},
      to: { circular: true }
    },

    {
      name: 'no-unresolvable',
      comment:
        'An import that does not resolve is an unchecked import: every rule below matches on resolved paths, so an unresolvable dependency would cross a boundary silently.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true }
    },

    {
      name: 'the-build-does-not-run-the-commands',
      comment:
        'The Eleventy build renders committed content and nothing else. The verify-* and sync-* commands and their helpers reach GitHub, the network and the built dist/, so a build that imports them depends on the network and on its own output. Read what the build needs from src/_data instead.',
      severity: 'error',
      from: { path: areas('build') },
      to: { path: areas('commands', 'helpers') }
    },

    {
      name: 'commands-verify-the-build-independently',
      comment:
        'A verify-* gate checks what the build produced, and a sync-* command refreshes the data the build reads. Importing the build to do either would let a gate share the defect it exists to catch. Read the committed data or the built dist/ from disk instead.',
      severity: 'error',
      from: { path: areas('commands', 'helpers') },
      to: { path: areas('build') }
    },

    {
      name: 'commands-share-only-through-helpers',
      comment:
        'Each verify-* and sync-* command is a separate entrypoint that a package script runs on its own. Logic two commands need belongs in scripts/lib/, so importing one command from another would also run or couple its top-level work.',
      severity: 'error',
      from: { path: areas('commands'), pathNot: testFile },
      to: { path: areas('commands') }
    },

    {
      name: 'helpers-are-the-floor',
      comment:
        'scripts/lib/ is what the commands share, so it depends on none of them. Move what a helper needs down into scripts/lib/.',
      severity: 'error',
      from: { path: areas('helpers') },
      to: { path: areas('commands') }
    },

    {
      name: 'product-does-not-import-suites',
      comment:
        'A suite runs only under the test runner. A shipped module, data file or command that imports one would run its assertions at build or command time.',
      severity: 'error',
      from: { path: site, pathNot: testFile },
      to: { path: testFile }
    }
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    // Read each module's own imports rather than the compiler's emit: a type-only import crosses a boundary as much as
    // a value import does.
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'types', 'bun', 'node', 'default'],
      extensions: ['.ts', '.d.ts', '.js', '.mjs', '.cjs', '.json']
    }
  }
}

export default config
