---
title: Codex skill discovery
order: 5
description: Work around the absence of automatic skill discovery in Codex, and understand what the experiments in that space are actually offering.
sources: original
---

# Codex skill discovery

Skills are activated explicitly in some runtimes and discovered automatically in others, and Codex is in the first group. That is a real gap when a repository carries dozens of skills and an agent has to be told which one applies. This page covers what closes the gap today and what is being tried, so the difference between a working arrangement and an experiment stays visible.

The `skills` command-line tool can install third-party skills into a user's Codex skill directory. These are personal, user-scope additions: they do not become part of a governed repository or alter its declared KI skill set. Review a skill's source and behaviour before adding it, especially if it installs hooks or changes agent instructions.

## Caveman in Codex

[Caveman](https://github.com/JuliusBrussee/caveman) is an optional agent-local response-compression skill, not a model-traffic proxy or a KI backpack dependency.

Use it as a narrow Codex trial first:

```bash
npx skills add JuliusBrussee/caveman -a codex
```

Start a new Codex session after installation, then activate it explicitly with `/caveman lite` for ordinary work.

Use `/caveman full` only when terse output remains clear for the task.

Use `normal mode` or `stop caveman` to return to normal output.

The documented integration is Codex CLI.

For ChatGPT or Codex Desktop, treat availability in a fresh session as an acceptance test rather than assuming the installed Codex skill transfers to that surface.

Keep Headroom as the only request proxy.

Caveman does not route model requests through Headroom, and it cannot make ChatGPT or Codex Desktop traffic appear in Headroom's coverage.

Continue to prove a Headroom route with its proxy statistics or logs as described in [Coverage by runtime](/docs/optional-tools/headroom-ai/#coverage-by-runtime).

Do not add a Caveman-to-Headroom proxy chain, `caveman-shrink`, Cavemem, or Caveman Code as part of this trial.

No chezmoi change is required for an individual trial.

If the skill proves useful enough to standardise across machines, add a narrow, reviewable chezmoi profile with an explicit version, target runtime, and removal path; do not capture generated Codex state or install it for every runtime.

To add the `find-skills` discovery skill:

```bash
npx skills add vercel-labs/skills@find-skills
```

Start a new Codex turn after installation so the newly installed skills are available for selection.
