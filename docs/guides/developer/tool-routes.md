# Tool routes

How the website publishes a page and an installation endpoint for each released Knowledge Islands command-line tool, and what each tool repository hands over when it releases.

## The contract

Every released tool has exactly two public routes.

| Route | Audience | What it is |
| --- | --- | --- |
| `/projects/<tool>/` | People | The product page: what the tool is for, how to install it, and where its owner lives. |
| `/install/<tool>` | Machines | A `302` to the installer published at the tool's declared immutable release tag. |

Both are generated from one declaration, so a tool's page, its endpoint, and the version it advertises cannot drift apart. The routes are a discoverability and indirection layer. The website hosts no artefact, computes no checksum, and makes no promise about what an installer does once it runs — the tool repository, its GitHub release, and the [Homebrew tap](https://github.com/knowledgeislands/homebrew-tap) keep those authorities.

A tool earns routes by being released and generally usable. A `tools-*` repository name is not sufficient: unreleased tools and internally operated tools stay off the site.

## The registry

A released tool is a `kind: 'tool'` entry in [`apps/site/src/_data/projects.json5`](../../../apps/site/src/_data/projects.json5), the one registry behind `/projects/`. It carries everything the [projects directory](projects-directory.md) requires of any entry — `slug`, `name`, `kind`, `tagline`, `description`, `role`, `usage`, `repository`, `availability`, `icon`, `accent` — and six more that only a tool may declare:

| Field | Meaning |
| --- | --- |
| `version` | The published release this site currently advertises. |
| `maturity` | `stable`, `preview`, or `experimental`.† |
| `formula` | The Homebrew formula in `knowledgeislands/tap`, or `null` when the tool is not tapped. |
| `installer` | The immutable installer target the machine route redirects to. |
| `manual` | The human manual at the declared version. |
| `changelog` | The release history at the declared version. |

The split is enforced in both directions: `verify:projects` fails a `tool` entry missing any of the six, and fails any other kind that declares one. A half-declared tool would otherwise render an install block with a missing link rather than failing the build.

† `stable` means a `1.x` or later release its owner recommends for general use; `preview` means a pre-`1.0` tool with an established shape whose interface may still move; `experimental` means an early release published mainly for evaluation.

`installer`, `manual`, and `changelog` must all read from the same explicit tag as `version`. A `main`, `master`, or bare-branch URL is rejected: an endpoint that follows a branch stops being a deliberate recommendation and silently republishes whatever the tool's default branch happens to hold.

## Adding or advancing a tool

Advancing the registry is a **named release follow-up owned by the releasing repository**, not something the website discovers. After a tool publishes a release it intends to recommend, it hands the website an item naming the exact version and the immutable installer target. The cross-repository convention that governs such a handoff — the receiving repository owns its priority, plan and execution, and both sides record the originating item and whether the relationship blocks — is stated in this repository's `AGENTS.md`.

The website then edits the registry entry — `version`, `installer`, `manual`, `changelog`, and `maturity` if it changed — and ships. Nothing else needs touching: the page, the card, the sitemap entry, and the redirect are all generated.

Check the registry before acting on the handoff. A sending repository knows its own release; it does not know this site's current state, so a handoff that reads like "publish these new routes" may in fact be a version advance on an entry that already exists. Grep `projects.json5` for the slug first. Taking the handoff's account of the website at face value is how a tool ends up with two entries.

Because the handoff is explicit, a newer upstream release does not change the site until someone decides it should. That is the point: the endpoint is a recommendation, and recommendations advance deliberately.

### Automated release advances

The manual handoff above remains only for first-time registry entries and maturity changes. Existing tool versions advance through event-driven, CI-gated automation. After a `tools-*` repository publishes an immutable release and Homebrew tap validates its formula, the shared tools release bot dispatches `tool-release-published` with the tool slug, exact tag, source repository, formula path, and full tap commit.

The tap fans the same verified event out to an explicit registry of consumer repositories. KI Website is one consumer, not the owner of the bot or event. Every consumer defines its own response and authority boundary; repository declaration never authorises a consumer to mutate another repository.

Website receiver independently requires all following before it writes anything:

- source release exists, is repository's latest release, is published rather than draft or prerelease, and GitHub reports it immutable;
- formula at supplied tap commit names same source repository and version in every release URL;
- versioned installer exists and is non-empty;
- registry already maps tool slug to source repository; and
- requested version is not downgrade.

Successful verification changes only selected entry's `version`, `installer`, `manual`, and `changelog` pins. Receiver pushes deterministic `automation/tool-release-<tool>-<version>` branch through the shared `ki-tools-release-bot` GitHub App and opens or updates a pull request, then requests squash auto-merge with `gh pr merge --auto --squash`. It never commits to `main` directly. The immutable upstream release is the human gate, so a verified version-only update needs no further website review: the `main` ruleset requires pull requests and the `build` check, only repository admins may bypass it, and the App is not a bypass actor, so the PR merges - and the site deploys - only after `build` passes. A failing check leaves the PR open for a human.

First-time entries, maturity changes, and editorial changes never take this path. The synchronizer refuses an unregistered slug, a non-tool entry, a repository mismatch, a downgrade, or a block without exactly four coherent version pins, and the workflow fails on any changed path other than the registry, so none of these produces a bot PR. Such changes arrive as ordinary human-authored PRs, which nothing auto-merges.

Configure `KI_TOOLS_RELEASE_BOT_APP_ID` as a repository variable and `KI_TOOLS_RELEASE_BOT_PRIVATE_KEY` as an Actions secret. Install the shared App on `ki-website` with Contents and Pull requests read/write permissions so this receiver can prepare its branch, open its pull request and enable auto-merge. Repository auto-merge (`allow_auto_merge`) must stay enabled. The Homebrew tap holds the same settings to mint a token restricted to its committed consumer registry. Never commit or print the private key.

Use receiver's manual workflow only to retry verified event, supplying same exact values. Repeated delivery is idempotent: already-current registry produces no commit or pull request. If dispatch is missed, network verifier continues to report upstream drift without silently changing recommendation.

## Verification

`bun run ki:site:build` runs the gate automatically after Eleventy writes `dist/`, so a broken declaration fails the build that a deployment is cut from. Run it directly from the site workspace when iterating on the registry:

```bash
bun run --cwd apps/site verify:routes              # registry shape and immutable-ref discipline
bun run --cwd apps/site verify:routes -- --network # additionally reach each installer and report upstream drift
```

Offline, the gate checks that every entry is complete and well-formed, that slugs are unique, that versions are exact `v`-prefixed semantic versions, that every URL is pinned to the declared tag under the `knowledgeislands` owner, that each icon name actually exists in the icon macro, and that no page still names a retired route. When `dist/` is present it also checks that every tool page and `/install/<tool>` line was generated, and that the retired `dist/tooling/` tree and `/harness/install` line are gone.

With `--network` it fetches each installer target — a failure means the declared route is broken — and compares the declared version against the repository's published latest release. Upstream drift is reported as a **warning**, not a failure, so a tool releasing does not break the website build; it tells whoever is looking that a handoff is outstanding.

## Retired routes

`/harness/install` and `/tooling/cli/` are gone; `/install/ki` and `/projects/ki/` replace them. No compatibility redirect was kept for either, because a permanent alias for a route that was only ever special-cased would preserve exactly the inconsistency the contract removes.

The whole `/tooling/` section is gone as well. A tool is a project that ships a binary, so it is rendered by the project template like everything else in the directory (ADR-KI-WEBSITE-002). Those routes were published and were not a special case, so unlike the two above they redirect rather than disappear: `/tooling/<slug>` to `/projects/<slug>/`, `/tooling/` to `/projects/`, and the two task-guidance pages filed there to `/projects/ki-agentic-harness/installing-a-harness/` and `/projects/ki-agentic-harness/repositories/`.

`/harness/bootstrap` is unaffected. It is a repository-bootstrap script owned by the KI Agentic Harness rather than a tool installer, so it is not part of this contract and keeps its own route.
