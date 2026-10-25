---
title: Tending
description: The two tracks and nine levels of a tending pass, how each level picks up the one below, the focus rule, what a pass may change and what it only reports, and the light report it ends with.
order: 10
permalink: /docs/ways-of-working/tending/
sources:
  - repository: knowledgeislands/ki-principal
    path: +/_WORK/ki.ways-of-working/design/tending.md
    ref: f3297dcb635ea7c2b3202084c4b613243fa95a14
    governs: 'The structural and PMO tracks, their levels and what each looks at, how captures move upwards, the running-pass rules, the focus rule and its six dispositions, and the report'
    reviewed: '2026-10-25'
  - repository: knowledgeislands/ki-agentic-harness
    path: skills/keystone/ki-repo/references/mode-review.md
    ref: 8897008fcee7b2c71a22115735ed038efccf7f32
    governs: 'The review lenses that the structural track reads at its third level'
    reviewed: '2026-10-25'
---

# Tending

Tending is the regular pass that keeps a territory's repositories in shape and its work in the right place, done now and burnt down inside the pass rather than turned into work for later.

> **Interim.** This practice is in use, and its standard home is not yet chosen.

{% figure "tending-tracks", "The two tracks: four structural levels that ask whether each repository and the territory are in shape, and five PMO levels, worked bottom up, that ask whether the work is in the right place." %}

## What it is

A territory accumulates small drift: a check that has started to warn, a link that no longer resolves, a record that is done but still open, a work package carrying a line that is really a roadmap record, a Project whose description now overlaps its neighbour. None of these is work worth planning on its own. Tending is the practice of reading the whole estate on a regular pass, fixing what is small on the spot and giving everything else exactly one disposition.

The pass runs in two tracks, which look at the same estate from two sides:

- The **structural track** asks whether each repository, and the territory as a whole, is in the shape its standards and purpose expect. It has four levels, from everyday mechanical checks to a master territory checklist.
- The **PMO track** asks whether the work is in the right place: what is in flight, what is recorded, and whether the Projects and themes that classify it still fit. It has five levels, worked bottom up from work packages to the territory overall.

Both tracks are judgemental above their first level. The first structural level uses the rubrics and tooling that already exist; every other level is a person or an agent reading and deciding, with no rubric and no new tooling.

## How it works

The structural track runs before the PMO track in each repository, so that the PMO track judges records and packages that already pass their checks.

| Track | Level | What it looks at |
| --- | --- | --- |
| Structural | 1 Mechanical audit and conform | each repository's own declared checks, its position against its upstream, and whether every cross-reference resolves |
| Structural | 2 Judgement audit and conform | the judgement items of the declared skills, and whether each opt-in, maturity and orientation claim is true |
| Structural | 3 Master repository checklist | whether the repository meets its needs and fulfils its place, through the review lenses: purpose, governance, naming, documentation, necessity, structure, contracts, human use, security, dependencies, release, duplication, tests and scripts, with lenses that do not apply skipped |
| Structural | 4 Master territory checklist | what no single repository can see: whether every record names a Project or theme that resolves, sits where it is delivered, and whether the territory's members and baseline agree |
| PMO | 1 Work packages | that each active Project has exactly one package, that each package's lines are live and are not really records, ideas or done |
| PMO | 2 Roadmap records | that each open record is still live, in the repository that delivers it, under a named Project or theme, carrying the fields its standard requires |
| PMO | 3 Projects | that each Project is a finite outcome whose records cover it, with a clear description distinct from its neighbours |
| PMO | 4 Themes | that each theme is used, distinct and still the right direction for the work that names it |
| PMO | 5 The territory overall | whether the territory has the themes and Projects it needs, with every change put as a query for the owner |

Each level picks up the captures of the one below, so nothing captured in a hurry stays in the wrong place:

1. A structural level captures in the best place it knows: the repository it is reviewing and the Project or theme the work seems to belong to.
2. PMO level 1 picks up anything a package holds that is really a record, an idea or done.
3. PMO level 2 re-reads every captured record and moves it if another repository delivers it or another Project owns it.
4. PMO level 3 checks the captures against each Project's outcome and turns gaps into candidates.
5. PMO level 4 checks captures that name a theme directly and those that strain a theme's direction.
6. PMO level 5 reads everything above and brings structural change to the owner.

The **focus rule** governs every item a pass turns up: do now what is needed now, and burn it down inside the pass. Tending does not load work packages with lines, and it does not turn every item into a roadmap record. Each item gets exactly one disposition:

- **Fix now.** A small change in its owning repository, made by the pass's own run under that repository's gates.
- **Record.** Bigger work, captured as a triage record in the owning repository, naming its Project or theme. The run proposes the record as a candidate; the owning work's coordinator writes it.
- **Idea.** A thought worth keeping that is not yet work, written as a dated `Idea:` line in the Notes of the Project or theme it belongs to.
- **Message.** A line to an existing work package that owns the item. A line never waits for a package that does not exist; such an item becomes a record or an idea instead.
- **Drop.** Recorded in the decisions log with its reason, such as already done or duplicated.
- **Query.** Only where the owner must choose, such as closing a record, closing a Project or changing canonical knowledge.

A level's report is as light as its outcome allows. "Fixed X" is a complete report, and so is "nothing to tend". It names what was fixed, the dispositions it gave and any query for the owner, with no counts, no per-lens sections and no narrative. Where a report shows a record's size it uses a T-shirt label in capitals, 👕 S, 👕 M, 👕 L or 👕 XL.

## How you use it

{% figure "tending-pass", "One tending pass as it runs: the owner sets the focus, one run per repository takes the lower levels, the territory run takes the upper ones, every item gets one disposition, and the report is as light as the outcome allows." %}

Mara owns the fictional island of Tern Holm, which has a principal repository, a harness and two websites. On a quiet morning she asks her coordinating session for a tending pass. The coordinator launches one run per repository, each taking the first three structural levels and the first two PMO levels together, so the four runs work in parallel. Each takes about ten minutes.

The run on the harness finds two warnings from its mechanical checks and fixes them in place: that is Fix now, committed under the harness's own gates. It finds a skill still declared as a dependency of an opt-in the island removed last month, and fixes that too. Its level 3 pass through the review lenses finds the documentation describing a command that was renamed; this is bigger than the pass can give it, so it proposes a triage record for the coordinator to capture. Its report reads: "Fixed two warnings and the orphaned dependency. Record candidate: refresh the command documentation."

The run on the principal repository finds three lines in a work package that are really one roadmap record, and one record marked in progress whose work was finished a fortnight ago. The package's own owner trims the lines; the finished record becomes a close candidate, which only Mara may decide. Both websites report "nothing to tend".

When the four runs are back, the coordinator runs the territory levels itself: the fourth structural level, which reads the four reports rather than repeating them, and the top three PMO levels. It finds that the same broken link was waiting in two packages, collapses it into one message to the package that owns the fix, and notices that two Projects now describe the same outcome. That goes to Mara as a query with a recommended option, because nothing is opened, closed, merged or renamed without her.

Mara's report that morning is short: what was fixed, one record candidate, one close candidate and one query. The rest of the estate was read and found in order, and says so in a line.

## What it provides

- **Drift caught while it is small.** Warnings, dead links, stale fields and misplaced lines are fixed in the pass that finds them, under the owning repository's own gates.
- **Nothing parked.** Every item leaves the pass with one disposition, so there is no growing list of things to look at later.
- **Work in the right place.** Captures move upwards through the PMO levels, and a record that was captured in a hurry is moved to the repository and Project that own it.
- **The whole estate seen at once.** The territory levels catch what no single repository can, such as one fix waiting in several packages.
- **A report you can read in a minute.** "Fixed X" and "nothing to tend" are complete reports, and the queries that need you carry a recommended option.

## Boundaries

A pass changes only what it may. It fixes small things in a repository it is tending, under that repository's gates, and it commits only its own paths. Where several work packages share one repository, conform runs skill by skill rather than over the whole repository, so one run's formatter never rewrites another package's files. In a repository the run may not change, such as a deploy repository whose pushes are the owner's, or a package another coordinator runs, its fixes go as one collapsed message to the package that owns them, not as one query each. A run may carry out a line held in another package only when that line's decision is already logged and the fix lies in the repository the run is tending.

A pass reports rather than acts on anything that needs the owner's choice: closing or cancelling a record, closing or merging a Project, changing a theme or canonical knowledge. A run proposes a record as a candidate and does not write it; the coordinator captures it. Under a brief that bars remote calls, the mechanical level leaves out the checks that need a remote and names them as not run.

A level with nothing to read is skipped without a line, and one disposition that applies to many items is given once, with the items listed. Tending is not a replacement for planning work: anything that needs more thought than the pass can give it becomes a record and is planned in the usual way.
