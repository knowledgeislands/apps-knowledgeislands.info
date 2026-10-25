---
title: Use skills
description: How a skill actually fires — by trigger or by slash command — how to find the one you want, and what to do when the wrong one loads.
permalink: /docs/ki-agentic-harness/using-skills/
order: 7
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/README.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'Skill names, trigger descriptions, argument hints, and the invocation forms a runtime accepts'
    reviewed: '2026-10-25'
---

# Use skills

Once a skill is active in the right scope, there is nothing to import, configure, or remember. The agent loads it on demand. This page is about the demand: how it is expressed, how the agent decides, and what to do when it decides wrongly.

## The two ways a skill fires

**By trigger.** Describe the task in plain language. The agent matches your request against each available skill's `description` — specifically the part that says _when_ to use it — and loads the one that fits.

> "Audit the M365 MCP against our standard"
>
> "Save this to my notes"
>
> "What should I work on next?"

None of those name a skill, and all three reliably load one. This is the normal way to work, and it is why the descriptions are written as trigger conditions rather than as summaries.

**By slash command.** Type `/<skill-name>` to invoke one directly, optionally with arguments:

```text
/ki-repo-mcp audit ~/kis/knowledgeislands/mcp-gsuite
```

Use this when you want certainty about which skill runs, or when you want a specific mode of a skill that has several.

## Finding the name

The slash command needs a name, and three routes get you one:

- **[Choose a skill by outcome](/docs/ki-agentic-harness/skills-by-outcome/)** — a routing table from a plain-language goal to the smallest capability that serves it. Start here when you know the result you want.
- **[The skill catalogue](/docs/ki-agentic-harness/skill-catalogue/)** — every published capability, grouped by domain, with what each governs. Start here when you are browsing rather than aiming.
- **`ki manage search <query>`** — searches only what is _installed on your machine_, matching case-insensitively against harness identifier, capability kind, and capability name. Start here when you want to know what you actually have rather than what exists.

The third is the one people forget. A skill in the catalogue is not necessarily a skill you can invoke; it has to come from a harness you installed and be active in a scope that applies.

## Arguments and modes

A skill that takes modes advertises them in its `argument-hint` frontmatter, which your runtime shows as you type the slash command. For example `ki-repo-mcp` lists:

```text
audit <repo> | conform <repo> | educate <repo> | help | refresh
```

The words before each `<...>` are the modes; the rest is what to pass. Many governance skills share this shape — `educate` explains, `audit` checks, `conform` repairs — which is worth internalising once because it then transfers to every skill that has it.

The hint is a hint, not a parser. Everything you type after the skill name reaches the skill as free text, so a plain-language phrasing of the same request works just as well as the canonical form. `/ki-repo-mcp check the gsuite server` and `/ki-repo-mcp audit ~/kis/knowledgeislands/mcp-gsuite` both get there.

## When the wrong skill loads

Trigger matching is judgement, so it is occasionally wrong. Three fixes, in order of how often they are the answer:

1. **Name it.** Switch to the slash command. This is not a workaround — it is the mechanism provided for exactly this case.
2. **Say what you want done, not what you want used.** Triggers match on task descriptions. "Review this against the Markdown standard" matches better than "use the authoring thing", because the former resembles the `description` the skill was written with.
3. **Check it is there at all.** `ki manage search <name>` tells you whether the skill is installed; `ki repo diag` tells you whether this repository declares it. A skill that never fires is more often inactive than mismatched.

## Why usage is not documented per skill

Each `SKILL.md` documents what its skill governs, not how to invoke it. That is deliberate and worth knowing, because it explains an absence you will notice.

A skill's `description` documents _when_ it fires and its `argument-hint` documents _what modes it has_ — and both are machine-read at selection time, which is to say they are already doing their job at the moment they matter. How to invoke _any_ skill is a property of the agent runtime, not of a skill, so it is written once, here, rather than repeated sixty-one times with sixty-one opportunities to drift.

## Related

[Skills and journeys](/docs/ki-agentic-harness/skills/) explains what a skill contains and how the two kinds — governance and process — differ. [Install and get started](/docs/ki/getting-started/) covers activating one in the first place. [Tuning](/docs/ki-agentic-harness/tuning/) covers shaping how an agent behaves once the skills are in place.
