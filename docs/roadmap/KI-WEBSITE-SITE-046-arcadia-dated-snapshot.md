---
id: KI-WEBSITE-SITE-046
area: SITE
title: Chart Arcadia's public islands from a dated snapshot
kind: deliver
purpose: capability
project: website
horizon: now
status: done
blocks: []
blocked_by: []
baseline_ref: 5bbe214693c4f2974386e04650d2360ce4e9824e
created_at: 2026-10-19T10:30:00Z
updated_at: 2026-10-19T11:00:00Z
---

## Goal

`/arcadia/` shows Arcadia's public islands under the chart, each with its role, the concern it owns and a link to its repository, stamped with the date they were charted. This is GDR-KI-DESIGN-031: a dated snapshot, public islands only, stamped "Charted `YYYY-MM-DD`", never claiming to be live.

## Context

Until now the page was illustrative: the chart and the districts list, with nothing drawn from the territory itself. Knowledge Islands Principal, the Capital, owns the territory's inventory twice over: the ordered roster in `territory_members` under `[skills.ki-repo]` in its `.ki.toml`, and the role table under "Internal inventory" in `Admin/Governance/Known Lands.md`. Known Lands states that the two agree. The site's own `projects.json5` was not a fit: it is the editorial catalogue behind `/projects/`, it carries no roles, and it leaves out public islands such as `ki-design`.

What changed:

- **Sync.** `bun run --cwd apps/site sync:arcadia` reads both files at the HEAD of a clean local `ki-principal` checkout, using `git show`. It refuses to run if they disagree or if the Capital is not given the role Capital. It then asks GitHub for each repository anonymously and keeps only those it shows to a stranger. 200 is public and 404 is not; any other answer stops the sync. The snapshot, `apps/site/src/_data/arcadiaSnapshot.json5`, records the commit, the charted date and each public island's name, repository, role and concern, Capital first and then in roster order. It records nothing about the repositories it dropped.
- **Page.** Under the districts, `/arcadia/` lists the islands with the Capital glyph for `ki-principal` and the island glyph for the rest, headed "The islands" and stamped "Charted 2026-10-19". The roles and concerns are Known Lands' own words. The page cites both files at the snapshot's commit.
- **Gates.** `verify:provenance` holds the snapshot to the cited commit for both files. The second file is declared as the snapshot's `roster`. The gate also refuses a charted date that is malformed or in the future. The sources footer now encodes spaces in a cited path, so the link to `Known Lands.md` resolves.

## Boundary

The snapshot is taken by the sync and committed, not taken during the build. The decision says "at build time"; this reading keeps `apps/site/dist/` reproducible and offline, as the provenance guide requires of every vendored file. The page stamps the date the chart was drawn, which is what the decision asks readers to be told.

Not included: drawing the islands onto the hex chart. The chart is `ki-design`'s drawing of Arcadia's districts, not of its repositories, and placing nineteen islands on it is a design question for `ki-design`. The list beside the chart stands until then. Follow-up: when `ki-design` gives islands a place on the map, render the same snapshot as a chart layer.

Not included: other territories, private repositories, and anything from the wider estate. The sync reads only the Capital's internal inventory.

## Current state

Done. Every gate passes, and the change is committed and pushed to `main`.

## Steps

- [x] Write `sync:arcadia` with strict parsers, roster–inventory reconciliation, the anonymous visibility check and tests.
- [x] Chart the snapshot at `ki-principal` `df270aa`: 19 public islands of 21 members.
- [x] Render the islands and the stamp on `/arcadia/` and cite both files.
- [x] Extend `verify:provenance` to the snapshot, its roster and its charted date.
- [x] Check axe in light, OS dark and forced night, and check for horizontal scroll at 390 px.
- [x] Commit the ledger advance on its own, then this change.

## Files touched

- `apps/site/scripts/sync-arcadia-snapshot.ts` with its test, `apps/site/scripts/verify-provenance.ts`, `apps/site/package.json`
- `apps/site/src/_data/arcadiaSnapshot.json5`, `apps/site/src/arcadia/index.njk`, `apps/site/src/_includes/partials/sources.njk`, `apps/site/src/assets/css/main.css`
- `docs/guides/developer/page-provenance.md`
- `docs/roadmap/_ISSUES.md` and this record

## Verify

```bash
bun run ki:site:clean && bun run ki:site:build   # every verify:* gate passes
bun run --cwd apps/site test
bun run self:typecheck
bunx @biomejs/biome check
```

Then open `/arcadia/` in light, OS dark and forced night. The islands sit under the districts with "Charted" and the snapshot's date, and no private repository appears.

## Dependencies / blocks

`ki-principal` owns the roster and the roles. When either changes, re-run `sync:arcadia` and advance both cited refs and `reviewed` dates on `/arcadia/` in the same change.

## Documentation impact

### Decision Records

None needed here. GDR-KI-DESIGN-031 decides the snapshot, and GDR-KI-WEBSITE-002 and ADR-KI-WEBSITE-001 decide vendoring.

### Specifications

None.

### Guides

`docs/guides/developer/page-provenance.md` lists the snapshot as vendored and explains the anonymous visibility check.

### Roadmap

None.
