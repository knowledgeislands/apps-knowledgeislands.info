# AGENTS.md — Knowledge Islands Website

Always-loaded orientation for an agent working in this repo, whichever runtime you are. The full picture is in [README.md](README.md); this file is the short anchor.

## What this repo is

The public-facing **Knowledge Islands** website — a static site built with the house web stack: **Eleventy 3 + Nunjucks + Markdown, TypeScript run natively on Bun, Tailwind 4 (config-less, semantic design tokens)** — compiled to a portable `dist/` that can be served from any root.

## Working here

- **The neutral website seam** follows `ki-repo-website`: the root exposes the `ki:site:build`, `ki:site:dev`, and `ki:site:clean` lifecycle and the site emits a reproducible `apps/site/dist/`.
- **The content implementation** follows `ki-repo-website-content` — the Eleventy/Nunjucks/Tailwind layout, the `src/_includes/{layouts,partials}/` structure, `tokens.css` design tokens, the portable-`dist/` URL transform, and SEO. Run `ki repo audit --skill ki-repo-website-content --repo .` before shipping a structural change.
- **The toolchain** (package.json scripts, `tsconfig`, `biome`) follows `ki-engineering`; `ki repo audit --skill ki-engineering --repo .` is the gate. The per-tool `ki:lint:*` script family was retired by `ADR-KI-HARNESS-TOOLCHAIN-001`; those checks now resolve through the native rubric, and `ki:deps:update` is the one script-seam exception.
- **Published guidance** restates material other repositories own, so every page declares its upstream `sources` in frontmatter and publishes them through `partials/sources.njk`. `verify:provenance` gates the declaration during `ki:site:build`; see [docs/guides/developer/page-provenance.md](docs/guides/developer/page-provenance.md).
- **Everything that teaches lives in a Docs section**, at `apps/site/src/docs/<section>/<page>.md`, bound by the directory data file beside it rather than by its own frontmatter and declared in `apps/site/src/_data/docsSections.json5`. `/projects/` is the catalogue of what exists, not where its guides live. `verify:docs` gates the shape — a unique reading position, an opening claim, and no link text that hands the reader off to a repository; see [docs/guides/developer/docs-sections.md](docs/guides/developer/docs-sections.md).
- **Markdown / TOML style** follows `ki-authoring`; `ki repo audit --skill ki-authoring --repo .` is the mechanical Markdown gate.
- **The repo shape** is a **monorepo** (`ki-engineering` §0): the root `package.json` declares `"workspaces": ["packages/*", "apps/*"]` and the site lives in the canonical `apps/site` workspace (`apps/site/eleventy.config.ts`, `apps/site/src/`, `apps/site/tsconfig.json`). The site's dependency boundaries are stated in `.dependency-cruiser.ts`, cruised through the isolated checker install at `tooling/boundaries/`, and proved able to fail by the Vitest workspace `packages/boundaries/`; the site's own suites stay on `bun test`. The generated output is `apps/site/dist/`; root site scripts carry the `ki:site:` prefix and delegate through Turborepo, which owns the task graph (`turbo.json`).
- **Hosting** follows `ki-repo-website-cloudflare` (Workers Static Assets serving `apps/site/dist/`); `wrangler.jsonc` lives in `apps/site/` (`assets.directory: "dist"`), and the `ki:site:deploy` / `ki:site:preview` / `ki:site:clean` scripts are the entry points.
- **A bulk rewrite never touches `docs/roadmap/`.** A `sed` run across tracked files — a URL map, a filename rename, any of them — also rewrites what `docs/decisions/` and `docs/roadmap/` quote, and those are historical statements of what an address or a filename was at the time. Rewriting them falsifies the record rather than updating it: a rename sweep once left `KI-WEB-SITE-031` arguing in its own Context that `what-to-publish.md` should be renamed to `what-to-publish.md`. Decision records are living present-state documents and do want repointing; roadmap records do not. Scope the file list deliberately, and read `git diff --stat -- docs/` before staging.

## Toolchain

[Bun](https://bun.sh) for install/dev.

```bash
bun install         # install deps and wire the husky pre-commit hook
bun run ki:site:dev    # Tailwind watch + Eleventy serve on http://localhost:3000
bun run ki:site:build  # compile the site to dist/
ki repo audit --skill ki-engineering --repo .  # toolchain gate: Biome, TypeScript, scripts
ki repo audit --skill ki-authoring --repo .  # rumdl check for authored Markdown
bun run --cwd apps/site verify:provenance -- --network  # report published pages whose upstream has moved
```

## Which rubric an audit resolved

`ki repo audit` checks this repository against the rubric of whichever harness `ki` resolves, and a contributor's terminal and CI can resolve different ones. CI links `tools-ki` `main` from source and audits against its canonical harness pin, `canonicalHarnessRelease` in `src/core/storage/registry.ts`; the job log prints the `KI source commit`, and its `ki bootstrap` step prints the canonical harness archive digest. Locally, `ki diag --full` shows each harness under `locals` with `mode: on` when it resolves a moving checkout and `off` when it resolves the verified archive. When CI fails a rule that passes locally, compare the two before changing the repository: a harness rule newer than the `tools-ki` pin is checker drift, owed to `tools-ki` as a pin bump, not a defect to work around here (`KI-WEB-SITE-041`).

## Progress and commits

- Give concise progress updates at meaningful checkpoints and at least every few minutes during sustained work.
- Commit only a completed, verified unit of work. Stage explicit paths for that unit and do not combine it with unrelated working-tree changes.
- If a unit cannot yet be verified, report the checkpoint and leave it uncommitted until its verification is complete.

## Cross-repository choreography

- Arcadia Principal, the KI Agentic Harness, `tools-ki`, KI Specifications, the KI Website, the Techne Harness, and `tools-techne` may add a concrete handoff item to one another's Stream or roadmap. The receiving repository owns its priority, plan, and execution.
- A handoff names the originating repository, states the need in plain terms, and says in plain words whether it blocks work there. Link only durable documentation, such as guides, specifications or manifests; never link to or cite another repository's roadmap record or its identifier, because records are pruned and such links break.
- Prefer independently executable, non-blocking work. Mark an item as blocking only when it is a genuine prerequisite; otherwise let the receiving repository schedule it in its own horizon.
