# Projects directory

How the website publishes a page for every public project in the Knowledge Islands ecosystem, and what separates that directory from the release registry that backs [tool routes](tool-routes.md).

## The contract

`/projects/` is the public index of the ecosystem. It names every public repository, groups it by kind, says what authority it holds, and links to its owner.

| Route | What it is |
| --- | --- |
| `/projects/` | The grouped index: principal knowledge bases, agentic capabilities, portable standards, command-line tools, MCP servers, platform and delivery. |
| `/projects/<slug>/` | A page per project that has no richer home elsewhere on this site. |

The directory is **descriptive**. It hosts no artefact and computes no checksum — a project page says what a repository is for and, where that repository has released something, how to install it. Released command-line tools are the one kind that pins a version, and [tool routes](tool-routes.md) fixes what they may declare; every promise about a specific release still belongs to the repository that published it.

Only public repositories appear. A private or internally operated repository is deliberately absent: the directory is a public surface, and listing a repository nobody can open leaks the existence of work that is not itself public.

## The registry

[`apps/site/src/_data/projects.json5`](../../../apps/site/src/_data/projects.json5) is the single declaration. Each entry carries:

| Field | Meaning |
| --- | --- |
| `slug` | The route segment for `/projects/<slug>/`. |
| `name` | The repository as its owners name it. |
| `kind` | `principal`, `capability`, `standard`, `tool`, `mcp`, or `platform`.† |
| `tagline` | One sentence, used on cards and as the page headline. |
| `description` | A fuller paragraph for the project page. |
| `role` | The authority this project holds, and by implication what it does not. |
| `usage` | How a reader actually consumes it today, stated honestly. |
| `repository` | The canonical source repository. |
| `availability` | `published` or `source`.‡ |
| `route` | An existing site page that is already this project's home; omit it to generate `/projects/<slug>/`. |
| `icon` | A KI symbol name defined in `src/_includes/macros/icons.njk`. |
| `accent` | The card accent: `gold`, `teal`, or `forest`. |

† The six kinds are the group headings on `/projects/`, in that order. A `tool` entry carries six release fields the other kinds must not; see below.

‡ `published` means there is a live public surface or a released artefact a reader can consume directly. `source` means public source to read, clone, or build; it makes no claim that a release exists. An MCP server with no published package is `source`, and its `usage` field should say so plainly rather than implying an install command that would not resolve.

### Released tools are declared here too

They used to have a registry of their own, and `/projects/` read it to render a sixth group linking out to `/tooling/<slug>/`. That kept the version in one place but left the site with two sections describing the same kind of thing in the same voice, which is what a reader actually saw. ADR-KI-WEBSITE-002 merged them.

So a tool is a `kind: 'tool'` entry like any other, rendered by the same template, with six release fields the other kinds must not carry. [Tool routes](tool-routes.md) owns what those fields mean and how they advance.

### When to use `route`

One project has a richer home on this site than a generated page: `ki-website` is the site itself. That entry declares `route`, its card links there, and no `/projects/ki-website/` page is generated. Without `route`, a page is generated and the card points at it.

`ki-agentic-harness` used to declare one too, pointing at the harness guidance. It does not any more: the guides moved into a Docs section rather than the project pointing at a guide, so it is an ordinary generated page with the reader fields every other entry needs ([Docs sections](docs-sections.md)). Reach for `route` only when the destination is genuinely not a project page — a `route` to a guide is a sign the guide belongs in a section.

### What a generated page needs

A generated page answers five questions in order: what problem this solves, whether the reader has that problem, what it does and what state it is in, how to start, and what it deliberately does not do. An entry without a `route` therefore carries the fields those sections are built from, alongside `usage`, which answers how to start and predates them.

| Field | Meaning |
| --- | --- |
| `problem` | The problem this solves, and the reason the project exists at all. |
| `audience` | Who has that problem, written so a reader can rule themselves out. |
| `capabilities` | An array of at least three plain sentences, each naming something concrete it does. |
| `state` | What state it is in, honestly, including what is not finished. |
| `limits` | What it deliberately does not do, and what stays somewhere else. |

They render as text, so write plain prose — Markdown syntax appears as literal characters on the page.

`verify:projects` fails a generated entry that omits any of them, and applies two floors: 80 characters for a prose field, and three capability sentences of at least 20 characters each. Those floors exist to catch a placeholder or a restated `tagline` rather than to judge prose, and every entry in the registry clears them by a wide margin. An entry that declares a `route` is exempt from the requirement, but anything it does declare is still checked.

Keeping the material true is a standing obligation rather than a one-off. These fields are written by hand from the upstream repository's own account of itself, and nothing mechanical notices when that account changes — unlike the vendored guidance pages, which pin a `sources` ref and have [a provenance sweep](page-provenance.md) behind them. Purpose and posture move slowly, which is what makes hand-written fields defensible here; a command surface would not be.

## Adding or amending an entry

A new public repository is added by editing the registry: nothing else needs touching, because the index card, the project page, and the sitemap entry are all generated. Take the `role` sentence from GDR-KI-PRINCIPAL-006 where that decision covers the repository, so the site's account of authority and the ecosystem decision cannot diverge.

Two things to check before adding an entry:

- **Is it public?** Run `gh repo view knowledgeislands/<repo> --json visibility`. A private repository must not be listed at all, not even as "coming soon".
- **Does it claim a release it does not have?** A repository with no tags and no published package is `source`. Advertising an install path that does not resolve is worse than admitting there is not one yet.

Making a repository public is not by itself a reason to list it. The directory describes the ecosystem, so an entry should be something a reader could meaningfully use or learn from.

## Verification

`bun run ki:site:build` runs the gate automatically after Eleventy writes `dist/`. Run it directly from the site workspace when iterating:

```bash
bun run --cwd apps/site verify:projects              # registry shape and generated routes
bun run --cwd apps/site verify:projects -- --network # additionally confirm every repository is public
```

Offline, the gate checks that every entry is complete and well-formed, that slugs are unique and collide with no tool, that `kind`, `availability`, and `accent` are known values, that each icon name exists in the icon macro, that every repository URL is under the `knowledgeislands` owner, and that no entry smuggles in a release promise. When `dist/` is present it also checks that `/projects/` was generated, that every entry without a `route` produced a page, and that every declared `route` resolves to a file the build actually wrote.

With `--network` it reads each repository through the GitHub API. A repository that is private or missing is a **failure** — the directory must never advertise one. An archived repository is a **warning**, since archiving is a reason to review the entry rather than proof it should go.
