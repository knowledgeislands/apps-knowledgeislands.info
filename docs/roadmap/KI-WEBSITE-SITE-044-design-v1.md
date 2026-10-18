---
id: KI-WEBSITE-SITE-044
area: SITE
title: Adopt ki-design v1
kind: deliver
purpose: capability
project: website
horizon: now
status: in-progress
blocks: []
blocked_by: []
baseline_ref: 05af1ad46153e4d1986a5ad7b3aa3efad564776b
created_at: 2026-10-18T09:00:00Z
updated_at: 2026-10-18T10:30:00Z
---

## Goal

The website looks and reads as part of one Knowledge Islands design system: the same palette, type, glyphs and drawn Arcadia that `ki-design` defines, with the site split into a Voyage read in order and an Atlas returned to. Readers can look up every settled symbol on a new Field Guide page.

## Context

`ki-design` now owns the Knowledge Islands design system: DTCG tokens with a Tailwind v4 build, 71 line glyphs, the symbol library as typed data, the hex map and the Modern tile set. Its `examples/site-preview` is the agreed look for this site, built from the live site's copy in its own order. This record ports that look into the real site at `ki-design` commit `002a623`.

The site's previous look predates the design system: Playfair Display, white cards with drop shadows, emoji and repurposed icons in the Capital diagram (a lighthouse for the Council Hall, a compass for Pillars), and a decorative island at 15 % opacity in the hero.

What changed:

- **Tokens.** `apps/site/src/assets/css/ki-design/` holds the token build, vendored verbatim with the commit it came from. `tokens.css` keeps only the site's aliases, so every palette name the templates already used still resolves, and gains text gold, rust, the washes, the terrain fills and the theme-aware roles.
- **Type.** Cormorant Garamond for display sizes, Cormorant SC for eyebrows and labels, Inter for reading, from Google Fonts with `display=swap` and preconnect. Small `h3` and `h4` take the body face, because Cormorant is a display face.
- **Navigation.** `site.nav` is two groups, Voyage (Philosophy, Model, Arcadia) and Atlas (Field Guide, Docs, Projects), and one brass call to action, Enter Arcadia. Below 1100 px they fold into a Menu disclosure that works without JavaScript. The footer is grouped the same way.
- **Home.** Every sentence of the existing copy, in its order, under the new look: the hero with the Modern-set Arcadia and its cartouches, the districts list as the map's text equivalent, the three layers drawn as depth, the cycle on a tide loop, the Capital as a plate in glyphs, the wider picture on the hex lattice, Arcadia by daylight in a deckled plate, and a journey rail of the three existing next steps.
- **Field Guide.** `/field-guide/` renders the canon and decided entries of the symbol library from `src/_data/kiSymbols.json5`. It declares its sources, publishes them through `partials/sources.njk`, and `verify:provenance` now checks it and holds its snapshot to the cited ref.
- **Chrome.** Header, footer, buttons, links, focus rings, prose headings and code take the design system's treatment; white card grounds on the hand-built pages became a paper wash; brass text on parchment uses text gold (`#8a5a12`).
- **Sync.** `bun run --cwd apps/site sync:design` regenerates every vendored file from a clean local `ki-design` checkout and records its commit.

## Boundary

Not included: pages for Arcadia, Landscapes, Create or Specifications, which the design names but which do not exist. The navigation leaves them out rather than pointing somewhere they are not. Arcadia and the call to action go to the Arcadia section of the home page.

Not included at first: the Port rename. The design system recorded Port replacing Harbour as decided before Knowledge Islands Principal enacted it, so the live copy kept Harbour and the home page relabelled the vendored map art at render time. Principal has since enacted the Port (see Dependencies / blocks), and the site now says Port throughout. The Tower, still not canon, stays dropped from the Citadel's cartouche at render time, and the cycle's "The Observatory" keeps its live wording.

Not included: the preview's copy changes and additions. These are the Archipelago card's revised reading, the tags under the wider-picture cards, "Agents, human or AI, are workers.", the Citadel flower and its paragraph, the six canon principles, the closing banner, and the Field Guide's "How the map works" panels. Each adds or replaces copy the narrative does not yet carry.

Not included: proposed symbols and every symbol's upstream notes. Both are withheld at the sync, because the site must not publish a proposal beside canon.

## Current state

The work is in the working tree on `feat/design-v1`, uncommitted, with every gate passing.

## Steps

- [x] Vendor the token build and alias the site's palette names to it.
- [x] Replace Playfair Display with Cormorant Garamond, Cormorant SC and Inter.
- [x] Group the navigation into Voyage and Atlas, listing only routes that exist.
- [x] Restyle the home page around its existing copy, with the hero map, depth layers, cycle, Capital plate, wider picture, Arcadia plate and journey rail.
- [x] Add the Field Guide from a vendored canon-and-decided symbol snapshot, and extend `verify:provenance` to cover it.
- [x] Restyle the shared chrome, prose and hand-built card grounds; meet 4.5:1 for text, no horizontal scroll at 390 px, and reduced motion.
- [x] Add `sync:design` and its tests.
- [ ] Commit the ledger advance on its own, then this change.

## Files touched

- `apps/site/src/assets/css/` (`tokens.css`, `main.css`, `ki-design/`)
- `apps/site/src/_includes/` (`layouts/base.njk`, `partials/nav.njk`, `partials/footer.njk`, `macros/icons.njk`, `ki-design/`)
- `apps/site/src/_data/site.ts`, `apps/site/src/_data/kiSymbols.json5`
- `apps/site/src/index.njk`, `apps/site/src/field-guide/index.njk`, `apps/site/src/assets/js/site.js`, `apps/site/src/assets/images/ki-design/`
- Small contrast and type fixes in `apps/site/src/philosophy/index.njk`, `model/index.njk`, `docs/get-started/index.njk` and `docs/contribute/index.njk`
- `apps/site/scripts/sync-ki-design.ts` with its test, `apps/site/scripts/verify-provenance.ts`, `apps/site/package.json`
- `biome.json`, which leaves the vendored CSS to its upstream's formatting
- `docs/guides/developer/page-provenance.md`
- `docs/roadmap/_ISSUES.md` and this record

## Verify

```bash
bun run ki:site:clean && bun run ki:site:build   # every verify:* gate passes
bun run --cwd apps/site test
bun run self:typecheck
bunx @biomejs/biome check
bunx rumdl check docs/roadmap
```

Then look at the home page, an inner page and the Field Guide at 1440 and 390 px, in both colour schemes.

## Dependencies / blocks

Knowledge Islands Principal owns the Port rename. It enacted it on 2026-10-18 in GDR-KI-PRINCIPAL-010, at `ki-principal` commit `25b30fe`, and the handoff is done: the Port filters in `apps/site/src/index.njk` are deleted, and the home page, Philosophy, Get Started and Field Guide copy say Port. The Field Guide cites the new commit and marks the Port, its four modes, the Lighthouse and the Council Hall as canon through its `enactedCanon` list, because `ki-design` at `002a623` still marks them decided; once `ki-design` marks them canon, `sync:design` refreshes the snapshot and the list is deleted. The Tower filter stays until the Tower is enacted.

`ki-design` is the upstream for every vendored file. It is not yet public, so the Field Guide's citation of `packages/symbols/src/symbols.ts` cannot be opened by readers until it is; see Discussion.

## Documentation impact

### Decision Records

None needed. Vendoring the design system is the case GDR-KI-WEBSITE-002 and ADR-KI-WEBSITE-001 already decide; `sync:design` follows the ADR's shape, with the snapshot read from a local checkout because the token CSS and glyph sprite are build outputs.

### Specifications

None. No behaviour-level contract changes.

### Guides

`docs/guides/developer/page-provenance.md` gains the Field Guide as a third vendored page, with `sync:design` and why it reads a local checkout.

### Roadmap

The Arcadia, Landscapes, Create and Specifications pages and the preview's additional copy are follow-on work, to be recorded when each is picked up.

## Discussion

### A private upstream as a cited source

The page-provenance guide says a page must not cite a source no reader can open, and `ki-design` returns 404 to an unauthenticated reader today. The Field Guide cites it anyway, because the cards are that file's content and an honest citation that does not yet resolve is better than a public citation that names the wrong source. Either `ki-design` is made public before this ships, or the citation is published knowing it cannot be opened yet.

### Harbour and Port in canon

Principal's Symbol Library listed Harbour (integration point) and Port (operational systems) as two canon symbols, while `ki-design` recorded Port as decided and carried no Harbour entry. GDR-KI-PRINCIPAL-010 closed the gap; the Field Guide's opening note now cites it.

### Why the map art is inlined

The hero and plate SVGs are included inline rather than referenced as images. Inline, they take the web fonts for their cartouches, the lamp flicker obeys reduced motion through the page's stylesheet, and the cartouches collapse at phone width. Inline is also what lets the live wording be restored without editing the vendored file.
