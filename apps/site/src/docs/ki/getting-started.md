---
title: Install and get started
description: A first-run walkthrough from installing the CLI to a repository that audits clean, with a check to run and a recovery route at each step.
permalink: /docs/ki/getting-started/
order: 1
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.4.0
    governs: 'The bootstrap, skill activation, and repository operation commands the walkthrough runs'
    reviewed: '2026-09-22'
  - repository: knowledgeislands/ki-agentic-harness
    path: docs/decisions/ADR-KI-HARNESS-012-compatible-harness-publication-and-governed-rubric-boundary.md
    ref: 7dcee9dc3aa33c863c77cb56d1bab762d026dbbb
    governs: 'Which harness a repository selects and what activation means'
    reviewed: '2026-09-22'
---

# Install and get started

Five steps, about ten minutes, ending with one repository that audits clean. Each step has a command that proves it worked, so you find out immediately rather than three steps later.

## 1. Install `ki`

Homebrew is the recommended route, because it owns upgrades and removal:

```bash
brew install knowledgeislands/tap/ki
```

The alternative is the installer endpoint, which redirects to the installer published at the exact version this site advertises:

```bash
curl -fsSL https://knowledgeislands.info/install/ki | sh
```

**Check it worked:**

```bash
ki --version
ki manage diag
```

`diag` prints the installation mode and the four paths in force. Note the installation mode — it decides later whether `ki manage update` can update the binary itself. A Homebrew installation deliberately cannot, and `brew upgrade` is the route instead.

## 2. Bootstrap your user environment

```bash
ki bootstrap
```

This detects which agent runtimes are installed on your machine, creates the KI configuration, installs the verified canonical harness `knowledgeislands/ki-agentic-harness`, and links the core user skills — `ki-bootstrap`, `ki-next`, `ki-plan` and `ki-recap` — into your agent's user skill directory. Existing agent configuration is reused rather than replaced.

**Check it worked:**

```bash
ki manage doctor
```

`doctor` checks your configuration, the agents it found, the installed harnesses, and the user-skill links, and tells you what to do about anything broken. If it reports that no agent runtime was detected, that is the usual first-run surprise: `ki` configures agents it can see, so install your agent first and then run `ki bootstrap --refresh`.

`--refresh` is also the command for later, when you add an agent or want the recorded inventory reconciled against reality.

## 3. Declare a repository

A repository joins Knowledge Islands by having a `.ki.toml` at its root. If it does not have one yet:

```bash
cd path/to/repository
ki repo init \
  --repository https://github.com/example/example \
  --title "Example" \
  --description "What this repository is for." \
  --repo-code EXAMPLE \
  --runtime claude \
  --visibility public
```

This declares identity for exactly one existing Git worktree root and registers that root in your machine-local registry. It does not create a Git repository — the worktree must already exist.

**Check it worked:**

```bash
ki repo diag
```

## 4. Activate a skill in the right scope

Scope is the decision, and it is not subtle: **user scope is about you, repository scope is about the codebase.**

```bash
ki skill add ki-recap              # user scope: how you work, everywhere
ki repo skill add ki-authoring     # repository scope: what governs this code
```

Use a **bare skill name**. Harness-qualified keys such as `knowledgeislands/ki-agentic-harness:ki-authoring` are invalid — the provider is declared once under `[repo]` in `.ki.toml`, and the skill is declared by name under `[skills]`. A bare name resolves when exactly one installed harness provides it; if two do, the command stops rather than guessing.

Add `--replace` to overwrite an existing declaration rather than fail on it, and `--repo <path>` to act on a repository other than the one you are standing in.

Not sure which skill you want? [Choose a skill by outcome](/docs/skills/by-outcome/) routes a plain-language goal to the right one, and [the catalogue](/docs/skills/catalogue/) is the full inventory.

**Check it worked:**

```bash
ki repo diag
```

It should now list the skill you declared, with healthy projections.

## 5. Run the governance

Three commands, in increasing order of consequence:

```bash
ki repo educate    # explains what the declared skills expect. Changes nothing.
ki repo audit      # runs their read-only checks. Changes nothing.
ki repo conform --dry-run   # reports the repairs it would make.
ki repo conform             # applies them.
```

`educate` first is worth the minute. It tells you what the skills you just declared actually expect, which is usually more useful than reading a list of failures and inferring the rule behind each.

`conform` stages its writes and re-audits before publishing them: if any selected repository's initial audit has a blocking finding, it aborts before anything is written. So a `conform` that fails leaves the tree as it was.

Narrow any of the three to one capability with `--skill <skill>` when a repository declares several and you are only interested in one.

**You are done when** `ki repo audit` exits clean. That means the operations registered by the skills this repository declared all passed — no more and no less.

## If something is already there

Two situations come up often enough to name.

**An existing `.ki/` directory.** Repository-vendored `.ki/` state is migration evidence from an older layout, not an execution fallback — the host never runs anything from it. Leave unfamiliar legacy state in place until its native replacement is proven rather than recreating it or removing it piecemeal.

**A skill that needs a harness you do not have.** Install the harness first, then declare the skill:

```bash
ki harness install <harness-id>
ki harness info <harness-id>       # see what it actually ships
```

Installing makes capabilities available for explicit activation; it activates nothing on its own. [The capability lifecycle](/docs/ki/capability-lifecycle/) covers why, and the refusals that protect it.

## Where to go next

- [Use skills](/docs/ki-agentic-harness/using-skills/) — how a skill actually fires once it is active, which is the part that changes your day.
- [Onboard a repository](/docs/ki-agentic-harness/onboarding/) — the trust, activation, CI, and migration boundaries in full.
- [How the command groups divide](/docs/ki/command-groups/) — what each group of commands can change, and [every command there is](/docs/ki/commands/).
- [Optional tools](/docs/optional-tools/) — machine-level additions such as chezmoi and mcporter, and whether you need them.
