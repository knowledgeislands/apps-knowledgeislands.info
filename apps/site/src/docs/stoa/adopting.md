---
title: Adopting Stoa
order: 8
description: Vendor Stoa into a site at a reviewed release, keep the copy honest with its lock, and take later releases deliberately.
permalink: /docs/stoa/adopting/
sources:
  - repository: knowledgeislands/packages-stoa
    path: packages/stoa/README.md
    ref: v0.27.2
    governs: 'Vendoring, the lock, the self:stoa scripts, drift, deferral and the Eleventy plugins'
    reviewed: '2026-10-28'
---

# Adopting Stoa

A site adopts Stoa by vendoring it: copying the whole package into its own repository at a reviewed release, with a lock that records every file's digest. The site then builds only from its copy, checks that copy offline on every build, and takes each later release as a deliberate change it can review or defer.

## The first copy

Start from a clean site checkout and a local checkout of the Stoa repository at the release you mean to take. Run Stoa's own tool from that checkout, at the site's root:

```sh
STOA_CHECKOUT=/path/to/packages-stoa \
  bun /path/to/packages-stoa/packages/stoa/tooling/stoa.js sync --to <version> --no-commit
```

It writes the whole `packages/stoa/` tree and `stoa-lock.json`. Review both, commit them with the site's adoption change, and never edit the vendored files: a change belongs upstream, and the site takes it with the next release.

## The scripts a site keeps

The copy carries its tool, so later steps run from the site itself:

| Script | What it does |
| --- | --- |
| `self:stoa:verify` | Offline. Recomputes every file's digest against the lock and fails on any modified, missing or extra file. Run it in the site's tests and its hosted build. |
| `self:stoa:drift` | Reads a local Stoa checkout and lists the changelog entries and files changed since the vendored release. It fails when the copy is behind a release nobody has deferred, and never fetches. |
| `self:stoa:sync` | Takes a release: copies the package at its tag, rewrites the lock and commits both. |
| `self:stoa:defer` | Records a decision not to take a release yet, with its reason, so `drift` passes until a later change arrives. |
| `self:stoa:diff` | Writes the copy's local edits as a patch against the vendored release, for a change request upstream. |

## Using the units

Each unit has a pure `render*()` function for the build and, where it has an element, a `define*()` for the browser. Units with Eleventy plugins, the Calendar, Timeline, Today board, Search Index, Page Foot, Header and Issues List, register shortcodes or virtual templates; a site that restricts its template formats includes `11ty.js` so feeds and the search index are written.

Load `styles/index.css`, map the site's tokens onto `--stoa-*` in its bridge layer, and define the elements from a deferred module once the build's markup is on the page. The modules need HTTP or HTTPS; browsers do not run them from `file://`.
