# Page reachability

How the build proves every published page can be reached by navigating, and what to do when it says one cannot.

[Page provenance](page-provenance.md) makes the site honest about where a page's material came from. This guide covers the other half of publishing: whether a reader can get to the page at all. A page can be perfectly sourced, perfectly written, and still be invisible.

## The problem it solves

A static site generator will happily write a file nothing links to. The page builds, the build passes, the sitemap lists it, and a reader who does not already know the URL never sees it.

That is not hypothetical here. When the check was first run against a clean build, twenty-one of the thirty-three published pages were reachable only by typing their address. The whole fourteen-page prompting collection had no inbound link from outside its own subtree — the string `prompting` appeared nowhere else in `dist/`. Those guides had presumably had a way in once and lost it silently, which is exactly the failure a person cannot notice: nothing is broken, there is simply nothing to click.

This is the same reasoning that made the provenance sweep worth building. A condition nobody can see is a condition nobody fixes.

## The check

`apps/site/scripts/verify-reachable.ts` starts at `dist/index.html` and walks the built site the way a reader does: it follows `href` attributes only, resolving each relative to the document it was found in, and collects every HTML file it arrives at. Anything under `dist/projects/`, `dist/prompting/` or `dist/optional-tools/` that the walk never reaches is a failure.

It follows links, not routes. A `permalink` in frontmatter, an entry in the sitemap, and a redirect in `_redirects` all declare that an address exists; none of them is a way for a reader to find it. Existence is owned elsewhere — `verify-tool-routes.ts` and `verify-projects.ts` check that advertised routes resolve. This gate owns arrival.

Three consequences of walking the built output rather than the source follow from that choice, and are worth knowing:

- It runs after the build, so it sees the [portable `dist/` URL transform](../../../apps/site/eleventy.config.ts) — the relative `../prompting/index.html` form a reader's browser actually follows, not the authored `/prompting/` form.
- A link to something the build did not write is skipped rather than counted, so a typo in an `href` shows up as an unreachable page on the far end rather than as a phantom hit.
- `dist/` must be current. Run `bun run ki:site:clean` before `bun run ki:site:build` when a route has been removed or renamed; an ordinary build retains obsolete output, and a stale orphan will be reported against a page that no longer exists.

## Why it fails rather than warns

The provenance sweep reports upstream drift as a warning, because another repository editing its own README must never break this site's build. An orphaned page is the opposite case: it is entirely this site's own doing, fixable here, and fixable now. So `verify:reachable` exits non-zero, and it is wired into `bun run ki:site:build` alongside the other verify scripts — a page that no route reaches cannot reach production.

Both trees are held to the same standard, which is what it holds published prose to: [the Docs sections](docs-sections.md) and the project catalogue. A page that moved must not become unreachable in the move, and an index that lists a collection must be on the far end of a link itself. The standard bites hardest on `dist/docs/`, where the landing grid links only each section's first page and every page after it is reachable through the contents block that closes its predecessor.

Pages outside those two trees are reported as warnings instead. They are all reachable today and should stay so, but the gate was built for published prose and says plainly what it holds itself to rather than quietly expanding its remit.

## When it fails

The message names the file:

```text
error: dist/prompting/gemini-3/index.html cannot be reached by following links from dist/index.html
```

The fix is a link, and the question is which one. In order of preference:

1. **From its project's page.** A project guide needs no link written by hand: the Guides block on `/projects/<slug>/` is generated from the `guides` collection, so a page in the right directory with the right directory data is listed automatically. An unreachable guide here nearly always means the binding is wrong, not that a link is missing.
2. **From its collection index.** For a prompting guide, `/prompting/` is where a reader looking for that page will be.
3. **From a page that has a reason to send the reader there.** `optional-tools` is reached from the `ki` getting-started guide and from the harness tuning guide, because those are where a reader needs it. That is a better link than one written to satisfy the gate.
4. **From the navigation.** Reserved for a collection index. The navigation is a small fixed set, and a page that needs an entry there is making a claim about the shape of the site, not about its own reachability.

Resist the further option of linking a page from wherever is convenient. A link that exists only to satisfy the gate satisfies the gate and not the reader; if no page has a reason to link to it, the real question is whether the page should exist.

## What it does not cover

The gate proves a path exists, not that anyone would find it. A link buried in the last paragraph of a page nobody reads passes. Reachability is a floor, not a measure of navigation quality — GDR-KI-WEBSITE-002 governs whether a page earns its place, and this check only guarantees the reader can get to the ones that do.

It also says nothing about outbound links. A page may link to a document that has been deleted upstream; that is the provenance sweep's `--network` mode, described in [page provenance](page-provenance.md).
