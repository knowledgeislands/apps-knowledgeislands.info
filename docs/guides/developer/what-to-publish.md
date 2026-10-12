# Deciding what this site publishes

How to decide whether a piece of public explanatory writing belongs on the website, and how much of it the site should carry.

The website is where a reader meets Knowledge Islands. If they arrive wanting to understand something, decide something, or start using something, the site owes them enough to do it — not a paragraph of framing and a link to a repository.

That is a change of default. An earlier version of this guide asked whether a document ages with a version, and sent anything that did back to its source repository. The question was a good one; using it to decide _whether the site says anything_ was the mistake. It is recorded, with its consequences, in GDR-KI-WEBSITE-002.

## The test

Ask: **what is the reader trying to do here, and does this page let them do it?**

If they are deciding — whether a tool is for them, which capability fits their problem, how the pieces relate — the site carries the material. That reader has not cloned anything and should not have to.

If they are operating — running a specific release, reading an exact flag list, checking a conformance rule against a versioned corpus — the site may defer, because the owning repository is the only thing that can be true about its own current release.

Most readers arriving here are in the first group. Most of the material the site publishes should therefore be carried.

## What "carry" rules out

The sentence to look for is the one that transfers a reader instead of informing them:

- "This page intentionally does not reproduce the executable contract. Read the manual."
- "This page describes it; it does not stand in for it. Open the repository."

Both were on this site, on pages of around 200 words, and both are the old default speaking. A page that spends its length explaining why it is short has already decided not to help.

A repository link is not the problem. **A repository link is a fact about a project** — where it is developed, where to file an issue, what to clone. It becomes a problem when it stands in for the content, so the test is whether the sentence containing it transfers information or postpones it.

## Where deferring is still right

Three cases, and they are narrow:

1. **An executable contract.** The exact commands, flags, and exit codes of a specific release. The repository's own manual is generated from what actually ships; a hand-written copy here is a second source that will disagree.
2. **A release artefact.** Installers, checksums, signatures, release notes. Authority follows the thing that publishes them.
3. **An interface a reader operates rather than decides about.** A conformance rule checked against a versioned corpus; an API surface consumed by code. The reader who needs this has already committed and is working inside the owning repository's world.

When a page defers, it says what the reader will find and why it is not here. A routing decision is useful; an unexplained handoff reads as an apology.

## Where the material changes per release, vendor it

This is the case that makes the new default safe rather than reckless.

Carrying material means the site now owns its accuracy, and hand-written restatements of things that move rot silently. The skill catalogue proved it: hand-written prose describing 42 skills while the harness published 61, and nothing detected the gap because nothing could.

So where a page needs an inventory or a command surface that changes per release, the answer is not to write it out by hand and hope. It is to **vendor a published interface at a pinned ref** — parse it, fail loudly if its shape changes, and refresh by advancing one ref. ADR-KI-WEBSITE-001 records how, and [Page provenance](page-provenance.md) describes the mechanism.

Before designing a request to an upstream repository for a consumable artefact, check whether it already publishes one. The harness did, with its markers named normatively, while this site paraphrased it by hand for months.

## The four outcomes

| Outcome | When | What the site holds |
| --- | --- | --- |
| **Carry** | The reader is deciding, orienting, or starting. The default. | Its own prose, declaring its sources |
| **Vendor** | The material is an inventory or interface that changes per release | A pinned snapshot, parsed and gated |
| **Link** | An executable contract, a release artefact, or an interface the reader operates | A pinned link, and a sentence saying why |
| **Migrate** | The document has no version to age against and was simply in the wrong repository | The document, and the source reduced to a pointer |

## Ownership is not provenance

Two tests, easily confused, doing different jobs:

- **Ownership** — this guide — decides **what the site says**.
- **[Provenance](page-provenance.md)** decides **what the site cites**.

Carrying more upstream material makes provenance matter _more_, not less. Every published page — wherever its Docs section sits under `apps/site/src/docs/` — still declares the sources it was written from, and `verify:provenance` still gates that declaration. Nothing in the new default weakens it, and a page that carries more without declaring more is the failure mode this repository has always gated against.

## Two different problems

Keep these apart:

- **"This is hard to find."** Fix with a link or an index page. Cheap, reversible, no other repository involved.
- **"This is in the wrong repository."** Fix with a migration. Needs the owning repository's agreement, and is not done until the old source is removed or reduced to a pointer.

Treating the first as the second produces cross-repository work for something a one-line link would have fixed.

## Migration discipline

When a document does move:

1. Copy it verbatim. Rewrite only the frontmatter and any relative links. A migration that also edits prose cannot be checked against its source; one that does not can be verified with a single equality assertion.
2. File a record in the owning repository to reduce its copy to a pointer, and say which file.
3. Do not consider the migration complete while two copies exist. Recorded divergence is better than silent divergence, but it is still divergence.
