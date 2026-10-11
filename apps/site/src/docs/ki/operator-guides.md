---
title: Operator guides
description: The six workflows tools-ki documents at release length — what each one settles, what it refuses to do, and when you need it.
permalink: /docs/ki/operator-guides/
order: 8
sources:
  - repository: knowledgeislands/tools-ki
    path: docs/guides/README.md
    ref: v0.4.0
    governs: 'The operator guide collection this page summarises and links at a pinned tag'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/vscode-management.md
    ref: v0.4.0
    governs: 'The chezmoi ownership boundary and fail-closed behaviour of ki manage vscode'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/repository-local-governance.md
    ref: v0.4.0
    governs: 'The ki-self declaration, its canonical source layout, and its authority boundary'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/batch-records.md
    ref: v0.4.0
    governs: 'What ki batch records and the authority it explicitly does not confer'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/granola-acquisition.md
    ref: v0.4.0
    governs: 'The Granola adapter''s credential handling and read-only acquisition posture'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/standing-knowledge-intake.md
    ref: v0.4.0
    governs: 'Receiver-owned subtypes and the reciprocal grant a standing import requires'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/tools-ki
    path: docs/guides/user/territory-selection.md
    ref: v0.10.0
    governs: 'How a territory or the estate is selected, narrowed and opened from the Capital''s roster'
    reviewed: '2026-10-11'
---

# Operator guides

Six workflows need more than a `--help` page, because each one crosses a boundary where getting it wrong is expensive: another tool's source of truth, another repository's authority, or an external account's credentials.

What each one settles, what it refuses to do, and how to tell whether you need it, is below. The step-by-step commands are not, and that is a decision rather than an omission: each procedure is specific to the release that ships it, and several are written against `tools-ki`'s accepted-behaviour specifications, which its conformance tests verify. A second copy here would be unverified, and would go stale in exactly the way the boundary it describes is expensive to get wrong.

The links are pinned to `v0.4.0`, the release this site currently advertises. A guide describes the release it shipped with; following `main` would silently republish whatever that branch happens to hold.

## Managing local VS Code projections

**You need this if** a chezmoi source owns your machine's VS Code workspace files and the shared agent trusted-folder inventory, and you want `ki` to keep them in step with your registered repositories.

`ki manage vscode check` derives the workspace folders and permitted runtime clients from the local KI registry and each repository's `.ki.toml`, compares that against the chezmoi _source_ state, and exits non-zero when a registered repository needs a conventional workspace or the trusted-folder inventory needs refreshing. It writes nothing. `ki manage vscode sync --write` then publishes the reconciliation into the source, preserving existing multi-root workspaces, settings, and special filenames.

**The boundary that matters:** the command changes chezmoi _source_ state and never runs `chezmoi apply`. Rendering those changes onto the machine stays with your dotfiles workflow, after you have reviewed `chezmoi diff`. The two-step is the point — `ki` proposes, chezmoi applies, and neither silently becomes the other's authority.

`ki manage vscode source create` is the other half of the command: it creates an opt-in store for binary and media material unsuitable for Git, and associates it with a repository through the same source state. [The VS Code management procedure shipped with `v0.4.0`](https://github.com/knowledgeislands/tools-ki/blob/v0.4.0/docs/guides/vscode-management.md) has the reconciliation sequence step by step.

## Repository-local governance

**You need this if** a repository has auditable rules that are genuinely specific to it and do not belong in a portable harness skill.

Declaring an empty `[skills.ki-self]` table in `.ki.toml` grants native-operation authority to a canonical source tree under the repository root — `SKILL.md`, a `references/` rubric, and the scripts that implement it. The repository then audits and conforms against its own rules through the same `ki repo audit` and `ki repo conform` commands as any other skill.

**The boundary that matters:** `ki-self` is treated as one narrow repository-owned provider, not as installed harness content, and its authority stops at that repository's root. It is the escape hatch for rules that should not be portable — not a way to fork a harness skill locally.

The source layout is fixed rather than conventional — `SKILL.md`, a `references/` rubric, and the scripts the skill registers, at a canonical path the operation resolves — and [the repository-local governance procedure at `v0.4.0`](https://github.com/knowledgeislands/tools-ki/blob/v0.4.0/docs/guides/repository-local-governance.md) gives it file by file.

## Canonical batch records

**You need this if** you are running an already-approved, exact set of Ready roadmap items and want a durable record of what was authorised and what came of it.

`ki batch prepare` creates an authority envelope under `+/_BATCHES/` naming every item explicitly in dependency order, with an expiry and a declared authority mode; later commands bind a run to that payload, append caller-supplied results, and record caller-proven completion. Approved fields are protected by a SHA-256 digest of the pre-ledger body.

**The boundary that matters:** `ki batch` provides file mechanics around an approval that already exists. It does not select work, infer authority from a conversation, run an agent, change roadmap lifecycle, accept or prune items, push, or release. `--approved` records an assertion the caller supplied; it does not prove approval. That refusal is the guide's whole reason for existing.

[The batch-records procedure at `v0.4.0`](https://github.com/knowledgeislands/tools-ki/blob/v0.4.0/docs/guides/batch-records.md) carries the command sequence and the on-disk record format.

## Acquiring Granola meetings

**You need this if** you want read-only meeting evidence from Granola brought into a registered repository as an acquisition package.

The adapter runs through a locally installed `mcporter` executable with a configured `granola` server, which you authenticate once beforehand. The installed harness must publish a verified `ki-acquire-granola` skill, and the repository must both select that harness and declare the skill — `ki acquire list` tells you where you stand.

**The boundary that matters:** acquisition passes `--no-oauth` on every provider call, so missing or expired credentials fail visibly rather than opening a browser mid-run. Tokens never enter repository configuration, staged documents, journals, or checkpoints. Imports are resumable, and the guide covers recovering an interrupted one safely.

[The Granola acquisition procedure at `v0.4.0`](https://github.com/knowledgeislands/tools-ki/blob/v0.4.0/docs/guides/granola-acquisition.md) covers activation, resumption, and reset disposition; the accepted behaviour is recorded in `tools-ki`'s acquisition specification.

## Standing knowledge intake

**You need this if** one repository should keep receiving a narrow class of knowledge from another, and raising an itemised trade for every capture is too much ceremony.

The receiving repository declares a subtype it owns — a name and a description of exactly what that class covers — and both sides declare a reciprocal grant. Captures then land with commit-pinned provenance: a full forty-character commit, a repository-relative source path, and an anchor.

**The boundary that matters:** the grant is reciprocal and neither repository gains authority to write into the other. The receiver owns the subtype vocabulary, and a subtype cannot be removed while a standing import still uses it.

[The standing-intake procedure at `v0.4.0`](https://github.com/knowledgeislands/tools-ki/blob/v0.4.0/docs/guides/standing-knowledge-intake.md) has the declaration sequence; the command contract is specified as TRADE-009 through TRADE-011.

## Territory selection

**You need this if** you want to run a command, or open an editor, across every repository in a territory rather than one at a time.

A Capital's `territory_members` is the one membership roster. `ki territory list` shows the registered handles, `ki territory show -t ki` resolves one territory and `--estate` selects every registered repository; repeated `-f` prefixes narrow either scope by directory name. Supported repository commands take the same selectors, as in `ki repo -t ki -f tools- audit`, and `ki territory roots --null` hands other tools a buffered, NUL-delimited root list.

**The boundary that matters:** selection grants nothing. A territory scope decides which checkouts a command runs in, not what it may do there, and a missing registration or unavailable selected root fails before any operation runs. `ki territory open` and the read-only `ki territory inspect` act on local editor state only.

[The territory-selection procedure at `v0.10.0`](https://github.com/knowledgeislands/tools-ki/blob/v0.10.0/docs/guides/user/territory-selection.md) covers verification and recovery.

## Where these sit

All six are operator workflows — things you do to a machine, or between repositories, rather than inside one. The day-to-day surface is elsewhere: [every `ki` command](/docs/ki/commands/) is the inventory, and [how the command groups divide](/docs/ki/command-groups/) is what each group is for. The rest of `ki`'s guides are listed on [the project's page](/projects/ki/).
