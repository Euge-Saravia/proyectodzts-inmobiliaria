# Triage Agent

- **Date**: 2026-08-19
- **PR**: [#142](https://github.com/pablocolaiacovo/dzts-website/pull/142)
- **Status**: Implemented
- **Owner**: main agent (architect tier)

## Goal

A dedicated agent that triages the repo's open PRs and issues: decides which PRs are ready to merge, in what order, what blocks the rest, how issues rank by priority, and whether the `dev → main` backlog warrants cutting a release. Fills the gap between the devops agent (executes pipeline/release work) and the orchestrator (routes work): nothing previously owned the *decide-what-matters* step.

## Decisions

### Model: Opus, not Fable or Sonnet

Triage is judgment work — weighing risk, urgency, and merge order — which sits above Sonnet's implementation tier. But it applies a written policy to observable repo facts (check states, mergeability, alert severities) rather than doing open-ended design, so the top-tier model isn't warranted. Opus. Bumping to Fable later is a one-line frontmatter change if its calls feel shallow.

### Decide, never execute

The agent is read-and-report by default: it never merges, closes, or edits code. The only mutations it may perform — and only when explicitly asked — are applying labels and posting triage comments. Execution routes onward: merges/releases to `devops`, code fixes to `implementer`/`quick-fix`. This keeps a clean separation between the judgment step and the action step, so a triage run is always safe to fire.

### Business priorities are flagged, not invented

Priorities derivable from the repo (security alerts, broken CI, staleness, dependency order) are the agent's to rank. Anything hinging on business context (content-owner needs, commercial urgency) is marked "needs owner input" rather than guessed.

## Implementation

- **`.claude/agents/triage.md`** — the agent definition: ground rules (no mutations, always `-R pablocolaiacovo/dzts-website` to avoid the stale `upstream` remote, ground every claim in actual `gh` output), the repo conventions it audits against (squash-to-dev vs merge-commit release, e2e path-filter awareness, spec-file convention, Dependabot grouping), a six-tier priority framework (security > production breakage > unblocking > dependency hygiene > features > chores), a five-point merge-readiness checklist, the `gh`/`git` data-gathering commands, and a fixed report format (TL;DR, ready-to-merge order, blocked list with routing, ranked issues, release recommendation).
- **CLAUDE.md** — Triage row in the Model Delegation table plus a "Delegate to `triage` when" section.
- Priority labels (`priority: high/medium/low`) are defined in the agent spec but created lazily — only when a task first asks the agent to label.

## Operational notes

- Reading Dependabot alerts (`gh api .../dependabot/alerts`) may 403 depending on token scopes; the agent reports the gap instead of silently skipping security ranking.
- A missing e2e check is only a blocker when the PR touches `apps/frontend/**` — the agent verifies changed paths before flagging.
- Typical cadence: run after Dependabot's Monday batch, and before deciding to cut a `dev → main` release.
