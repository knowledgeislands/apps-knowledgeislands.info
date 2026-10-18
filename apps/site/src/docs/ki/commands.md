---
title: Every ki command
description: The complete ki command reference, grouped by operational scope, vendored from the tool's own manual at a pinned release.
permalink: /docs/ki/commands/
order: 4
sources:
  - repository: knowledgeislands/tools-ki
    path: man/ki.1
    ref: v0.11.0
    governs: 'The whole inventory below, vendored from the manual''s COMMAND GROUPS and SYNOPSIS sections rather than restated'
    reviewed: '2026-10-18'
---

# Every `ki` command

All {{ cliCommands.counts.commands }} commands, in the {{ cliCommands.counts.groups }} groups the CLI itself divides them into. The groups are ordered by scope: what affects your machine, then what affects one repository, then what affects the estate.

This inventory is **vendored, not rewritten**. `ki` ships a manual page, and this page takes it verbatim from `{{ cliCommands.source.ref }}` — every invocation and every description below is the tool's own text, parsed rather than paraphrased. A command renamed, added, or withdrawn upstream cannot leave this site describing one that is not there.{% if cliCommands.counts.omittedGroups %} The parse reads both of the manual's inventories and reconciles them, because at this release they disagree: one group appears in the synopsis and not in the reference section. It is published below, marked.{% endif %}

What the site adds is the routing around it. If you do not know which command you want, [the CLI overview](/docs/ki/command-groups/) explains what each group is for and which concept page covers it. If you know the outcome but not the mechanism, [choose a skill by outcome](/docs/ki-agentic-harness/skills-by-outcome/) may be the better starting point, because much of what `ki` does is activate a capability rather than perform the work itself.

## Reading an entry

An invocation is written the way the manual writes it. `<angle-brackets>` mark a value you supply, `[square brackets]` mark an optional part, `|` separates alternatives, and `...` marks a repeatable option. `[repo-options]` stands for the repository selectors in the Repository options group, which any `ki repo` command accepts.

The version you have installed is the authority on exact grammar. `ki --help` and `ki <command> --help` answer from your binary; this page answers from `{{ cliCommands.source.ref }}`, which is the release this site currently advertises.

<!-- The `safe` filters below are correct rather than lax, for the reason given on the skill catalogue: this template emits Markdown that Eleventy then renders and escapes, so letting Nunjucks escape first would double-escape every placeholder and reach the reader as `&lt;harness-id&gt;`. The values come from a strict parse of a pinned tag in this organisation's own tool. -->

{% for group in cliCommands.groups %}

## {{ group.name }}

{% if group.omittedFromReference %}The manual's reference section does not carry this group. These entries come from its synopsis instead, which lists them with a shorter description and no statement of what the group is for. That is an omission upstream rather than a choice here, so the group is published with the note rather than left out.{% else %}{{ group.purpose | safe }}{% endif %}

{% for command in group.commands %}

### `{{ command.command | safe }}`

{{ command.description | safe }}

{% endfor %}

{% endfor %}

## What this page cannot tell you

An inventory says what exists, not when to reach for it. The commands that carry a real decision have a page of their own: [the capability lifecycle](/docs/ki/capability-lifecycle/) for `harness` and `skill`, [update and upgrade](/docs/ki/update-upgrade/) for keeping an installation current, [local utility commands](/docs/ki/local-commands/) for the inspection surface, and [the ChatGPT capture format](/docs/ki/chatgpt-local-capture/) for the one import adapter with a format of its own.

It also says nothing about exit codes, configuration file locations, or the environment variables `ki` reads. Those are in the same manual, under sections this page does not vendor, and `man ki` on a machine with the tool installed is the fastest way to them.
