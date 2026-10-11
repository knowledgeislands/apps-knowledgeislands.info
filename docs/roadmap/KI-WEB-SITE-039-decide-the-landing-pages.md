---
id: KI-WEB-SITE-039
area: SITE
title: Decide the landing pages
kind: deliver
project: website
status: cancelled
resolution: rejected
blocks: []
blocked_by: []
baseline_ref: null
created_at: 2026-09-25T14:00:00Z
updated_at: 2026-10-11T02:23:38Z
---

## Goal

A reader who clicks **Get Started** on the Docs grid starts something. A reader who clicks **Contribute** finds a page that knows what it is for and is not explaining the Contribution Process for the second time.

## Context

The completed Docs restructure gathered everything that teaches into Docs sections and settled four of the six. Optional Tools grew from one page to six. Get Started and Contribute were left, deliberately, because measuring them turned up a problem the restructure could name but not fix.

They are not thin articles waiting to be grown. Both are hand-built Nunjucks pages on `layouts/base.njk` carrying hero sections, full-bleed backgrounds and their own containers — 199 lines and 88 lines of markup respectively, not prose. Converting either into a prose sequence is a visual change, and nothing in this session could see the result.

Worse, they overlap. Get Started's headings run: Arcadia, "Arcadia is not documentation", Philosophy, The Model, the Contribution Process in four stages, Establishing an Island, Charter, The Council, Territories, Archipelagos. Contribute's run: "Improve what's shared", three steps of the Contribution Process, "Contribution is not internal setup". Two of the six sections explain the same process, and one of them also restates Philosophy and Model, which are two of the three top-level nav entries.

The sharper finding is that **Get Started does not get anybody started.** It is an Arcadia overview and a conversion page. The pages that actually start someone are `/docs/ki/getting-started/` — "Install and get started" — and `/docs/ki-agentic-harness/installing-a-harness/`, both of which sit in other sections. So the first card on the Docs grid, the one a reader is told to begin at, leads to an explainer, while the sequence it promises exists under two other names.

## Boundary

This decides what Get Started and Contribute are, and rewrites them accordingly. It may move material between sections, and it may conclude that one of them is not a Docs section at all — Contribute could reasonably be site chrome, like a footer link, rather than something a reader works through.

In scope: the registry entries for these two pages in `docsSections.json5`, the `order` renumbering of the `ki` section after its first page moves, and repointing links in the other sections to moved addresses. Out of scope: the grid template, the docs gates, and the content of the other four sections; the completed Docs restructure settled those and they hold whatever answer this reaches. It needs a person at a browser, because both pages are visual compositions and the verification is whether the result still looks like the site.

## Current state

Six Docs sections. Four of them are settled by `KI-WEB-SITE-037`: The ki CLI at 9 pages, The Agentic Harness at 10, Prompting at 14, Optional Tools at 6 after that item split it. Two are not.

| Section | Pages | What it actually is |
| --- | --- | --- |
| Get Started | 1 | 199 lines of Nunjucks on `layouts/base.njk` — hero, full-bleed sections, icon macros |
| Contribute | 1 | 88 lines of the same |

Get Started's headings, in order: Arcadia; "Arcadia is not documentation"; Philosophy; The Model; the Contribution Process in four stages; Establishing an Island; Charter; The Council; Territories; Archipelagos. Contribute's: "Improve what's shared"; three steps of the Contribution Process; "Contribution is not internal setup".

Two of the six sections therefore explain the Contribution Process, and one of them also restates Philosophy and Model, which are the other two top-level nav entries.

The pages that actually start someone are `/docs/ki/getting-started/` and `/docs/ki-agentic-harness/installing-a-harness/`, both in other sections.

## Steps

- [ ] Take `baseline_ref` before any edit.
- [ ] Replace `apps/site/src/docs/get-started/index.njk` with Markdown pages: delete `index.njk` and set `layout: 'layouts/page.njk'` in `get-started.json5` (the docs gate requires it once Markdown is present).
- [ ] Add `apps/site/src/docs/get-started/start-here.md` (`order: 1`, `permalink: /docs/get-started/`, `sources: original`): an opening claim of at least 120 characters, what the reader will have at the end (CLI, harness, repository), and prerequisites; no hand-off link text.
- [ ] `git mv apps/site/src/docs/ki/getting-started.md apps/site/src/docs/get-started/install.md`; set `order: 2` and `permalink: /docs/get-started/install/`; renumber the remaining `ki` pages 2-9 to 1-8 (order fields only).
- [ ] Repoint the inbound prose links to `/docs/ki/getting-started/` at `/docs/get-started/install/`: `docs/optional-tools/index.md`, `docs/ki/naming-and-locations.md`, `docs/ki/command-groups.md`, `docs/ki-agentic-harness/repositories.md`, `docs/ki-agentic-harness/using-skills.md`, `docs/ki-agentic-harness/installing-a-harness.md`. In `docs/prompting/index.md` the link is The ki CLI's section-entry link, so point it at the new first `ki` page, `/docs/ki/command-groups/`.
- [ ] `apps/site/src/model/index.njk`: add an Arcadia block (Charter, Council, Territories, Archipelagos, and the Island/Territory/Archipelago glossary) before the closing call to action, and link the Contribution Process card to `/contribute/`.
- [ ] `git mv apps/site/src/docs/contribute/index.njk apps/site/src/contribute/index.njk` (matching `src/model/index.njk` and `src/philosophy/index.njk`); set `permalink: /contribute/`; delete `apps/site/src/docs/contribute/contribute.json5`; drop the duplicate explainer in the "Establish an Island" call to action; keep its three steps as the single explanation of the Contribution Process.
- [ ] Delete Get Started's four-stage Harbour / Streams / Enactment / Library block: it describes intake into an island, not the shared-model Contribution Process.
- [ ] `apps/site/src/_data/docsSections.json5`: remove `contribute`; reword the `get-started` description to match the sequence.
- [ ] Footer: `apps/site/src/_includes/partials/footer.njk` builds its Explore column from `site.nav`. Add a `footer` list to `apps/site/src/_data/site.ts` (the three `nav` entries plus `{ label: 'Contribute', href: '/contribute/' }`) and iterate it in `footer.njk`; leave the three-entry top navigation unchanged.
- [ ] `apps/site/src/redirects.njk`: replace `/contribute /docs/contribute/ 301` with `/docs/contribute /contribute/ 301`; add `/docs/ki/getting-started /docs/get-started/install/ 301`; repoint `/guidance/using-ki/getting-started` and `/projects/ki/getting-started` at the new address in one hop; update the trailing comment that says Get Started, Contribute and Optional Tools kept their page names.
- [ ] Restate the answer wherever the hand-built sections are described: both paragraphs in `docs/guides/developer/docs-sections.md` (around lines 31 and 55) and the header comment in `apps/site/scripts/verify-docs-sections.ts` (comment only; gate logic unchanged).
- [ ] `docs/decisions/ADR-KI-WEB-003-documentation-is-a-thing-you-work-through.md`: amend the "two hand-built landing pages" Consequences bullet - Get Started is a sequence; Contribute is site chrome - drawing the boundary the record left implicit (amend, not supersede).
- [ ] Run Verify, then request the person-at-a-browser check before Awaiting review.

## Files touched

- `apps/site/src/docs/get-started/index.njk` (deleted), `get-started.json5`, `start-here.md` (new), `install.md` (moved from `apps/site/src/docs/ki/getting-started.md`)
- `apps/site/src/docs/ki/*.md` - `order` renumber; link repoint in `naming-and-locations.md` and `command-groups.md`
- `apps/site/src/docs/ki-agentic-harness/repositories.md`, `using-skills.md`, `installing-a-harness.md`; `apps/site/src/docs/prompting/index.md`; `apps/site/src/docs/optional-tools/index.md` - link repoint only
- `apps/site/src/docs/contribute/` (removed) and `apps/site/src/contribute/index.njk` (moved)
- `apps/site/src/model/index.njk`
- `apps/site/src/_data/docsSections.json5`, `apps/site/src/_data/site.ts`, `apps/site/src/_includes/partials/footer.njk`
- `apps/site/src/redirects.njk`
- `apps/site/scripts/verify-docs-sections.ts` - header comment only
- `apps/site/src/index.njk` - check the home Get Started button copy; target unchanged
- `docs/guides/developer/docs-sections.md`
- `docs/decisions/ADR-KI-WEB-003-documentation-is-a-thing-you-work-through.md`
- This roadmap record

## Verify

- `bun run ki:site:clean && bun run ki:site:build` passes, including `verify:docs`, `verify:reachable`, `verify:provenance` and `verify:prose`.
- `grep -rl "Contribution Process" apps/site/src` shows a step-by-step explanation only in `contribute/index.njk`; `model/index.njk` keeps its one-paragraph definition card and other hits are incidental mentions.
- `grep -rl "/docs/contribute\|/docs/ki/getting-started" apps/site/dist` lists only `_redirects`, and every pre-existing address resolves (check each 301 target in `dist/_redirects`).
- The Docs grid shows five cards; Get Started reads "2 pages"; no "1 page" card remains; the footer shows Contribute and the top navigation still has three entries.
- A person has looked at `/docs/`, `/docs/get-started/`, `/docs/get-started/install/`, `/model/` and `/contribute/` in both colour schemes and at a narrow viewport; the build cannot judge these compositions.
- `ki repo audit --progress never` passes.

## Dependencies / blocks

Parked. Return trigger: Kris restarts website work after the state-of-play roadmap review. Kris confirmed the editorial choices on 2026-10-07 (see Discussion), so the earlier waiting-for condition is discharged; on return, the item goes to `now` and is re-marked Ready through `ki-plan` with the Steps unchanged. No local item blocks this. The accepted Docs restructure delivered the structure this decides the contents of and is already closed for what it delivered.

`KI-WEB-SITE-032` owns whether the Docs grid looks right, including whether a "1 page" card looks broken. If this item removes the one-page cards, that question goes away; if it keeps them, 032 still owns it.

## Documentation impact

### Decision Records

Possible. `ADR-KI-WEB-003` states that everything which teaches lives in a Docs section. Concluding that Contribute is site chrome rather than documentation is consistent with that record but worth a sentence in it, because it draws the boundary the record left implicit.

### Specifications

None.

### Guides

`docs/guides/developer/docs-sections.md` notes that Get Started and Contribute are hand-built landing pages and that whether they grow into sequences is unsettled. That paragraph is rewritten to state the answer.

### Roadmap

None beyond this record.

## Cancelled

Cancelled 2026-10-11 as rejected, approved by Kris Brown (state-of-play decisions log, Decision 38: roadmap triage approved in full). Parked since 2026-10-07 with open design questions and no owner, so Kris chose not to keep it as a work record. It is kept as a one-line idea in Arcadia's website Project note (`ki-arcadia-principal`, `Streams/Projects/website.md`). It leaves no outstanding change.

## Discussion

### The grid asked the question, it does not get to answer it

A card reading "1 page" is uncomfortable next to one reading "14 pages", and the temptation is to write pages until the numbers look respectable. That would be the grid dictating to the content. The honest outcomes include "this is one page and that is correct" and "this is not a section" — and the count being visible is doing its job either way, because it surfaced the overlap that nobody had noticed while the two pages sat at opposite ends of a six-entry nav.

### Two candidate shapes, and they are not equivalent

One: **Get Started becomes the sequence it promises** — install, first repository, first skill, see something happen — assembled largely from material that already exists in the `ki` and harness sections, with the Arcadia explanation moving to `/model/` where the rest of it lives. That is mostly redistribution rather than net new writing, and it makes the first card true.

Two: **Get Started stays a conversion page and leaves the grid**, becoming a landing page that routes into the sections. That preserves a page that was presumably built to convert, at the cost of the Docs grid no longer having an obvious first card.

The first is better for a reader who came to learn; the second is better for a reader who came to be persuaded. Which matters more here is not a question a gate can settle.

### The overlap is the part that is not optional

Whatever shape the two pages take, the Contribution Process should be explained once. Two explanations drift, and the one nobody is looking at drifts first.

### Blocker - 2026-10-04 (resolved 2026-10-05, see Decision below)

Left in Triage during an agent roadmap pass. The first two Steps are editorial choices for the owner - which shape Get Started takes, and where Contribute lives - and nothing here should be planned or executed until one is chosen. The overlap step cannot run first, because where the Contribution Process is explained depends on that choice.

### Decision - 2026-10-05

The editorial choices were decided by the Fable reviewer under delegated autonomy, reversible:

1. **Get Started becomes the sequence it promises** (shape one). `ADR-KI-WEB-003` defines Docs as a thing you work through, so the first card should be true. The `/docs/ki/getting-started/` first-run walkthrough already exists and moves in; the Arcadia explainer (Charter, Council, Territories, Archipelagos, glossary) moves to `/model/`, whose closing block already says Arcadia implements the model.
2. **Contribute leaves the Docs grid and becomes site chrome**: a standalone `/contribute/` page, its pre-037 address, linked from the footer. It is a conversion page about proposing to the shared model, not a sequence.
3. **The Contribution Process is explained once, on `/contribute/`.** `/model/#processes` keeps its definition card and links there.

Moving one page out of the `ki` section is material moving between sections, which the Boundary permits; removing the `contribute` registry entry is the removal it anticipated. Top navigation stays at three entries. With no one-page card left, the `KI-WEB-SITE-032` "1 page" question also goes away. The earlier Blocker is resolved by this decision; the item was adopted to `now` and made Ready.

### Deferral - 2026-10-06

Moved from `now` to `waiting-for` during the roadmap clearance that precedes the cross-repository review in the `state-of-play` checkpoint of `knowledgeislands/ki-arcadia-principal` (`+/_CHECKPOINTS/state-of-play.md`). The 2026-10-05 Decision was taken by a reviewer under delegated autonomy and marked reversible; the choice of landing pages is Kris's to confirm before any of the Steps run. Waiting-for work must be draft, so the status returns from `ready` to `draft`; the plan above stays as written and `baseline_ref` stays unset.

The waiting-for condition is discharged when Kris answers these questions, recorded here:

1. Should Get Started become the install-and-first-run sequence (shape one), or stay a conversion page outside the Docs grid (shape two)?
2. Should Contribute leave the Docs grid for a standalone `/contribute/` page linked from the footer?
3. Should the Contribution Process be explained once, on `/contribute/`, with the Arcadia explainer moving to `/model/`?

If all three are confirmed, return the item to `now` and re-mark it Ready through `ki-plan` with the Steps unchanged. If any answer changes, replan the Steps through `ki-plan` first.

### Owner confirmation and parking - 2026-10-07

In the state-of-play roadmap review on 2026-10-07, Kris confirmed all three landing-page choices from the 2026-10-05 Decision: Get Started becomes the install-and-first-run sequence; Contribute leaves the Docs grid as a standalone `/contribute/` page linked from the footer; and the Contribution Process is explained once, on `/contribute/`, with the Arcadia explainer moving to `/model/`. The Steps stay unchanged.

Kris also said website work is not a priority while the roadmaps are brought under control, so the item moves from `waiting-for` to `parked` rather than to `now`. Return trigger: Kris restarts website work after the state-of-play roadmap review. On return, move it to `now` and re-mark it Ready through `ki-plan` with the Steps unchanged; `status` stays `draft` and `baseline_ref` stays unset until then.
