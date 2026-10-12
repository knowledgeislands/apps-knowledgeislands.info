---
id: ODR-KI-WEBSITE-001
title: 'Tool Release Updates Auto-Merge'
date: 2026-10-05
status: current
decision_type_url: https://knowledgeislands.info/specifications/decision-records/odr
decision_type: operations
---

# ODR-KI-WEBSITE-001: Tool Release Updates Auto-Merge

## Context

When a `tools-*` repository publishes an immutable release and the Homebrew tap validates its formula, the tap dispatches `tool-release-published` to this repository. The receiver in `.github/workflows/update-tool-release.yml` verifies the release and tap evidence independently and opens or updates a pull request that advances only the tool's four version pins in `projects.json5`. Until now every such PR waited for a person, although the decision it carried had already been taken upstream: someone chose to cut that release, and GitHub made it immutable.

The repository had no required check, no ruleset, no branch protection and auto-merge disabled, and its owner and agents landed work by pushing directly to `main`. Allowing a bot PR to merge itself safely therefore needed a gate the bot could not bypass, without breaking the direct-push working pattern.

## Decision

**The immutable release is the human gate.** A tool-release PR produced by the receiver needs no further website review. After opening or updating it, the receiver runs `gh pr merge --auto --squash` with its `ki-tools-release-bot` App token.

**`main` carries a ruleset requiring pull requests and the `build` check.** The `build` job of `.github/workflows/ci.yml`, reported by GitHub Actions, is the required status check; the pull-request rule requires no approving review, so auto-merge waits on CI alone. Repository auto-merge (`allow_auto_merge`) is enabled.

**Only repository admins may bypass the ruleset.** The admin role is the sole bypass actor, which keeps the owner's direct pushes to `main` working. The release App is not a bypass actor, so a bot PR merges - and the site deploys - only after `build` passes.

**Eligibility stays structural, not judged.** The synchronizer refuses an unregistered slug, a non-tool entry, a repository mismatch, a downgrade, or a block without exactly four coherent version pins, and the workflow fails on any changed path other than the registry. A first-time entry, maturity change, route change or editorial change therefore never yields a bot PR; it arrives as an ordinary human-authored PR, which nothing auto-merges.

## Consequences

- A verified release reaches the website without a person clicking merge, and a failing `build` leaves the PR open for a human, which is the failure mode wanted.
- Non-admin contributors, and any agent not acting with admin credentials, must land changes through pull requests that pass `build`.
- Merging deploys the site, so CI on the PR is the last automated check before publication. Weakening `build` or the synchronizer's refusals weakens this gate directly; changes to either deserve the same care as a change to this record.
- The App's existing Contents and Pull requests write permissions suffice to enable auto-merge; no permission was added.

## References

- Tool routes (`docs/guides/developer/tool-routes.md`) - the receiver's verification and the automated release path.
- `KI-WEBSITE-SITE-042`, [as delivered](https://github.com/knowledgeislands/ki-website/blob/fa6bc4428d2f4835c3e95b129338584602f120ab/docs/roadmap/KI-WEBSITE-SITE-042-auto-accept-verified-tool-versions.md) - implementation and verification evidence; accepted 2026-10-06.
- `BREW-007` in `knowledgeislands/homebrew-tap` - the tap-side formula automation that precedes this receiver.
