---
id: ADR-KI-WEBSITE-001
title: 'Vendoring a Published Inventory'
date: 2026-09-22
status: current
decision_type_url: https://knowledgeislands.info/specifications/decision-records/adr
decision_type: architecture
decision_depends_on: ['GDR-KI-WEBSITE-002']
---

# ADR-KI-WEBSITE-001: Vendoring a Published Inventory

## Context

Two of this site's pages are inventories of something another repository owns, and both had the same failure available to them.

The skill catalogue published every harness skill as hand-written prose. It was the one page whose derived account added nothing to its source: an inventory, reworded. The ownership test predicts that outcome — an inventory ages with each release — and the page had already drifted, listing 42 skills where the harness published 61. Nothing detected it, because nothing could.

The `ki` command reference had the opposite symptom and the same cause. It was the shortest page on the site: 133 words and a link to `tools-ki`. A reader who wanted to know what `ki` can do had to leave. Writing the inventory out by hand was the option to reject — eighty-eight commands across fourteen groups change every release, which is exactly the material that rotted in the catalogue.

[GDR-KI-WEBSITE-002](GDR-KI-WEBSITE-002-carrying-material-for-readers.md) requires the site to carry what a reader needs and names vendoring a published interface as the outcome for material that changes per release. This record decides how that is done, for both inventories, and what the site owes when the upstream interface is weaker.

**The two upstreams are not equally strong, and the difference is the whole of this record's second half.**

`ki-repo-harness` _specifies_ the catalogue block. It names the `ki-repo-harness:capability-catalogue:start` and `:end` markers in `skills/README.md` normatively and fixes what the block between them carries: source-domain groups, full descriptions, governance and process counts, runtime-neutral argument hints, required dependencies, and runtime bindings. `ki repo conform --skill ki-repo-harness` regenerates it from canonical `SKILL.md` frontmatter, and the harness's own rubric tests assert both markers. The site consumes a contract.

`tools-ki` publishes `man/ki.1`, which is a complete grouped inventory shipped with every release — but nothing names it as an interface, nothing fixes its structure, and no test upstream asserts that its shape holds. It is published, not specified. The manual proved the point at `v0.4.0`: its SYNOPSIS lists fourteen command groups, its COMMAND GROUPS reference section lists thirteen, omitting Batch records and its four commands entirely, and the two sections had drifted on at least one command's options. A parse of the reference section alone would have published a page claiming to list every command while being four commands short, with nothing to say so.

## Decision

**The site vendors a published inventory as data rather than restating it, and the parse carries whatever burden the upstream interface does not.**

`apps/site/scripts/sync-skill-catalogue.ts` resolves `skills/README.md` at an explicit immutable ref, parses the marker-delimited block, and writes `apps/site/src/_data/skillCatalogue.json5`. `apps/site/scripts/sync-cli-commands.ts` fetches `man/ki.1` at a pinned release, parses both inventory sections, reconciles them, and writes `apps/site/src/_data/cliCommands.json5`. Each page keeps its framing prose and renders the inventory from that data.

Four properties hold in both cases:

- **The snapshot is vendored, not fetched during the build.** The website seam requires a reproducible `apps/site/dist/`, so a build that reached the network would depend on when it ran and would fail offline — the same reasoning that already keeps `verify:guidance --network` out of the build.
- **Refreshing is a deliberate act.** Re-run the sync at a new ref and advance the page's `sources` ref in the same change. Two checks hold that together: upstream movement past the pinned ref is a **warning** from the ordinary provenance sweep, because an upstream repository editing its own document must not break this site's build; disagreement between the vendored snapshot's ref and the page's declared ref is a **failure**, and an offline one, because that is the site contradicting itself rather than upstream moving.
- **The parser refuses rather than degrades.** Every construct it does not recognise throws, as does a group without a purpose, a command without a description, a duplicate, or a total below a structural floor. A document whose shape changed stops the sync; it does not quietly publish half an inventory.
- **Only the inventory is vendored.** The framing, the routing, and the judgement about which entries matter stay site-authored prose that regeneration cannot overwrite.

**Where the upstream is published but not specified, the parse takes on what a contract would have asserted.** The catalogue parser cross-checks the entry count it parsed against the count the block states about itself, which is a check the block's own specification makes meaningful. The manual parser has no such statement to check against, so it reconciles the manual's two inventory sections instead of trusting either: a group present in SYNOPSIS and absent from COMMAND GROUPS is carried with the synopsis's own descriptions and marked `omittedFromReference`, and the page says so in place of that group's purpose. The site publishes the upstream gap rather than inheriting it silently.

## Consequences

- Neither page can describe an entry that no longer exists, or omit one that does, without the next sync failing or showing the difference. The 19 missing skills were published by the change that introduced this record.
- **The two dependencies are not equally safe, and the difference must not be flattened.** For the catalogue, the site depends on markers and a field set that `ki-repo-harness` specifies and tests; if either changes, the sync fails loudly at the next refresh, and no handoff is owed because the interface already exists and is specified. For the command reference, the site depends on an interface nobody promised to keep stable. That is the cost, accepted knowingly: a manual restructure breaks the sync at the next ref bump, and the page keeps publishing the last good pinned snapshot until someone looks.
- A handoff to `tools-ki` is therefore owed for the weaker case, and it is a real request rather than a formality: a machine-readable command projection, or a named and tested contract over the manual's structure, would let that parse become a consumer of a specified interface. It is recorded as `KI-TOOL-KI-CLI-080` in `tools-ki`, which owns its priority.
- The site now reports an upstream documentation defect to its own readers. That is the right side to err on — a reader who sees "the reference section does not carry this group" knows more than a reader who sees nothing — but it does mean site output is shaped by upstream quality in a way ordinary prose is not.
- Provenance gains a third case alongside declared and restated. A vendored page cites a source it reproduces rather than one it rewrote, which the provenance guide states.
- Refreshing either page is no longer a reconciliation of a long document by hand; it is one command and one ref bump.

## References

- [GDR-KI-WEBSITE-002](GDR-KI-WEBSITE-002-carrying-material-for-readers.md) — the ownership rule that makes carrying an inventory the requirement and names vendoring as its outcome.
- Page provenance (`docs/guides/developer/page-provenance.md`) — the declaration, the sweep, and the vendored case.
- Deciding what this site publishes (`docs/guides/developer/what-to-publish.md`) — the ownership test this decision applies.
- `ki-repo-harness`, `references/standards-compatible-harness.md` — the normative definition of the catalogue block.
- `KI-TOOL-KI-CLI-080` in `tools-ki` — the handoff the unspecified case raises.
