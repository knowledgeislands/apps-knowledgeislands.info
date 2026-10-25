---
title: Findings
description: What a finding is, how its table is carried in every report until it is settled, the dispositions that settle it and where a settled finding is homed.
order: 9
permalink: /docs/ways-of-working/findings/
sources:
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/change-management/ki-coordination/references/standards-coordination.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The Findings section of the owner report, the finding heading and its Goal, Scope and As of lines, carrying until settled and the findings folder in the work package'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.ways-of-working/design/findings.md
    ref: f3297dcb635ea7c2b3202084c4b613243fa95a14
    governs: 'What counts as a finding, the four dispositions that settle one, refreshing a finding and how findings and queries stay separate'
    reviewed: '2026-10-25'
---

# Findings

When you ask a coordinating session to find something out, the answer is a finding: a table or a short list that is repeated in full in every report until you say you are happy with it.

> **Interim.** This practice is in use, and its standard home is not yet chosen.

{% figure "finding-life", "A finding is opened by your request, carried in full through every report, settled at a mark or on your word, and then homed in the place that needs it or dropped." %}

## What it is

A finding is the output of an investigation you asked for: a survey, a comparison, an assessment or a plain table, whose purpose is to inform a judgement you have still to make. It is evidence, not an outcome. "The working areas were tidied" is Done, because something changed. "Here is each working-area folder, what it holds and what should happen to it" is a finding, because nothing has changed yet and you are being shown what there is.

Only your request makes a finding. A run's own observations, a tending pass's dispositions and the results of a check stay in Done or become queries, as they always have. Where you ask for findings in so many words, or ask "could you give me a table", that is a finding even if it turns out short.

A finding raises queries; it does not replace them. Each decision it calls for is a query of its own, in the usual Context, Query and Options shape, and the query's Context may point up to the finding by its tag because both sit in the same report.

## How it works

Each finding has a stable tag in capitals, in the same vocabulary as the tags you already use for needs, so you can settle it in speech: "REPO-ALIGN is fine". In a report it is a heading in the form `### <TAG> - <plain-language title>`, and it opens with three lines before any table:

| Line | What it says |
| --- | --- |
| **Goal** | the question asked, in your words where they exist, who asked it and when |
| **Scope** | what was looked at and what was not, in one line |
| **As of** | when the facts were last checked, so a refreshed finding shows that it is fresh |

Then comes the table or the short list, any footnotes beneath it, and one line naming the queries it raised.

The owner report carries a `## Findings` section whenever at least one finding is open, and leaves it out otherwise. It sits after In Progress and before Queries, so the report reads as what changed, what is running, what you asked to know, and what you must decide. A finding is carried in full, table and all, in every Summary, recap and full summary from the one that first gives it until it is settled. It is never pointed to by reference to an earlier reply.

Between reports a finding lives in the work folder as a file named `findings/<tag>.md`, holding exactly the text the report carries, goal first. The run that did the investigation writes it, or the coordinator copies it out of the run report when it receives the run. The file counts as part of the package read, so a fresh session or a session after compaction can restate the finding without searching for it.

## How you use it

Suppose Mara, who owns the fictional island of Tern Holm, asks her coordinating session which of the island's repositories are consistent with each other and what would bring them into line. The coordinator launches a read-only run. The run writes the finding as a file in the work folder, tagged REPO-ALIGN, with Mara's question as its goal, the four repositories and their settings as its scope, and the time it checked as its As of line. Beneath those lines sits one row per repository.

From the next Summary on, Mara sees the REPO-ALIGN table in full, under Findings, every time she asks for a report. Two of its rows raise queries, which appear under Queries with "see REPO-ALIGN above" in their Context. When a run fixes one of the differences, the coordinator has the finding refreshed: the As of line moves, and the dealt-with row says so in its last column rather than vanishing. The table never goes stale in her hands and never disappears before she has finished with it.

Mara settles the finding in one of two ways. She can say so at any time: "REPO-ALIGN is fine" settles it at once, and the words are read back in the decisions log like any answer. Or she strikes a mark, which settles every open finding as part of the mark unless she keeps one open. Answering the queries a finding raised does not settle it, because she may still want it in view, and settling a finding does not answer its queries, which stay open until she decides them.

## What it provides

- **A question answered in your words.** The Goal line keeps the question as you asked it, so the table is read against what you wanted to know rather than what the run happened to look at.
- **Evidence that stays in view.** The same table appears in every report until you are done with it, so you never have to find the reply that first carried it.
- **Freshness you can see.** The As of line and the row-level notes show whether the facts have moved since the finding was written.
- **A clean handover to decisions.** The queries a finding raises sit beneath it in the same report, each pointing up to its tag, and are decided separately.
- **A durable home for what was learned.** At settlement the finding is placed where it is needed, so the investigation is not repeated later.

## Boundaries

A finding is settled with one of four dispositions, recorded in the decisions log:

- **Homed in a record.** The finding is evidence for work, so its table goes into the work record that carries the work, or into that record's plan.
- **Homed in a design note.** The finding informs a design, so it goes into that note.
- **Homed in the decisions log.** The finding settled a question, so the decision entry quotes the answer and links the finding's last revision.
- **Dropped.** It has served its purpose, every query it raised is answered and nothing more needs it. The log says so in one line, and Git history keeps the file.

Once homed or dropped, the file leaves the work folder in the next tidy. A prompt the coordinator drafts for you to hand on is carried the same way, under the same section, in a fenced block you can copy whole, and is usually dropped once you have sent it.

Findings are not queries, and are not kept in the queries file: queries are decisions and findings are evidence. They are not design notes either, because a design note lives until it graduates, while most findings are settled within a day. A finding never substitutes for Done: what a run changed is still reported as Done, however it was found.
