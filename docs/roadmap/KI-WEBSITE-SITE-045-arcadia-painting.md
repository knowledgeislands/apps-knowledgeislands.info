---
id: KI-WEBSITE-SITE-045
area: SITE
title: Show the Arcadia painting as the legend beside the chart
kind: deliver
purpose: capability
project: website
horizon: now
status: done
blocks: []
blocked_by: []
baseline_ref: bc6dbdfbd4880773d5021d75864e8c2db05c18fc
created_at: 2026-10-18T11:00:00Z
updated_at: 2026-10-18T13:00:00Z
---

## Goal

The chosen Arcadia painting appears on the site wherever Arcadia is the subject: large in the home page's Arcadia section, and as the hero of a new `/arcadia/` page that sets it above the drawn map. The owner's direction is that the painting is the legend and the chart is the map, so the engraved isometric chart stays as the home hero. Revised the same day at the owner's direction: the painting became the home hero and the chart moved into the home Arcadia section, so the home page also reads legend first and map second.

## Context

`ki-design` recorded variation 1 as the chosen Arcadia reference on 18 October 2026, at `docs/briefs/references/arcadia.png` (commit `c73cefe`), with the handoff in `docs/briefs/arcadia-handoff.md`. The handoff approves the visual direction only. The file is 1672 × 941 pixels, below the brief's 2048-pixel minimum, and the art is unlicensed until `ki-design` records its art-licensing decision.

KI-WEBSITE-SITE-044 left Arcadia without a page, so the navigation's Arcadia link and the Enter Arcadia call to action went to the home page's `#arcadia` section, which showed the Modern-set daylight plate.

What changed:

- **Images.** `sync:design` now encodes the painting into AVIF and WebP at 1672, 960 and 480 pixels and one full-width JPEG fallback, with sharp and never above the source width. It reads the PNG from its pinned commit with `git show` rather than from the checkout's HEAD, so a re-sync reproduces the same files. The images live in `apps/site/src/assets/images/ki-design/arcadia/`, and the manifest `apps/site/src/_data/arcadiaPainting.json5` records the source, the licence state ("generated reference art; licence to be recorded"), and each variant's size.
- **Home.** The Arcadia section moves to navy, keeps its copy and buttons, and shows the painting nearly full-bleed below them, lazy-loaded through `<picture>` with the caption "Arcadia — painted reference, 2026". No copy sits on the painting. The hero is unchanged.
- **`/arcadia/`.** A full-bleed painting hero carries a short title block, "Arcadia" and the home section's one-line description, on a navy scrim over the sea. Below it the chart, the vendored `hero-arcadia.svg`, is captioned with the hero note and followed by the districts list. A short closing block reuses the section's remaining sentence and buttons, and the page publishes its sources. A scroll-driven cross-fade dims the painting as it leaves and brings the chart up as it arrives. It needs no script and is skipped under reduced motion or without view timelines.
- **Navigation.** Voyage → Arcadia and Enter Arcadia go to `/arcadia/`. The home section keeps its `#arcadia` anchor.
- **Home, revised.** After seeing `/arcadia/`, the owner asked for the home page to open the same way (18 October 2026). The painting is now the home hero, eager-loaded, with the existing hero copy and buttons on a navy scrim over the sea to the island's west. On wide screens the painting is sized from the space the copy leaves and anchored right, so the Port and the Citadel stay clear; at 900 px and below the copy stacks under it, and at 720 px and below the painting crops around the island. The districts strip still follows the hero. The Arcadia section keeps its copy and buttons and now draws the chart, labelled "The chart" and captioned with the former hero note, with the Tower dropped from its cartouche at render time as before. The painting appears once.
- **Gates.** `verify:provenance` lists `/arcadia/` as a hand-built page and holds the painting manifest to the ref the page cites. The portable-`dist/` transform now rewrites `srcset` candidates as well as `href` and `src`.

## Boundary

Not included: a higher-resolution painting, or the geography fixes the handoff asks for (the hex terraces, the rail tracks, the customs barrier, and the Citadel on the highest ground). Those belong to `ki-design`.

Not included: any new copy about Arcadia. The page reuses the home page's sentences and labels. Its only additions are the kickers "The legend" and "The chart", which label the owner's direction.

The daylight plate, `_includes/ki-design/arcadia-plate.svg`, is still vendored by the sync but no page renders it now.

## Current state

Done. Every gate passes, and the change is committed and pushed to `main`.

## Steps

- [x] Encode the pinned painting into the responsive set from `sync:design`, with its manifest and tests.
- [x] Replace the home Arcadia plate with the painting, keeping the section's copy and buttons.
- [x] Add `/arcadia/` with the painting hero, the chart, the districts and its sources.
- [x] Point the navigation and the call to action at `/arcadia/`.
- [x] Extend `verify:provenance` and the `srcset` rewrite.
- [x] Check contrast against the scrimmed painting, phone width without horizontal scroll, reduced motion, and an unchanged hero.
- [x] Commit the ledger advance on its own, then this change.
- [x] Make the painting the home hero and move the chart into the home Arcadia section (owner direction).

## Files touched

- `apps/site/scripts/sync-ki-design.ts` with its test, `apps/site/scripts/verify-provenance.ts`, `apps/site/package.json`, `bun.lock`
- `apps/site/eleventy.config.ts`
- `apps/site/src/_data/arcadiaPainting.json5`, `apps/site/src/_data/site.ts`
- `apps/site/src/_includes/macros/painting.njk`, `apps/site/src/index.njk`, `apps/site/src/arcadia/index.njk`
- `apps/site/src/assets/css/main.css`, `apps/site/src/assets/images/ki-design/arcadia/`
- `docs/guides/developer/page-provenance.md`
- `docs/roadmap/_ISSUES.md` and this record

## Verify

```bash
bun run ki:site:clean && bun run ki:site:build   # every verify:* gate passes
bun run --cwd apps/site test
bun run self:typecheck
bunx @biomejs/biome check
bunx rumdl check docs
```

Then look at the home page and `/arcadia/` at 1440, 1280, 1024 and 390 px. On the home hero the copy should leave the Port and the Citadel clear, and every line of text over the painting should meet 4.5:1 against the scrimmed image. At 390 px nothing should scroll sideways, and on `/arcadia/` every line of text over the painting should meet 4.5:1 against the scrimmed image.

## Dependencies / blocks

`ki-design` owns the painting, its resolution and its licence. When it records the art-licensing decision, update the manifest's licence note through the sync and the `governs` sentence on `/arcadia/` together. When it publishes a regenerated painting, advance `PAINTING.ref` and the page's cited ref in the same change; widths above 1672 can then join the set.

## Documentation impact

### Decision Records

None needed. Vendoring a `ki-design` artefact is the case GDR-KI-WEBSITE-002 and ADR-KI-WEBSITE-001 already decide.

### Specifications

None.

### Guides

`docs/guides/developer/page-provenance.md` lists `/arcadia/` as a fourth vendored page and explains why the painting is pinned rather than taken at HEAD.

### Roadmap

None.

## Discussion

### Why the painting is pinned

Every other vendored file is a build output of `ki-design`'s own code and is taken at whatever commit the checkout holds. The painting is a chosen artefact, not an output, so a sync that followed HEAD could republish a replacement nobody chose. Pinning makes advancing it a deliberate, visible edit.
