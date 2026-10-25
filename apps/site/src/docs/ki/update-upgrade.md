---
title: Update and upgrade
description: Which of the two refresh commands you want, what each one verifies before changing anything, and why some installations are deliberately excluded from self-update.
permalink: /docs/ki/update-upgrade/
order: 6
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.13.0
    governs: 'The update and upgrade commands and the verification each performs'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/tools-ki
    path: docs/decisions/PDR-KI-TOOL-KI-001-installer-version-pinning.md
    ref: v0.13.0
    governs: 'Why the installer pins an exact release and what a receipt records'
    reviewed: '2026-10-25'
---

# Update and upgrade

Two commands refresh things, and the names are not interchangeable.

| Command | Scope | Refreshes |
| --- | --- | --- |
| `ki update` | Your machine | The installed harnesses, and the `ki` executable itself where it may. |
| `ki repo upgrade` | One repository | The harness providers that repository's declarations select. |

Neither activates or deactivates anything. A refresh changes _which version_ supplies a capability, never _whether_ it applies - that stays with [the capability lifecycle](/docs/ki/capability-lifecycle/).

## `ki update`

```bash
ki update          # harnesses, and the executable if it is eligible
ki update --cli    # require the executable update to succeed
```

This refreshes every installed harness against configured immutable release evidence. "Immutable" is doing real work in that sentence: a harness advances to an exact published release, not to whatever a branch currently holds, so two machines running the same update land on the same payload.

Every capability the refreshed harness currently supplies is retained. That is what makes the command safe to run without auditing your declarations first - existing user and repository skill links remain valid afterwards, because a replacement that would drop a capability in use is refused before anything changes.

### When the executable updates itself

`ki update` also updates the `ki` binary, but only when the running executable matches the installer receipt written by a verified `install.sh` installation. If you installed through the [stable installer endpoint](/projects/ki/), that is your case.

If not, self-update is deliberately skipped, and the two exclusions are the common ones:

- **Homebrew installations.** Homebrew owns upgrades and removal for anything it installed. A tool that wrote over its own Homebrew-managed binary would leave the formula describing a version that is not there. Run `brew upgrade knowledgeislands/tap/ki` instead.
- **Linked development checkouts.** The binary is being built from a working tree you control. Replacing it with a release would discard whatever you were working on.

`--cli` makes the executable update a requirement rather than an opportunity: the command fails rather than quietly refreshing only the harnesses. Reach for it in a script, where a partial refresh that reports success is worse than a clear failure.

## `ki repo upgrade`

```bash
ki repo upgrade                  # the repository containing the current directory
ki repo upgrade --repo <path>    # one named explicitly
```

This reads one repository's declared skills, resolves which harness supplies each, and refreshes those distinct harnesses - again, only against configured immutable evidence.

The resolution step is where it refuses. A provider must resolve _uniquely_: if two installed harnesses both supply a declared skill, the command stops rather than choosing. So does an unavailable provider, and so does a replacement that would remove a capability the repository still declares. All three refusals happen before any provider changes, so a failed upgrade leaves the repository exactly as it was.

Like `update`, it changes neither user nor repository skill activation.

## Which one do you want

**Everything is behind, or you have not updated in a while.** `ki update`. It is the broader command and the usual answer.

**One repository's checks are behaving oddly, or its declarations changed.** `ki repo upgrade`, then `ki repo diag` to confirm the declarations and projections agree.

**You want to know whether anything is behind before touching it.** Neither. `ki harness outdated` reports installed harnesses against available release evidence and changes nothing. Note what it will not do: where it cannot compare against real evidence it says the evidence is unavailable, rather than reporting that you are current. Those are different facts and it refuses to conflate them.

**A skill you expect is missing rather than stale.** `ki harness missing` reports desired user capabilities with no installed provider - a declaration problem, which no amount of refreshing fixes.

## Related

[Local utility commands](/docs/ki/local-commands/) covers the rest of the inspection surface, including `diag`, `doctor` and `repair`. [Every `ki` command](/docs/ki/commands/) has the full inventory.

Use `ki update --help` and `ki repo upgrade --help` for the exact grammar your installed version supports.
