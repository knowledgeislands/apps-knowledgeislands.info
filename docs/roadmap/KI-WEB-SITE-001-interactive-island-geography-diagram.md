---
id: KI-WEB-SITE-001
area: SITE
title: Interactive island diagram
kind: deliver
purpose: capability
project: website
status: cancelled
resolution: rejected
blocks: []
blocked_by: []
baseline_ref: null
created_at: 2026-07-29T00:11:08Z
updated_at: 2026-10-11T02:23:38Z
---

## Goal

The website shows an interactive, accessible diagram of a Knowledge Island as a place, rendered from Arcadia's canonical geography model and its approved isometric tile set.

## Context

Create a visual, interactive version of the island geography using the isometric tile set from Arcadia's Aesthetics pillar. This record is the execution item for the rendered artefact. The content and knowledge model behind it were to come from Arcadia's geography model and tiles work in `knowledgeislands/ki-arcadia-principal`, cancelled on 2026-10-07; on restart this record carries how an island's zones and artefacts map to places and a tile set fit for interactive web use. Arcadia holds draft concept sheets in `Pillars/Aesthetics/Isometric Tiles/`, but no approved, web-suitable asset set or canonical geography model exists yet.

## Boundary

- Website implementation only: interaction design, accessibility model, presentation and hosting of the diagram.
- No tile artwork is invented here; it comes from Arcadia's Aesthetics pillar. On restart this record carries the geography-model need from Arcadia's cancelled geography work.
- Implementation does not begin until that record's waiting-for condition is discharged.

## Current state

The geography model and an approved, web-suitable tile set are not yet available, so this item remains draft in `Waiting for` with no implementation baseline. Its waiting-for condition is named below.

## Steps

- [ ] Confirm that the approved isometric asset set is available and suitable for interactive web use.
- [ ] Design the interaction and accessibility model around the agreed Capital, Library, Streams, and Harbour geography.
- [ ] Implement and verify the diagram in the website before requesting review.

## Files touched

- Website guidance and presentation files that host the interactive geography diagram.

## Verify

- The diagram is keyboard-accessible, understandable without the visual treatment, and uses the approved assets.
- Relevant website build, lint, and authored-content checks pass.

## Dependencies / blocks

Parked. Return trigger: Kris restarts website work after the state-of-play roadmap review. On return, move it back to `waiting-for` unless the Arcadia condition below has already been met.

No dependency. Arcadia's work in `knowledgeislands/ki-arcadia-principal` to publish the geography model and tile set, was cancelled on 2026-10-07 under decision 17 of the state-of-play design. On restart this record carries that need and re-plans how the model and tiles are sourced.

## Cancelled

Cancelled 2026-10-11 as rejected, approved by Kris Brown (state-of-play decisions log, Decision 38: roadmap triage approved in full). Parked with no website work planned and dependent on a geography model and tile set not yet delivered, so Kris chose not to keep it as a work record. It is kept as a one-line idea in Arcadia's website Project note (`ki-arcadia-principal`, `Streams/Projects/website.md`). It leaves no outstanding change.

## Discussion

### Owner decision (2026-10-06)

The 2026-10-06 roadmap consolidation found this record overlapping Arcadia's geography model and tiles work. Both are adopted, so neither was merged. The owner decided to keep both and split them by ownership: this record owns the rendered, interactive diagram, and Arcadia owns the aesthetics and knowledge model behind it. The generic Goal was restated and the waiting-for condition now names Arcadia's work.

### Parking - 2026-10-07

In the state-of-play roadmap review on 2026-10-07, Kris put website work back while the roadmaps are brought under control, so this item moves from `waiting-for` to `parked`. Return trigger: Kris restarts website work after the state-of-play roadmap review. The Arcadia dependency under Dependencies / blocks is unchanged.

### Related work

`knowledgeislands/ki-agentic-harness` has related work on governing living diagrams. It does not block this record, and this record does not block it.

### Arcadia geography record cancelled - 2026-10-07

Kris approved cancelling Arcadia's geography work under decision 17 of the state-of-play design: it was speculative while the website is paused, and this record keeps the need. The hold now waits only on Kris restarting website work, and the earlier Arcadia dependency no longer applies.
