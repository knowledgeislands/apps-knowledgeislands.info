# Decision Records - KI Website

This directory holds the significant, durable decisions for the KI Website. Records use the Knowledge Islands Decision Records format and are living present-state records: update the record when the decision changes, rather than adding a supersession chain. The ecosystem fundamentals these records build on - routing responsibility, repository structures and boundaries, and ecosystem coordination - are Arcadia's [Knowledge Islands ecosystem fundamentals](https://github.com/knowledgeislands/ki-principal/blob/main/Admin/Governance/Decisions/GDR-KI-PRINCIPAL-006-knowledge-islands-ecosystem-fundamentals.md) (GDR-KI-PRINCIPAL-006), cited by URL rather than copied.

## Reading order

1. [GDR-KI-WEBSITE-001](GDR-KI-WEBSITE-001-adopting-decision-records.md) - adopts Decision Records for this repository.
2. [GDR-KI-WEBSITE-002](GDR-KI-WEBSITE-002-carrying-material-for-readers.md) - reverses the publishing default so the site carries what a reader needs rather than routing them to a repository, and names vendoring as the outcome for material that changes per release.
3. [ADR-KI-WEBSITE-001](ADR-KI-WEBSITE-001-vendoring-a-published-inventory.md) - vendors the skill catalogue and the `ki` command inventory from their upstreams at pinned refs, and states what the parse owes when the upstream is published but not specified.
4. [ADR-KI-WEBSITE-002](ADR-KI-WEBSITE-002-one-section-for-every-project.md) - merges the tooling section into projects, leaving one registry and one section for every public repository.
5. [ADR-KI-WEBSITE-003](ADR-KI-WEBSITE-003-documentation-is-a-thing-you-work-through.md) - dissolves the guidance section and gathers everything that teaches into Docs sections a reader works through in order, leaving the project catalogue to answer what exists rather than how to use it.
6. [ODR-KI-WEBSITE-001](ODR-KI-WEBSITE-001-tool-release-updates-auto-merge.md) - treats the immutable upstream release as the human gate, so verified tool-release PRs auto-merge behind a `main` ruleset requiring pull requests and the `build` check, with repository admins as the only bypass.

`ADR-KI-WEBSITE-003` previously recorded the `ki` command inventory as a second vendoring decision. It reached the same conclusion as `ADR-KI-WEBSITE-001` over a weaker upstream, so the two were merged into the one record that owns the concern, and the distinction it drew between a specified and a merely published interface is carried there in full. The freed serial was reused rather than left as a hole. One peer citation moved with it: `KI-TOOL-KI-CLI-080` in `tools-ki` names the vendoring record by identifier and now names `ADR-KI-WEBSITE-001`.
