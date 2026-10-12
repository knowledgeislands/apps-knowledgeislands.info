# Prose styling

Every Markdown page on this site renders inside a `.prose-ki` container, and the stylesheet owns how the elements inside it look. This guide says where those rules live, which elements they must cover, and why `verify:prose` fails a build that adds an element nothing styles.

## The rule

**Prose elements are styled centrally. An inline `style` attribute on a prose element is a bug.**

The rules live in `apps/site/src/assets/css/main.css`, in the `@layer components` block, and use the semantic tokens from `tokens.css` — never a literal colour. Colour-dependent rules are mirrored into the `@media (prefers-color-scheme: dark)` block at the foot of the same file.

A hand-built `.njk` page is a different matter: it carries full-bleed section backgrounds and composes its own layout, and inline styles there are how the site is built. The boundary is the prose container. When a template emits a `pre`, a `table` or a `code` inside `.prose-ki`, it takes the stylesheet's treatment and adds nothing of its own.

## What has to be covered

`verify-prose-coverage.ts` holds a list of the elements that carry type, spacing or colour of their own:

`blockquote`, `code`, `h1`–`h6`, `hr`, `img`, `li`, `ol`, `p`, `pre`, `strong`, `table`, `td`, `th`, `ul`.

Anything outside that list is either structural — `tbody` and `tr` group rows without painting them — inline markup that inherits by design, or chrome with its own component class.

An element counts as styled by either of two routes:

- a `.prose-ki` rule names it, or
- `@layer base` gives it a deliberate element rule, which is why `a` and `h1` need nothing in the component layer.

A `.prose-provenance` rule does **not** count. That class refines the footer's table on top of the `.prose-ki` base, so counting it would report the body's tables as styled by a rule that never reaches them.

## Why the check exists

`.prose-ki` declared rules for `h2`, `h3`, `p`, `ul` and `li` and nothing else, while the corpus emitted fifty tables across thirty-four of thirty-five pages, fifty-six `pre` blocks, and 1482 inline `code` elements. Those rendered as browser defaults — a table with `padding: 0`, no borders and a shrink-to-fit width — on the pages carrying the most material.

No rule was wrong. They were absent, and nothing looked. Meanwhile the hand-built pages compensated with 507 inline `style` attributes, including two `pre` blocks in `projects/project.njk` inlining exactly the rule the stylesheet was missing. That is the mechanism by which styling drifts: where the stylesheet is silent, each author invents, and no two inventions match.

So `verify:prose` reads the selectors the stylesheet declares, walks the built output for the elements that actually appear inside a `.prose-ki` container, and fails on an element no rule reaches. It fails rather than warns, because an unstyled element is entirely within this site's control.

## What the check cannot see

`verify:prose` proves an element has a rule; it cannot prove the rule looks right. The first rendered review (KI-WEBSITE-SITE-032) found two defects that every gate passed:

- **Phone-width overflow.** A commit hash or URL in inline `code` has no break opportunity, and a provenance or inventory table sized to its content, so seventeen pages scrolled sideways at 390 px and pushed the footer off-screen. Inline `code` therefore carries `overflow-wrap: break-word`, and below the 768 px breakpoint a `.prose-ki` table becomes a block that scrolls inside itself. `pre` already scrolled and needed nothing. `overflow-wrap: anywhere` was tried first and rejected: it lowers the min-content width that auto table layout sizes columns from, so on desktop the tuning page's environment-variable names split mid-token. `break-word` breaks only what would otherwise overflow.
- **Literal Markdown in project pages.** Project registry fields render as plain text, so backticks reached readers as backticks. `verify:projects` now rejects a backtick in any project prose field.

When a prose rule changes, look at the ki command inventory, a page with a provenance table, and a `pre`-heavy guide at a phone width in both colour schemes before relying on the gates.

## Adding an element

If a page starts emitting something new — a definition list, a `figure` — the build will fail only if that element is on the list above. Add it to `styledElements` in `apps/site/scripts/verify-prose-coverage.ts` at the same time as you add its rule, so the next page to use it is covered rather than merely lucky.

## Running it

```bash
bun run --cwd apps/site verify:prose
```

It runs as part of `bun run ki:site:build`, after the reachability check. It reads `dist/`, so build first.
