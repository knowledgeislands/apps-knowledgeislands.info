---
id: KI-WEBSITE-SITE-047
area: SITE
title: Draw Arcadia's public islands as an archipelago chart
kind: deliver
purpose: capability
project: website
horizon: now
status: done
blocks: []
blocked_by: []
baseline_ref: e9f3e7b1ad481ad13ccef733d8cd210914c33a5c
created_at: 2026-10-19T11:40:00Z
updated_at: 2026-10-19T12:00:00Z
---

## Goal

`/arcadia/` draws the islands in its dated snapshot as a chart above the list. This takes up the follow-up KI-WEBSITE-SITE-046 left open. The chart follows GDR-KI-DESIGN-015: a territory is drawn as an archipelago, its islands in one sea region with a tinted border, the Capital at the centre. Each island is linked to its repository.

## Context

`ki-design` now draws a territory from a list of islands: `renderArchipelagoSvg` in `packages/hexmap`. Its layout is deterministic. The Capital sits at the centre as a 7-hex flower and the other islands sit ring by ring in list order. Each island is a small isle with its glyph, its label and a link, and the chart needs no script. Its `auto` theme takes its colours from custom properties that are keyed to the token stylesheet's own selectors, so the chart follows the surface it sits on.

What changed:

- **Sync.** `sync:design` loads the renderer from the `ki-design` checkout and draws the committed snapshot, so the build stays offline. It draws two layouts: a round cluster, and a tall one that a phone can read. Each island is typed by the glyphs that `ki-design`'s maps spec gives single-purpose islands: the Capital glyph for the Capital, the Workshop for a tool, the Causeway for an MCP server and the island glyph otherwise. Each island is titled with its role and concern. `src/_data/arcadiaArchipelago.json5` records the renderer's commit and the snapshot it drew. The re-sync also advanced every other vendored `ki-design` file to that commit, changing only their provenance headers.
- **Page.** "The islands" shows the chart above the list, and CSS picks the layout by width. The list stays as the chart's text equivalent (GDR-KI-DESIGN-032). It now uses the chart's glyphs, so it reads as the chart's key. `/arcadia/` cites the renderer, and both pages now cite the new `ki-design` commit.
- **Gates.** `verify:provenance` holds the manifest to the page's citation. It also holds the chart to the snapshot: the snapshot ref, the charted date and the island list must match, and each SVG's header and islands must match the manifest. Biome now skips the vendored SVGs under `src/_includes/ki-design/`, as it already skips the vendored token CSS.

## Boundary

The islands carry no condition or freshness. The snapshot records neither, and the page must not claim to be live. Positions come from the list order, not from stored positions; `ki-design`'s maps spec leaves stored positions to the territory's `.ki.toml`.

## Current state

Done. Every gate passes, and the change is committed and pushed to `main`.

## Steps

- [x] Add the archipelago renderer, tests and an example to `ki-design` and push it.
- [x] Vendor the chart through `sync:design` with a manifest, and gate it against the snapshot.
- [x] Place the chart above the list, typed and linked, at 390, 1024, 1440 and 2560 px.
- [x] Check axe in light, OS dark and forced night, and check for horizontal scroll at each width.

## Files touched

- `apps/site/scripts/sync-ki-design.ts` with its test, `apps/site/scripts/verify-provenance.ts`, `biome.json`
- `apps/site/src/_data/arcadiaArchipelago.json5`, `apps/site/src/_includes/ki-design/arcadia-archipelago.svg`, `apps/site/src/_includes/ki-design/arcadia-archipelago-tall.svg`
- The other vendored `ki-design` files, which changed only in their provenance headers
- `apps/site/src/arcadia/index.njk`, `apps/site/src/field-guide/index.njk`, `apps/site/src/assets/css/main.css`
- `docs/guides/developer/page-provenance.md` and this record

## Verify

```bash
bun run ki:site:clean && bun run ki:site:build   # every verify:* gate passes
bun run --cwd apps/site test
bun run self:typecheck
bunx @biomejs/biome check
```

Then open `/arcadia/` in light, OS dark and forced night at 390 and 1440 px. The chart sits above the list, and tabbing reaches each island and rings it in gold.

## Dependencies / blocks

`ki-design` owns the renderer, and `ki-principal` owns the roster. After `sync:arcadia`, run `sync:design` in the same change; the build fails until the chart matches the snapshot.

## Documentation impact

### Decision Records

None needed here. GDR-KI-DESIGN-015, 031 and 032 decide the chart, the snapshot and the fallback.

### Specifications

None.

### Guides

`docs/guides/developer/page-provenance.md` lists the chart as vendored and gives the two-step refresh.

### Roadmap

None.
