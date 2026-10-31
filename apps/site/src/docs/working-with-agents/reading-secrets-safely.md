---
title: Reading secrets safely
description: How background agents read a password or key from 1Password through a cached reader, at most once a day per item, and stop rather than prompt you when they cannot.
order: 6
permalink: /docs/working-with-agents/reading-secrets-safely/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/governance/ki-delegation/references/standards-background-runs.md
    ref: 28fdc492d25435198ea8d93d605dfbd5e69cb7f3
    governs: 'The cached 1Password reader rule and its stop condition'
    reviewed: '2026-10-31'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.prj.ways-of-working/decisions.md
    ref: 34e2f7d4ff5f849be96f6666e5eff4d25eb7050b
    governs: 'The owner setting the rule that agents use the cached reader'
    reviewed: '2026-10-31'
---

# Reading secrets safely

After reading this page you can give a background agent a task that needs a password or key from 1Password without it flooding you with approval prompts, reading the same secret over and over, or leaving it in a log.

## The problem

1Password's command-line tool is built for a person at a keyboard. A read may pop up a desktop approval prompt. A background agent that calls it directly, again and again, either interrupts you with prompts you did not expect or stalls waiting for an answer nobody will give, and it fetches the same secret many times over.

## The rule

In this environment, background agents never call the 1Password tool directly. When a task authorises reading a secret, the agent reads it only through a small **cached reader** that the owner's managed setup installs:

- **It reads only when the task says so.** A brief has to authorise a 1Password read explicitly; without that, the agent reads nothing. The rule itself grants no access to anything.
- **It goes through the cache.** The reader keeps each item for a day, so however many runs need the same secret, the cost is at most one real read per item per day.
- **It uses the non-interactive route.** The reader is told to use only the account meant for automation, never the owner's own sign-in, so it never needs a desktop prompt.
- **It stops rather than asks.** If the reader cannot get the secret without a prompt, the agent stops and reports. It does not fall back to an interactive read, and it does not try a different way in.
- **It finds items by tag through the same reader**, rather than by listing the vault directly.
- **It leaves the cache to the owner.** Refreshing or clearing the cache is the owner's job, not an agent's.

One further rule goes with it: a secret's value never appears in an agent's output, its report or any file Git tracks.

## Why it is shaped this way

Each part closes one way a background agent could go wrong while nobody is watching. The cache stops repeated reads, the automation-only route stops surprise prompts, and stopping on failure means an agent that cannot get a secret simply says so, rather than finding a less safe path to it. The owner set the rule in a single line: agents should be using the cached reader.

## What this gives you

- Background work that can use secrets without interrupting you.
- At most one real read per secret per day, however many agents need it.
- A clear failure, in the agent's report, whenever a secret is not available, rather than a silent workaround.

The [last page](/docs/working-with-agents/running-agents-under-orca/) looks at running these agents inside Orca, an app built for watching many agents at once.
