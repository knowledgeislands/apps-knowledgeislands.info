# Docs sections

Everything this site publishes that teaches something lives in a **Docs section** — a finite sequence of pages with a first, a last, and an order somebody chose. This guide says where a page in a section lives, what binds it there, what it has to contain, and what `verify:docs` refuses.

The arrangement itself — why the teaching material is not filed under the project each page describes, and why a page's identity comes from its directory rather than from its own frontmatter — is decided by ADR-KI-WEBSITE-003.

## Where a page lives

```text
apps/site/src/docs/<section>/<page>.md   →   /docs/<section>/<page>/
```

`<section>` is a `slug` in [`src/_data/docsSections.json5`](../../../apps/site/src/_data/docsSections.json5), the registry the Docs landing grid is built from. The registry declares three things and no more — a slug, a title, a description — because everything else about a section is derivable from the pages in it, and a number nobody types is a number that cannot go stale.

A section must be declared to exist and must exist to be declared. `verify:docs` checks both directions: a slug in the registry with no directory renders a card for a section that is not there, and a directory missing from the registry renders pages nothing links to.

## What binds a page to its section

The directory, through a data file named after it:

```json5
// apps/site/src/docs/ki/ki.json5
{
  layout: 'layouts/page.njk',
  section: 'ki'
}
```

Every page beside that file inherits both keys, so a page added later is bound, styled, listed and given its way back up because of where it lives rather than because someone remembered three frontmatter lines. `section` keys the `docsPages` collection; `layout` gives the page its measure, its prose styling and its [provenance footer](prose-styling.md).

A section of hand-built Nunjucks landing pages declares only the binding, because such a page carries its own layout and its own containers. A section holding any Markdown must declare the prose layout, and `verify:docs` fails it otherwise.

A page's own frontmatter carries `title`, `description`, an optional `permalink`, its `sources` declaration, and `order` — the position it takes in its section.

`order` is required, must be a positive whole number, and must be one no other page in the section holds. It is not optional, because the alternative is a reading order that decays: an unpositioned page sorts last, so every page added without one appends itself, the sequence drifts toward the order things were written in, and nothing fails to say so.

## What a page has to contain

### It opens with a claim

Prose before the first `##`, saying what the reader will be able to do. At least 120 characters of it. A page that opens by describing itself — "this page summarises the material in X" — has told the reader nothing they can act on.

### It does not defer

Link text may not be a hand-off phrase: `the full guide`, `full guide`, `the full documentation`, `full documentation`, `see the README`, `see the docs`, `see the documentation`, `read more`, `more here`, `learn more`, `the guide`, or a bare `here`, `docs`, `documentation`, `README` or `this page`.

A link into a repository is fine, and often right, when it cites a fact the page has already stated: _the installer is published at `v0.4.0`_. It is wrong as the place the answer lives. The test, from GDR-KI-WEBSITE-002, is whether the sentence would still say something true and useful with the link removed.

This rule is what the whole arrangement exists for. A page that moved out of `/guidance/` and still ends by pointing at a README has changed its URL and nothing else.

### It declares its provenance

`sources` or `sources: original`, exactly as before — see [page provenance](page-provenance.md). `verify:provenance` walks `src/docs/` as a tree rather than as a list of directories, so moving a page is not a way to shed its declaration, through this move or the next one.

These last two are asked of Markdown pages only. Get Started and Contribute are hand-built landing pages on `layouts/base.njk`, so "the prose before the first heading" is not a thing they have. They are still sections, still bound, still ordered, still titled.

## How a page is found

Four things happen without the page doing anything:

- **The landing grid puts its section on a card**, showing how many pages the section holds and linking to its first. Both are derived from the pages that carry the binding, so a card cannot claim a number its section does not hold.
- **Every page closes with its section's contents**, in reading order, marking where the reader is and naming what comes next. `partials/section-contents.njk` renders it.
- **It carries a way back up.** `partials/up-link.njk` renders `← Docs · <Section>` whenever `section` is set.
- **The sitemap includes it**, from the same collection.

The first two are also what makes the tree verifiable. The landing grid links only each section's _first_ page, so every page after it is reachable through the contents block that closes its predecessor. `verify:reachable` walks outward from the home page and fails the build on any page nothing links to, which means the contents block is load-bearing rather than decorative: remove it and two thirds of the site becomes unreachable and the build says so.

## What the project catalogue does instead

`/projects/` answers _what is this_ — what each repository owns, where it lives, what it ships. A project whose slug matches a section links to it in a single sentence rather than listing its pages, because the section's own contents already do that better and a list competing with a list is how a reader loses their place.

Most projects have no section, and that is the normal case. The catalogue grows with the ecosystem; the Docs navigation grows only with the material worth teaching.

## Running the check

```bash
bun run --cwd apps/site verify:docs
```

It runs inside `bun run ki:site:build`, and reads source rather than `dist/`, so it can run before a build.

## Feeding the shape back

`tools-ki` and `ki-agentic-harness` own their own `docs/guides/`, and the contract above is worth adopting there — particularly the opening claim and the no-deferral rule, which are not specific to a website. That is a handoff to those repositories, not something this repository changes on their behalf.
