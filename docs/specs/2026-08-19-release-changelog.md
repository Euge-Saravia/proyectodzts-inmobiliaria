# Automated Release Changelog

- **Date**: 2026-08-19
- **PR**: [#140](https://github.com/pablocolaiacovo/dzts-website/pull/140)
- **Status**: Implemented
- **Owner**: devops agent (orchestrated)

## Goal

Every production release (merge of the `dev → main` release PR) must automatically produce a versioned GitHub Release whose notes list all the PRs included in that release. No manual changelog writing.

## Decisions

### Versioning: CalVer, not SemVer

Tags follow `vYYYY.MM.DD` (America/Argentina/Buenos_Aires timezone), with a `.2`, `.3`… suffix when more than one release lands the same day (e.g. `v2026.08.19`, `v2026.08.19.2`).

Rationale: nothing consumes a version number in this project — no published package, no API clients — so SemVer's "does this break consumers?" semantics carry no information. Tools like semantic-release would also impose conventional-commit discipline on every squash title and fight the merge-commit release flow. CalVer is zero-maintenance and answers the only relevant question: when did it ship.

### Changelog: GitHub's native release-notes generator

No third-party changelog action. Feature PRs are squashed into `dev`, so each squash commit stays linked to its PR; when the release merge lands on `main`, `gh release create --generate-notes` enumerates every PR between the previous release and the new tag (titles, numbers, authors, full-changelog link) for free.

### Trigger: push to `main`, not deployments

`release.yml` triggers on `push: branches: [main]` — which only happens via release-PR merges (and occasional direct security-bump PRs, which are legitimately releases too). Sanity content publishes trigger `deploy.yml` via `repository_dispatch` but are not pushes to `main`, so content-only redeploys correctly do **not** create releases.

## Implementation

- **`.github/workflows/release.yml`** — single job on push to `main`: checkout with full history + tags, compute the next CalVer tag (collision loop over existing tags), then `gh release create "$TAG" --target "$GITHUB_SHA" --title "$TAG" --generate-notes`. `permissions: contents: write`; concurrency group `release` with `cancel-in-progress: false` to serialize runs. Note this is best-effort, not a per-push guarantee: GitHub keeps at most one pending run per concurrency group, so under 3+ rapid pushes to `main` a pending run can be cancelled — the skipped push gets no tag of its own and its PRs fold into the next release's notes. Acceptable at this repo's release cadence.
- **`.github/release.yml`** — release-notes config: excludes PRs labeled `release` (so the release PR doesn't list itself), categorizes into "Dependencias" (`dependencies` label, applied by Dependabot) and "Cambios" (everything else).
- **`release` label** — created on the repo; release PRs must be opened with `--label release`.
- **Baseline release** — [`v2026.06.03`](https://github.com/pablocolaiacovo/dzts-website/releases/tag/v2026.06.03) created on `65ef2ba` (the last pre-automation release merge, PR #106), so the first automated release covers only work shipped since then instead of the repo's entire PR history.
- **Runbook updates** — CLAUDE.md "Releasing dev → main" and `.claude/agents/devops.md` "Cut a release" now include the `--label release` step and post-merge verification (`gh release list --limit 1`).

## Operational notes

- The workflow only takes effect once the file exists **on `main`** — the release PR that ships it triggers its own first run.
- If a release is merged without the `release` label, the only effect is cosmetic: the release PR appears in its own changelog.
- Deleting a bad release/tag and re-running the workflow (`workflow_dispatch` is not configured — re-run the failed run instead) is the recovery path; the collision loop will not reuse a tag that still exists.

## Incidents during implementation

The checkout has two remotes (`origin` = `pablocolaiacovo/dzts-website`, `upstream` = `Euge-Saravia/proyectodzts-inmobiliaria`, a stale fork parent) and `gh` resolved to `upstream` by default, so the first `gh label create` landed on the wrong repo. Fixed by `gh repo set-default pablocolaiacovo/dzts-website`; recorded as gotcha #13 in the devops agent spec. A stray `release` label may remain on the upstream repo.
