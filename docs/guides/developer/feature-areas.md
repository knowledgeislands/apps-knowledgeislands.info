# Feature areas

The Docs sections are the reading view of the documentation: a reader enters a section and works through it. Beside them sits a planning view, the **feature-area crosswalk**: the areas a reader must be able to understand, each mapped to the skills and `ki` command groups that provide it and to the page that explains it. This guide says where the crosswalk lives, what it drives on a published page, and what the two gates built on it refuse.

## Where the crosswalk lives

[`src/_data/featureAreas.json5`](../../../apps/site/src/_data/featureAreas.json5) holds one entry per area:

```json5
{
  slug: 'roadmap-lifecycle',
  title: 'Roadmap lifecycle',
  skills: ['ki-work', 'ki-work-roadmap', 'ki-next', 'ki-plan', 'ki-implement', 'ki-accept', 'ki-batch'],
  commands: ['ki batch'],
  page: '/docs/ways-of-working/roadmap-lifecycle/'
}
```

- `slug` is the area's stable key.
- `skills` names the catalogue skills that provide the area. A family the plan writes as a glob, such as `ki-repo-*`, is written out skill by skill, because a glob cannot be checked against the catalogue by name.
- `commands` names the command groups a reader would type, and may be empty.
- `page` is the site path of the page that explains the area. It is a string, or a list where one area is explained across more than one page, and it is omitted while the page does not exist. An area with no page is a declared intention and renders nothing.
- `interim: true` marks an area whose practice is written up before its standard home is chosen; the box on its page says so.

The crosswalk names skills; it does not describe them. Descriptions come from the vendored [skill catalogue](page-provenance.md), and a page that wants to say what a skill does links to its catalogue entry.

## What the crosswalk drives on a page

[`partials/provided-by.njk`](../../../apps/site/src/_includes/partials/provided-by.njk), included by `layouts/page.njk` between the section contents and the sources footer, looks the current page's URL up in the crosswalk. Where an area names the page, the partial renders a **Provided by** box listing the area's skills, each linked to its catalogue entry, and its commands, linked to the CLI reference. Where no area names the page, it renders nothing.

The box is derived rather than typed so that a page cannot name a skill the crosswalk does not, and so that a rename lands in one file. It shares the provenance footer's styling because, like the sources table, it is about the page rather than part of its argument.

## The two gates

Both run in `build` after `verify:prose`, and both read source rather than `dist/`, so either can run alone before a build.

### `verify:features`

[`scripts/verify-feature-areas.ts`](../../../apps/site/scripts/verify-feature-areas.ts) holds the crosswalk and the Docs tree together. It fails when:

- an area's slug is missing, malformed or declared twice, or its title is missing;
- an area names a skill that is not in `src/_data/skillCatalogue.json5`, so a skill the harness has renamed fails here when the catalogue is next refreshed;
- an area's `page` matches no Markdown page under `src/docs/` by permalink;
- a Markdown page in the Skills, Ways of working, Knowledge or Standards sections is claimed by no area, or by more than one. Skills pages are exempt: they are about skills in general rather than about one area, and carry no box.

Commands are not checked against the CLI inventory, which is vendored at its own pin and may spell a group differently from the release a page describes. The skill names are the contract.

### `verify:skill-names`

[`scripts/verify-skill-names.ts`](../../../apps/site/scripts/verify-skill-names.ts) reads every `ki-...` token in `src/docs/**/*.md`, inline code spans included and fenced code blocks excluded, and requires each to be one of:

- a skill in the vendored catalogue;
- a token the vendored CLI inventory's own text uses, such as `.ki-meta/` or `ki-checkpoint`, which are conventions rather than skills and are correct to repeat;
- a name on the script's allow-list, each entry with its reason: the ecosystem's repository names, which share the prefix, and configuration values a reader types as written, such as the `[skills.ki-self]` table.

A token followed by `-` or `*` is a glob naming a family, such as `ki-repo-*`, and is not checked. Fenced blocks are skipped because a block quotes an artefact as it is, and a historical name inside one is a fact about that artefact rather than a claim about the harness.

When the gate fails on a page, the fix depends on what the sentence is about. If it is about a skill, name the skill the catalogue has now. If the token is a repository, a configuration value or a convention that is not a skill and is correct as written, add it to the allow-list with its reason. Do not add a retired skill name to the allow-list to make a page pass.

## Adding a page to a claimed section

1. Write the page under `src/docs/<section>/` as [Docs sections](docs-sections.md) describes.
2. Add its permalink to the `page` of the one area it explains, or add the area if it is new, with its skills written out by name.
3. Run the two gates:

```bash
bun run --cwd apps/site verify:features
bun run --cwd apps/site verify:skill-names
```

Both are also part of `bun run ki:site:build`, so a page that lands without its claim fails the build rather than publishing without its box.

## Tests

[`scripts/verify-feature-areas.test.ts`](../../../apps/site/scripts/verify-feature-areas.test.ts) and [`scripts/verify-skill-names.test.ts`](../../../apps/site/scripts/verify-skill-names.test.ts) exercise the pure checks each script exports, in the shape the other script suites use. `bun run --cwd apps/site test` runs them.
