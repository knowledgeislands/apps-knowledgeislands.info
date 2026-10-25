---
title: Harnesses
description: What a compatible harness packages, how one arrives on your machine verified, and why installing it changes nothing about your repositories.
permalink: /docs/ki-agentic-harness/installing-a-harness/
order: 2
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.4.0
    governs: 'The bootstrap and harness commands, their arguments, and their refusals'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/tools-ki
    path: docs/decisions/ADR-KI-TOOLS-002-compatible-harness-registry-and-native-operations.md
    ref: v0.4.0
    governs: 'The compatible-harness registry, verified installation, and native operation resolution'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-012-compatible-harness-publication-and-governed-rubric-boundary.md
    ref: 7dcee9dc3aa33c863c77cb56d1bab762d026dbbb
    governs: 'What a harness may publish and the boundary between publication and governance'
    reviewed: '2026-09-22'
---

# Harnesses

A **compatible harness** is a published, versioned package of agentic capability — skills, subagents, hooks, and the reference material they carry. It is the supply side of Knowledge Islands. Nothing else in the ecosystem originates capability content: the `ki` CLI installs harnesses and runs what they register, and a repository declares which of their capabilities govern it.

This page is about getting one onto your machine and knowing what you have. [The capability lifecycle](/docs/ki/capability-lifecycle/) is about the separate decision of activating something from it.

## What a harness contains

Three kinds of thing, and the distinction matters when you go looking for something:

- **Skills** — the bulk of it. A governance skill holds a standard and registers the operations that check and repair against it; a process skill drives a lifecycle you invoke. [Skills and journeys](/docs/skills/what-a-skill-is/) explains the difference, and [the catalogue](/docs/skills/catalogue/) lists every published one.
- **Subagents and hooks** — runtime material that a supported agent picks up once the harness is installed and the capability is active.
- **Registered operations** — the executable side of a governance skill. These are what `ki repo audit` and `ki repo conform` resolve and run; they exist only inside a harness payload with integrity evidence behind it.

A harness also declares which capability _prefixes_ it owns. That is how two installed harnesses are prevented from both claiming to supply `ki-authoring`, and it is why a bare skill name is usually enough to resolve a provider.

## The canonical harness

`knowledgeislands/ki-agentic-harness` is the canonical harness: it is what `ki bootstrap` installs, and it supplies the core user skills — `ki-bootstrap`, `ki-next`, `ki-plan`, `ki-recap` — that an installation needs to describe itself.

```bash
ki bootstrap
```

That one command detects which agent runtimes are present on your machine, creates the KI configuration if it is not there, installs the canonical harness, and links those core user skills into each detected runtime's user skill space. Existing agent configuration is reused rather than replaced.

Because it underpins the rest, the canonical harness cannot be uninstalled. An installation without it could not report what it has.

Run `ki bootstrap --refresh` later, when you install a new agent runtime or want the recorded inventory reconciled against what is actually on disk.

## Installing another harness

```bash
ki harness list                     # what is installed
ki harness info <harness-id>        # one harness's capability inventory
ki harness install <harness-id>     # make a configured harness's capabilities available
```

A harness is addressed by identifier in `owner/name` form. These commands never take a skill name — a lifecycle operation acts on a whole payload, not on part of one.

`install` acquires a **configured** harness: one the installation knows about, from immutable published release evidence rather than from whatever a branch currently holds. The payload is verified and its capability inventory is recorded before it is installed, so two machines installing the same harness at the same release get the same thing.

**Installing activates nothing.** A freshly installed harness sits on your machine available and inert until you declare one of its capabilities in a scope. That separation is deliberate and is covered in full, with the refusals that protect it, in [the capability lifecycle](/docs/ki/capability-lifecycle/).

## Keeping one current, replacing one, removing one

```bash
ki manage outdated                  # what is behind, changes nothing
ki manage update                    # refresh every installed harness
ki harness reinstall <harness-id>   # replace one from its verified archive
ki harness uninstall <harness-id>   # remove one non-canonical harness
```

`reinstall` replaces a harness only after the replacement archive passes integrity and capability inspection, so a corrupted archive — or one that would silently drop a capability you are using — cannot take the place of a working one. [Update and upgrade](/docs/ki/update-upgrade/) covers the difference between refreshing your machine and refreshing one repository's providers.

`uninstall` removes a harness whose payload directories `ki` recognises. It refuses if the harness supplies an active user skill: the declaration would be left pointing at nothing. Remove the skill first with `ki skill remove`, then uninstall.

`ki manage missing` is the complementary report — user capabilities you have declared for which no installed harness provides a payload. That is a declaration problem, and no amount of updating fixes it.

## Developing a harness

If you are changing a harness rather than consuming one, `ki` can point an installed harness at a working tree:

```bash
ki dev local set <harness-id> <local-harness-path>
ki dev local on  [harness-id]
ki dev local off [harness-id]
```

While a harness is development-linked, operations resolve from your checkout instead of from the verified archive — which is the point, and also why a linked harness refuses to be reinstalled until `ki dev local off` reinstates the archive. `ki dev skill rubric <skill>` renders the rubric a skill registers, which is the fastest way to see what an operation will actually check.

## Checking the state of things

```bash
ki manage list      # harnesses, capabilities, user skills, registered repositories
ki manage doctor    # environment health, with a recovery route per finding
ki manage diag      # installation mode and the four resolved paths
```

`doctor` is the one to reach for when something is not behaving: it checks the configuration, the agents it found, the installed harnesses and the user-skill links, and says what to do about anything broken. [Local utility commands](/docs/ki/local-commands/) covers the inspection surface in full.

## Related

[Install and get started](/docs/ki/getting-started/) is the end-to-end first run. [Govern a repository](/docs/ki-agentic-harness/repositories/) is the other half of setup — declaring what applies where. [Every `ki` command](/docs/ki/commands/) is the full inventory, taken from the tool's own manual.
