---
id: ADR-KI-WEBSITE-003
title: 'Documentation Is A Thing You Work Through'
date: 2026-09-25
status: current
decision_type_url: https://knowledgeislands.info/specifications/decision-records/adr
decision_type: architecture
decision_depends_on: ['GDR-KI-WEBSITE-002', 'ADR-KI-WEBSITE-002']
---

# ADR-KI-WEBSITE-003: Documentation Is A Thing You Work Through

## Context

The site had a top-level **Guidance** section holding thirty-five pages about how to use Knowledge Islands. It was the obvious arrangement and it produced a routing layer.

Measured across the built output: seventy links into GitHub across those thirty-five pages, six of them anchors whose entire text was `The full guide`, and a `## Sources` table as the last thing a reader met on nearly every page. The reader's final impression of a guidance page was that the real material was elsewhere — precisely the outcome [GDR-KI-WEBSITE-002](GDR-KI-WEBSITE-002-carrying-material-for-readers.md) was written to stop. A section named for a purpose had filled with pages that served it badly, and nothing in the arrangement made that visible, because a directory named `guidance` accepts anything anyone calls guidance.

The first answer was ownership: a page lives with the thing it is about. The guides went under the project each described, at `/projects/<slug>/<page>/`, and what belonged to no project went to `/prompting/` and `/optional-tools/`. That fixed the accountability problem — a page filed under `ki` answers to the reader who came to learn `ki` — and it fixed the voice, because the gate it came with refuses an anchor that names a destination.

It did not fix what a reader arrives wanting. **Ownership is a filing rule; a reader has a learning problem.** Filing by owner scattered the material a person needs into the catalogue of things that exist, so the twenty-three pages that teach the system were spread across two of nineteen project pages, and the three sections that also teach it — Get Started, Prompting, Contribute — sat at the top level as peers of Philosophy and Model. There were six top-level entries and no answer to "where are the docs", because the docs were everywhere and nowhere. A reader who finished a guide had no idea whether they had read one page of nine or one page of one.

The second problem is scale. The catalogue grows with the ecosystem: nineteen projects now, more later. Hanging the teaching material off it means the navigation grows with the number of repositories rather than with the number of things worth learning, and most repositories will never have a guide.

## Decision

**Documentation is a finite body of material a reader works through, and the site is arranged around that.**

The top-level navigation is three entries — **Philosophy**, **Model**, **Docs**. Everything that teaches lives under Docs, divided into **sections**: Get Started, The ki CLI, The Agentic Harness, Prompting, Optional Tools, Contribute. A section is a sequence with a first page, a last page and an order somebody chose, and the reader can see how long it is before they start.

**A page lives in the section it belongs to, at `apps/site/src/docs/<section>/<page>.md`, published at `/docs/<section>/<page>/`.** This reverses the location this record previously set. The principle it replaces — that a page lives with what it is about — was answering the question "who owns this?", which is the right question for a repository and the wrong one for a reader.

**The binding is still the directory, never the page's frontmatter.** `src/docs/ki/ki.json5` sets `section` and `layout` for every page beside it. A page is bound, styled, listed and given its way back up because of where it lives, not because somebody remembered a line. That part of the previous decision was right and survives the move intact.

**`src/_data/docsSections.json5` is the registry of sections**, and it declares only a slug, a title and a description. Page counts and entry points are derived at build time from the pages that actually carry the binding, so a card cannot claim a number its section does not hold, and adding a page changes the count without anyone editing the registry.

**`/projects/` stays, as a catalogue rather than a library.** It answers _what is this_ — what each repository owns, where it lives, what it ships. A project with a section links to it in one sentence rather than listing its pages, because the section's own contents already do that better. The two questions are different and now have different homes.

**The gate is the contract.** `apps/site/scripts/verify-docs-sections.ts` requires of every Docs page: a directory that `docsSections.json5` declares and a declaration that has a directory, both ways; a directory data file that binds it; a title; an `order` that is a positive integer unique within its section; and, of Markdown pages, an opening claim in prose before the first heading and no anchor whose text names a destination rather than a fact. `verify-reachable.ts` holds the whole `dist/docs/` tree to arrival by navigation.

## Consequences

- **A reader can see the shape of what they are agreeing to.** "Prompting" says nothing about whether it is an afternoon; "Prompting · 14 pages" does. The count is on the card and the contents are at the foot of every page, marking where the reader is and naming what comes next.
- **The navigation now grows with the material rather than with the repository count.** A new project adds a catalogue entry; only a new body of teaching adds a section.
- **Reachability and navigability became the same property.** The Docs grid links only each section's first page, so every page after it is reachable through the contents block that closes its predecessor. `verify-reachable.ts` therefore fails if the sections stop being navigable, which is a stronger claim than it used to make and the reason the contents block is a gate concern rather than a decoration.
- **The gate still encodes the editorial judgement, so the judgement survives the author.** "No link text that hands the reader off" is the mechanical half of [GDR-KI-WEBSITE-002](GDR-KI-WEBSITE-002-carrying-material-for-readers.md)'s ownership test. The half a machine cannot judge — whether the prose actually carries the material — still needs a person.
- **Reading order is a decision the build insists on**, now per section rather than per project. Eleventy sorts an unpositioned page last, so every page added without an `order` appends itself and the sequence decays toward the order things were written. The failure was silent, which is what made it worth gating. The fourteen prompting pages had no order at all under the previous arrangement and now carry one.
- Moving a page is not a way to shed its provenance. `verify:provenance` walks `src/docs/` as a tree rather than a list of directories, so the `sources` declaration follows the page through this move and the next one.
- **Every address published under either previous arrangement still resolves, in one hop.** `/guidance/*` redirects were repointed at the pages' new homes rather than at the intermediate ones, so a link written before the first move does not chain through two redirects to arrive.
- **Two hand-built landing pages are now section indexes.** Get Started and Contribute are Nunjucks pages with hero sections on `layouts/base.njk`, not prose articles, and they are sections of one page each. Whether they grow into sequences is an editorial question this record does not settle; the arrangement permits it without another move.
- The contract is worth adopting in `tools-ki` and `ki-agentic-harness`, whose own `docs/guides/` have the same failure available to them. That is a handoff to those repositories rather than something this one changes on their behalf.

## References

- [ADR-KI-WEBSITE-002](ADR-KI-WEBSITE-002-one-section-for-every-project.md) — one section per repository, which this leaves standing as the shape of the catalogue while moving the teaching material out of it.
- [GDR-KI-WEBSITE-002](GDR-KI-WEBSITE-002-carrying-material-for-readers.md) — the ownership test whose failure in the guidance section prompted the first move.
- Docs sections (`docs/guides/developer/docs-sections.md`) — the contract each page meets, and the gate that enforces it.
- Page reachability (`docs/guides/developer/page-reachability.md`) — the walk that proves every published page is on the far end of a link.
