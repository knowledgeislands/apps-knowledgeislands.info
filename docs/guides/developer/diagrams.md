# Diagram pipeline

The website publishes inline SVG figures and separate interactive Archify viewers. It owns diagrams that explain its pages and vendors the harness's committed diagrams at an immutable ref. A normal site build reads these committed files and checks their receipts; it never renders a diagram or contacts an upstream service.

## Vendoring harness diagrams

Run the sync against a clean local harness checkout:

```bash
bun run --cwd apps/site sync:diagrams -- --ref 8897008f
```

The default checkout is `../ki-agentic-harness` beside this repository. Pass `--from <path>` for another checkout. The ref must be a commit SHA; the script resolves it to forty characters and reads every file with `git show`, independently of the checkout's current revision.

For every manifest entry with `commit_html = true`, the sync copies its SVG, HTML and receipt byte for byte into `apps/site/src/assets/diagrams/vendored/ki-agentic-harness/`. It replaces the snapshot, removing files no longer selected. The generated `apps/site/src/_data/vendoredDiagrams.json5` records the repository, manifest path, full ref, sync date, and each diagram's type, question, last-checked revision and file names. The twelve diagrams at the pin above retain the harness's `dual` SVG form. These immutable generated assets are excluded from Biome, alongside the vendored design assets; their contents must remain identical to upstream.

Every page embedding one declares a `knowledgeislands/ki-agentic-harness` source at exactly the snapshot's ref. A source for another repository, or the right ref on the wrong source entry, does not satisfy this requirement.

## Site-owned diagrams

The website declares `[skills.ki-diagrams]` in `.ki.toml`. Its own manifest is `docs/diagrams/diagrams.toml`, one table per slug. The directory holds only the manifest, its reader-facing README, and each diagram's Archify JSON source, SVG, interactive HTML and receipt.

Use one of the five standard types: `architecture`, `workflow`, `sequence`, `dataflow` or `lifecycle`. Each manifest table supplies `question`, `audience`, `traced`, `stale_when`, `regenerate` and `last_checked`, with `svg_form = "ki"` and `commit_html = true`. Add the README section and manifest entry before drawing the source with Archify.

The `command-groups` source cites the eighteen headings in `tools-ki`'s `man/ki.1` at `v0.13.0`, with the release's full commit in `meta.repository`. Its manifest also traces the local page and CLI snapshot, which carry that upstream citation through website history. External evidence paths such as `man/ki.1` belong to the repository identified by the source, rather than claiming that the website owns the manual.

## Regeneration

With the harness diagram skill, Archify and system Chrome or Chromium installed, run:

```bash
bun run --cwd apps/site diagrams:build -- --svg command-groups
```

Replace the slug to build another site-owned diagram. The wrapper uses the harness's `build-html.ts`; its `--svg` option delegates to `export-svg.ts --form ki` from the manifest. Archify's validation, delivery, artifact and browser gates must pass before generated forms are copied back. The harness writes the portable source and HTML fingerprints in the receipt. Never edit that receipt by hand.

Generation runs in a temporary local clone outside the website checkout and removes it afterwards. When `meta.repository` identifies another public Knowledge Islands repository, its sibling checkout supplies the pinned evidence; no fetch occurs and the source checkout is unchanged. Model diagrams without repository metadata use the website checkout. `TMPDIR` can select the temporary-output parent directory for a background run.

The wrapper finds the diagram skill in the installed agent skills, the installed KI harness or the sibling harness checkout. Set `KI_DIAGRAMS_HOME` to the skill directory for another installation; `ARCHIFY_HOME` and `ARCHIFY_CHROME` select the renderer and browser as the harness documents. Generation disables Archify's update request so this command stays local.

After reviewing the facts, advance `last_checked` to the website commit reviewed. For an upstream model or manual, retain the upstream revision in the source's repository metadata too. Commit the JSON, SVG, HTML, receipt, manifest and README together.

## Embedding a figure

Use a literal slug and caption in a Docs Markdown page:

```njk
{% figure "command-groups", "The eighteen command groups and what each operates on." %}
```

The `figure` shortcode resolves the slug against the site manifest or vendored data, refuses unknown or ambiguous names, and inlines the SVG in a `figure-diagram` figure. It escapes the caption and supplies an **Interactive** link with `target="_blank"` and `rel="noopener"`. The figure lands in Markdown, where an HTML block ends at the first blank line and whatever follows is rendered as prose; a `<p>` inside an inline SVG ends the SVG in the browser. The shortcode therefore drops the blank lines every exported SVG carries, and `verify:diagrams` reads each built page back to refuse prose markup inside a figure.

Figures use a parchment panel under both site charts. Site-owned `ki` SVGs carry the KI day palette; vendored `dual` SVGs retain Archify's own palette, with their stylesheet scoped to that figure. Local SVG identifiers are prefixed so diagrams can share a page. Narrow screens scroll the panel while retaining readable diagram text. Interactive HTML carries Archify's own day and night themes.

## Viewer addresses and transforms

Eleventy copies the assets directory to `/diagrams/`, giving vendored viewers addresses such as `/diagrams/vendored/ki-agentic-harness/skill-map.html`. It copies site-owned HTML and SVGs from `docs/diagrams/` to `/diagrams/site/`; the command-groups viewer is `/diagrams/site/command-groups.html`.

These are passthrough copies, outside template rendering. Heading anchors, external-link icons and `explicit-index-links` never process them; the transforms also guard the diagram output directory explicitly. Viewer bytes therefore match the committed HTML, including scripts and source links. Links in the surrounding site page still receive the normal portable-output rewrite.

## Verification

`verify:diagrams` runs after `verify:skill-names` in the site build. It refuses a figure absent from both inventories, a slug present in both, missing committed site forms, missing vendored artefacts, or a page whose harness citation differs from the vendored ref. It then checks each committed receipt against the source and viewer fingerprints it recorded, so the gate runs wherever only this repository is present, including the Cloudflare build. Where the harness skill is installed it also invokes the canonical `build-html.ts --check` as a cross-check; neither needs Archify or a browser.

```bash
bun run --cwd apps/site verify:diagrams
bun run --cwd apps/site diagrams:build -- --check command-groups
ki repo audit --skill ki-diagrams --repo .
```

The audit checks the manifest, README, committed forms, privacy, self-contained SVGs and freshness. The website build additionally checks the page-to-diagram relationship. A matching receipt proves which source produced the viewer; it does not replace reviewing whether the diagram still says the right thing.
