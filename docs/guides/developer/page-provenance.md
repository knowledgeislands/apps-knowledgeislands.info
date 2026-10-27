# Page provenance

How every published page records what it was written from, and how a refresh sweep finds the pages whose upstream has moved.

[Deciding what this site publishes](what-to-publish.md) sets out how much of another repository's material the site carries. This guide is the mechanism that makes carrying it safe: the page declares its sources in frontmatter, and a check reads that declaration rather than relying on anyone's memory.

The two are easy to confuse and do different jobs. **Ownership decides what the site says; provenance decides what the site cites.** Since GDR-KI-WEBSITE-002 made carrying the default, the site restates more of what it cites than it used to — so this declaration matters more than it did, not less.

## The problem this solves

The site's derived accounts drift from their sources by design — the drift is the point, because the site is writing for a different reader. What is not acceptable is drift nobody can see. Before this declaration existed, `/projects/ki-agentic-harness/skill-catalogue/` restated harness skill descriptions with nothing recording that fact, so a skill could be renamed upstream and the site would keep describing the old one until a person happened to notice.

The [tool routes](tool-routes.md) contract already solved the same problem for versions: a released tool pins an exact release in the registry, and `verify:routes --network` warns when upstream has published a newer one. Provenance applies that shape to prose.

## The declaration

Every Markdown page under `apps/site/src/docs/` carries a `sources` key in its frontmatter. The sections hold different things — [the ki CLI and harness guides](docs-sections.md), the model prompting guides, and a page about the reader's own machine — but provenance does not distinguish them, because moving a page must not be a way to shed its declaration.

```yaml
---
layout: layouts/base.njk
title: Canonical batch records
description: Prepare, bind, and close an exact-set batch authority envelope.
permalink: /projects/ki/batch-records/
sources:
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/batch-records.md
    ref: v0.4.0
    governs: 'The envelope mechanics and the authority ki batch does not grant'
    reviewed: '2026-09-21'
---
```

Quote `governs` and `reviewed`. An unquoted `reviewed` is read as a date by the frontmatter parser and renders as a timestamp; an unquoted `governs` containing a colon is ambiguous.

| Field | Meaning |
| --- | --- |
| `repository` | The `owner/repo` that owns the upstream document. Use this **or** `url`, never both. |
| `path` | The upstream document, relative to that repository's root. Required with `repository`. |
| `ref` | The exact tag or 40-character commit the page was written from. Required with `repository`.† |
| `url` | An external source that is not a Knowledge Islands repository — vendor model documentation, a standards body. |
| `title` | The readable name the published table links by. Required with `url`; optional for a repository source, which falls back to `repository/path`. |
| `governs` | What in _this_ page came from that source. One sentence, so a refresh knows which section to re-read. |
| `reviewed` | The ISO date a person last checked this page against that source. |

† A branch name is rejected. `main` moves, so a page claiming to be written from `main` records nothing a sweep can compare against. Tags are preferred where the source repository releases; a commit SHA is the correct choice for a repository that has no tags yet, and several `mcp-*` repositories are in exactly that position.

A page with no upstream — written here, about this ecosystem, restating nothing — declares that explicitly:

```yaml
sources: original
```

This is a claim, not a default. It says someone decided the page has no source, which is different from nobody having filled the field in.

### Vendored pages

A third case sits between the two. A **vendored** page declares its `sources` in the ordinary way but does not restate them: it reproduces an upstream artefact and renders it. Four pages do this today, `/arcadia/` from three.

| Page | Vendors | Sync script | Record |
| --- | --- | --- | --- |
| `/docs/skills/catalogue/` | The harness's generated capability inventory, from its marker-delimited block in `skills/README.md`, with each skill's functional areas from the generator table `skill-functions.ts` at the same commit | `sync-skill-catalogue.ts` → `src/_data/skillCatalogue.json5` | ADR-KI-WEBSITE-001 |
| `/projects/ki/commands/` | The `ki` command inventory, from `man/ki.1` | `sync-cli-commands.ts` → `src/_data/cliCommands.json5` | ADR-KI-WEBSITE-001 |
| `/field-guide/` | The canon and decided entries of the `ki-design` symbol library, from `packages/symbols` | `sync-ki-design.ts` → `src/_data/kiSymbols.json5` | KI-WEBSITE-SITE-044 |
| `/arcadia/` | The chosen Arcadia painting, from `ki-design` `docs/briefs/references/arcadia.png`, as responsive images | `sync-ki-design.ts` → `src/_data/arcadiaPainting.json5` | KI-WEBSITE-SITE-045 |
| `/arcadia/` | Arcadia's public islands with their roles, from `ki-principal` `Admin/Governance/Known Lands.md` and the `.ki.toml` roster, as a dated snapshot | `sync-arcadia-snapshot.ts` → `src/_data/arcadiaSnapshot.json5` | KI-WEBSITE-SITE-046 |
| `/arcadia/` | The islands chart: that snapshot drawn as an archipelago by `ki-design`'s renderer, `packages/hexmap/src/archipelago.ts` | `sync-ki-design.ts` → `src/_data/arcadiaArchipelago.json5` and two SVGs | KI-WEBSITE-SITE-047 |

The Field Guide and `/arcadia/` are hand-built Nunjucks pages rather than prose, so they cannot inherit the provenance footer from the prose layout. `verify:provenance` lists them explicitly, checks their declarations like any Markdown page's, and requires each to include `partials/sources.njk` itself. The same sync also vendors the design system the whole site is drawn in — the token CSS, the glyph sprite, the drawn Arcadia and the logo — each file headed with the `ki-design` commit it came from. It reads a clean local checkout rather than fetching, because the token CSS and the sprite are build outputs of `ki-design`'s own code. The Arcadia painting is the exception to taking the checkout's HEAD: it is chosen art rather than a build output, so the sync reads it from the commit it is pinned to and encodes it into AVIF, WebP and a JPEG fallback, never wider than the source. Its manifest records that the painting is generated reference art whose licence is still to be recorded:

```bash
bun run --cwd apps/site sync:design   # reads ../ki-design beside this repository; pass --from <path> for another checkout
```

The islands under the chart on `/arcadia/` are a **dated snapshot** (GDR-KI-DESIGN-031). `sync:arcadia` reads the territory roster and the Known Lands role table from a clean local `ki-principal` checkout at its HEAD, refuses to run if the two disagree, and keeps only the repositories GitHub shows to an anonymous visitor. It asks without a token, because a token would show private repositories, and it stops on any answer other than 200 or 404. The snapshot records the commit and the date it was charted, and names nothing it dropped. The page prints that date as "Charted `YYYY-MM-DD`", so it never claims to be live. `verify:provenance` holds both files to the cited commit and refuses a charted date in the future:

```bash
bun run --cwd apps/site sync:arcadia   # reads ../ki-principal beside this repository; pass --from <path> for another checkout
```

The islands chart above that list is the snapshot drawn, not a second copy of it. `sync:design` loads `ki-design`'s archipelago renderer from the checkout, so that checkout needs its dependencies installed (`bun install` in `ki-design`). It draws the committed snapshot in two layouts and records the renderer's commit and the snapshot it drew in `src/_data/arcadiaArchipelago.json5`. The page cites the renderer at that commit like any vendored source. `verify:provenance` also holds the chart to the snapshot: the manifest's snapshot ref, charted date and island list must match the snapshot, and each SVG's header and islands must match the manifest. Re-charting the islands is therefore two steps, `sync:arcadia` and then `sync:design`, and a build between them fails.

These syncs follow the same shape, and the next one should too: fetch the upstream artefact at an immutable ref, parse it strictly, write a generated data file carrying its own provenance header, and render that file from a page whose prose is still the site's own. Regeneration replaces the inventory and never the framing around it.

Vendoring is the right answer only where the upstream artefact is itself an inventory the site would add nothing by rewording — an inventory reworded is still an inventory, and it ages with every release. Most guidance is not like that, and [the ownership test](what-to-publish.md#the-test) still decides.

**The two cases are not equally safe, and the difference is worth stating.** The catalogue vendors a _specified_ interface: `ki-repo-harness` names the markers, normatively fixes the fields, and the harness's own rubric tests assert them, so the site consumes a contract someone maintains. The command reference vendors a _published_ one: `man/ki.1` ships with every release and is complete, but nothing names it an interface and no upstream test asserts its shape.

Where the interface is only published, the parser carries the weight a contract would have carried. It throws on any construct it does not recognise, on a missing purpose or description, on a duplicate, and on a total below a structural floor — because an inventory that silently loses half its commands is worse than one that refuses to build, and nobody would notice the first. Where the manual's own two inventories disagree, the sync reconciles them and the page publishes the discrepancy rather than inheriting it. And the handoff asking for a real contract is recorded rather than assumed: `KI-TOOL-KI-CLI-080` in `tools-ki`.

Refresh a vendored page by re-running its sync at a new ref and advancing the declared `ref` and `reviewed` in the same change:

```bash
bun run --cwd apps/site sync:skills -- --ref <tag-or-commit>
bun run --cwd apps/site sync:cli    -- --ref <tag-or-commit>
```

The skill catalogue sync also accepts an explicit local repository, with the same mandatory immutable `--ref`:

```bash
bun run --cwd apps/site sync:skills -- --ref <tag-or-commit> --from /absolute/path/to/ki-agentic-harness
```

`--from` resolves from the command's working directory (`apps/site` with the command above), so supply a path from there or an absolute path. It reads `skills/README.md` and the existing `skill-functions.ts` source from Git blobs at that exact ref, ignoring dirty working files. A missing ref or blob fails the sync, including in a partial clone; local mode never fetches or falls back to GitHub. Omit `--from` to keep the existing GitHub route. Both routes retain the same parsers, snapshot payload and provenance.

The snapshot's ref and the page's declared ref must agree, and the check **fails** when they do not — offline, unlike everything else in this guide. Upstream moving is not the site's fault and warns; the site citing one ref while publishing another is the site contradicting itself, and no amount of upstream good behaviour will fix it.

Nothing is fetched during a build. `apps/site/dist/` has to be reproducible, so a build that reached the network would depend on when it ran.

## Publishing the declaration

The frontmatter is not an internal note. The prose layout, `src/_includes/layouts/page.njk`, ends every page it renders with

```njk
{% include "partials/sources.njk" %}
```

which renders the `sources` list as a provenance footer, linking each repository source at its pinned ref. A page declaring `sources: original` renders nothing.

The check requires that include, and requires it of the layout rather than of each page. A citation readers cannot see is not a citation, and a hand-written table beside the frontmatter declaration is two records that will disagree — which is the failure the whole mechanism exists to prevent. The prompting guides once carried exactly that hand-written table; it is now generated from the same declaration the sweep reads.

It renders as a footer rather than as a `## Sources` heading. As a heading it was the last section of nearly every page, which made a table of links into other repositories read as the page's conclusion rather than as its provenance (KI-WEBSITE-SITE-024). The declaration is unchanged and still complete; only its weight on the page is.

## The sweep

```bash
bun run --cwd apps/site verify:provenance            # declaration shape only
bun run --cwd apps/site verify:provenance -- --network  # additionally compare each ref against upstream
```

Offline, the check confirms that every published page declares `sources`, that entries carry a usable shape, that `repository` entries name a `knowledgeislands` repository and pin an immutable ref, and that `reviewed` is a real date that is not in the future.

With `--network`, it asks the question a page can act on. A source pinned to a release tag is compared against the repository's newest release: if a later one exists, a refresh is owed and the warning names it. If the page already cites the newest release, nothing is reported — upstream commits made since that tag are unreleased, so there is nothing to refresh to, and a warning in that state would fire from the moment upstream merged anything and never clear. A source pinned to a commit has no release to compare against, so it is compared against the upstream default branch instead. Those are reported as **warnings, not failures**, for the same reason tool-route drift is: an upstream repository editing its own guide must never break this site's build. The warning says a refresh is owed, and refusing to publish until someone performs it would punish the wrong repository.

`verify:provenance` runs as part of `bun run ki:site:build`, so a page cannot reach `dist/` without a declaration.

### What a clean sweep does not prove

Two limits are deliberate, and they are written down because a check that reports success is the hardest kind to distrust.

**A repository whose newest artefact is a prerelease is reported as current.** The release comparison asks GitHub for the newest _non-prerelease_ release, so a page pinned to the newest stable tag is told nothing while a prerelease sits above it. That is the intended answer: the site recommends what an upstream repository stands behind, and a prerelease is by definition not that. A page that wants to cite a prerelease may still pin one, and such a page is not compared against the release list at all — comparing it would report an older stable tag as the refresh owed, which is a refresh backwards. It falls through to the file comparison instead.

**A commit pin is compared against the upstream default branch, and that is the right question for it.** The comparison is per file: it reports that the exact document the page cites has changed, which a commit pin can always act on by advancing to a newer commit. It is not the permanently-unclearable warning a tag pin would get from the same comparison, because there is always something newer to pin to. One source on this site is pinned to a commit, and it warns exactly when that file moves.

GitHub allows unauthenticated callers sixty requests an hour, and a full `--network` sweep resolves more than that. Set `GITHUB_TOKEN` (`GITHUB_TOKEN="$(gh auth token)"`), or `GH_TOKEN`, to lift the limit. Every site script that reaches GitHub - the network gates and the `sync:*` tools alike - resolves the token, its `User-Agent` and its refusal message through one client, `apps/site/scripts/lib/github.ts`, which sends the token only to GitHub-owned hosts. Without a token, the provenance sweep stops its remaining network checks at the first refusal and says so, and a sync tool stops with the same sentence; a refusal is never reported as a missing document, because "GitHub declined to answer" and "the upstream deleted it" are different facts and only one of them is worth acting on.

## Links the prose makes

A page also links upstream documents it never restated — an ADR it points a reader at, a guide it defers to. Those are not `sources`, and until the sweep looked at them nothing did. Two links sat published against documents the harness had deliberately removed: a retirement guide deleted in August, and a skills diagram replaced by a written guide three days later. Both were found by hand, which is not a mechanism.

So `--network` also extracts every `https://github.com/knowledgeislands/<repo>/blob/<ref>/<path>` link from each page's body and resolves it. Links inside inline code count — a page quoting what `ki manage docs manual` prints is making the same promise to the reader as a Markdown link. Identical targets are resolved once however many pages carry them.

An unresolvable link is a **warning**, on the same reasoning as drift: an upstream repository retiring its own document must not break this site's build. The warning names every page carrying the link, because a retired document is usually cited from more than one.

Unlike `sources`, a prose link may point at `main`. A reader following a link wants the current document, and pinning prose links would freeze a reader's view of a living repository at whatever ref the page was last revised — the opposite of what the link is for. The check resolves whatever ref the link names.

## Refreshing a page

1. Run the sweep with `--network` and take the reported pages.
2. Read the upstream document at the new ref against the `governs` sentence — that sentence exists to stop this step becoming a full re-read.
3. Revise the site's prose where the change matters **to this site's reader**. Most upstream changes will not. Deciding that a change does not warrant a revision is a real outcome, not a skipped step.
4. Advance `ref` and `reviewed` together. Advancing `reviewed` without `ref` records a review of a source you did not look at; advancing `ref` without `reviewed` claims a review that did not happen.

Step 3 is where restating earns its keep. If every upstream change forced a matching edit here, the page would be a copy, and [the ownership test](what-to-publish.md#the-test) would have told you to link to it instead.

## What this does not cover

Provenance records where prose came from. It makes no promise that the upstream document is correct, that a pinned source still exists at `main`, or that its repository is public — the [projects directory](projects-directory.md) rules on publicity still apply, and a page must not cite a source no reader can open. A private repository can be an honest source for the site's understanding, but it cannot be a published citation.
