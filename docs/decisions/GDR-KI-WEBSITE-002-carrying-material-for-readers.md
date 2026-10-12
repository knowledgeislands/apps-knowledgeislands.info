---
id: GDR-KI-WEBSITE-002
title: 'Carrying Material for Readers'
date: 2026-09-22
status: current
decision_type_url: https://knowledgeislands.info/specifications/decision-records/gdr
decision_type: governance
---

# GDR-KI-WEBSITE-002: Carrying Material for Readers

## Context

Deciding what this site publishes asked one question of every candidate document: does it age with a version? Anything that did stayed in its source repository, and the site linked to it pinned at a tag.

The reasoning was sound about **canonical copies**. A guide describing a specific CLI release cannot be copied here and stay true. But the rule was applied to a second question it was never designed for — how much the site should say — and there the answer it gave was consistently "less".

The pages show it. `/tooling/ki/` closed with "This page intentionally does not reproduce the executable contract. Read the manual." `/projects/mcp-git-audit/` closed with "This page describes it; it does not stand in for it. Open the repository." Measured across the built output, median main-content length was around 300 words and 30 of 56 pages fell under 310. The four tool pages ran 205–212 words; the eleven project pages 210–304.

Meanwhile the pages that had quietly stopped deferring were the site's best: the vendored skill catalogue at 3,776 words, `using-ki/tuning/` at 2,656, `skills/by-outcome/` at 1,622. The policy was not producing restraint. It was producing pages that explained why they were short.

The repository owner stated the requirement directly: the site should not send readers to Git repositories for their guides, and should present the information within the website itself.

## Decision

The default reverses. **The site carries the material a reader needs to understand, decide, or start** — and defers only in three named cases: an executable contract, a release artefact, or an interface the reader operates rather than decides about.

The test is no longer "does this age with a version?" but "what is the reader trying to do, and does this page let them do it?" The version question survives, relocated: it no longer decides _whether_ the site carries material, only _how_.

Because where material changes per release, carrying it by hand is how the site rots. The catalogue is the evidence — hand-written prose describing 42 skills against an upstream 61, undetectable because nothing could detect it. So the guide gains a fourth outcome between carrying and linking: **vendor a published interface at a pinned ref**, parse it, fail loudly when its shape changes, refresh by advancing one ref. This record names the outcome; how it is done, and what the site owes when the upstream interface is published but not specified, is decided separately.

A repository link remains legitimate as a **fact about a project** — where it is developed, where to file an issue. What is removed is the link that stands in for content. The test on any given sentence is whether it transfers information or postpones it.

This decision governs **ownership** only. Provenance — the `sources:` declaration, `partials/sources.njk`, and the `verify:provenance` gate — is untouched, and matters more under the new default rather than less, since the site now restates more of what it cites.

## Consequences

- Every reader-facing page is now judged against a standard most of them currently fail. The rewriting is tracked as `KI-WEBSITE-SITE-022` for guidance and `KI-WEBSITE-SITE-023` for project pages.
- The site takes on accuracy obligations it did not have. Material it merely linked to was someone else's to keep true; material it carries is its own.
- That obligation is bounded deliberately. Vendoring is the answer for anything release-coupled, so the hand-written surface stays restricted to material that changes slowly — what a project is for, who it suits, how the pieces relate.
- Deferral now has to be argued rather than assumed, and a page that defers says what the reader will find and why it is not here.
- More upstream material restated means more `sources:` entries and a larger provenance sweep. That is the intended cost of the trade.
- The earlier reasoning is not deleted from the guide. It was right about canonical copies and is retained as the migration case; only its use as a default for reader-facing depth is withdrawn.

## References

- Deciding what this site publishes (`docs/guides/developer/what-to-publish.md`) — the guide this decision rewrites.
- Page provenance (`docs/guides/developer/page-provenance.md`) — the citation mechanism this decision leaves intact.
- Deciding what this site publishes (`docs/guides/developer/what-to-publish.md`) — where the fourth outcome is written down for the next page that needs it.
