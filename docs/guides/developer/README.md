# Developer guides

For the developer maintaining the Knowledge Islands website: how it deploys, how its generated routes are declared, and how a published page stays honest about where it came from and reachable once it is there.

## Deployment

- [Cloudflare](cloudflare.md) — the dashboard-owned half of the deployment: Workers Builds settings, domains, and the commands an operator must not run locally.

## Declared routes

- [Tool routes](tool-routes.md) — how each released tool gets its page and installation endpoint, and what a tool repository hands over when it releases.
- [Projects directory](projects-directory.md) — how every public ecosystem repository earns a card and a page, and why the directory makes no release promises.

## Presentation

- [Prose styling](prose-styling.md) — where the rules for Markdown elements live, which elements must be covered, and why an inline style on a prose element is a bug.

## Published pages

- [Docs sections](docs-sections.md) — where a page in a Docs section lives, what binds it there, and the reading order, opening claim and no-deferral rules `verify:docs` enforces.
- [Feature areas](feature-areas.md) — the crosswalk from each feature area to the skills and commands that provide it and the page that explains it, the Provided by box it renders, and the `verify:features` and `verify:skill-names` gates.
- [Deciding what this site publishes](what-to-publish.md) — whether a piece of public explanation belongs here or in the repository that holds it, and what the site owes a source it restates.
- [Page provenance](page-provenance.md) — the `sources` declaration every published page carries, and how a refresh sweep finds pages whose upstream has moved.
- [Page reachability](page-reachability.md) — how the build proves every published page can be reached by navigating, and which link to add when one cannot.
