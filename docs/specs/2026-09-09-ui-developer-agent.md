# UI Developer Agent

- **Date**: 2026-09-09
- **PR**: [#159](https://github.com/pablocolaiacovo/dzts-website/pull/159)
- **Status**: Implemented
- **Owner**: main agent (architect tier)

## Goal

A dedicated agent for visual design and prototyping. It takes a brief from the architect (what to build, constraints, target page/component), proposes two or three design directions grounded in the existing brand, builds a self-contained HTML prototype for each, and — once the architect picks one — implements it as React components + CSS in the frontend. Fills the gap between the architect (decides what gets built) and the implementer (builds an already-decided look): nothing previously owned the *how should this look* step.

## Decisions

### Model: Opus

Proposing distinct design directions and judging which one best serves the brief is taste-and-judgment work, the same tier as triage. Sonnet is fine for executing a decided design (that's the implementer's job) but produces shallow, same-layout-three-colors "options". Opus. Phase 2 (implementation) could be routed to `implementer` instead if cost becomes a concern; keeping it on the same agent preserves the design intent through implementation.

### Two phases, explicit hand-off

Phase 1 always ends with a report and stops: options, prototype paths, a recommendation, and what the design needs from others (Sanity fields, copy, selectors). Phase 2 runs only for the option the architect selected. This keeps the architect in control of the decision and avoids the agent building three full implementations or silently picking one.

### Brand is a constraint, not an input to invent

The agent designs within the tokens in `apps/frontend/src/styles/variables.css`, Bootstrap 5, Bootstrap Icons, and the patterns already on the site (dark hero with overlay, outline-to-fill primary button, `rounded-4 shadow-sm` cards with a 4px primary bar, operation badges, circular section images, shrinking sticky header). Novelty goes into layout, hierarchy, spacing, and interaction. A new color, font, or contradicting visual language is an escalation, not a design choice. The agent definition carries a summary of the brand but is told to read the source files first so it doesn't drift as the site evolves.

### Prototypes as self-contained HTML

Each option is one HTML file (Bootstrap + Icons from CDN, tokens inlined, Inter from Google Fonts, Spanish placeholder copy, `placehold.co` images, dark-mode query, works at 375px and 1200px). No build step, opens in a browser, easy to compare side by side. Default location is `docs/design/YYYY-MM-DD-<slug>/`; the architect decides in PR review whether the prototypes are worth committing or are discarded once implemented.

### UI-only scope

Same boundary logic as `devops`: the agent edits components, CSS, and page markup under `apps/frontend/src/` and nothing else. Data needs (GROQ, schema), caching, workflows, and e2e tests route back through the orchestrator. It must preserve the selectors listed in CLAUDE.md's "Key Selectors Used by Tests" table, or say explicitly which one has to change.

## Implementation

- **`.claude/agents/ui-developer.md`** — the agent definition: ground rules (brief is the contract, propose-then-implement, stay inside the brand, UI-only, keep test selectors), a brand style reference (palette, type scale, shape/depth, iconography, established patterns, copy conventions, non-negotiables like mobile-first, dark mode, reduced motion, AA contrast), the phase 1 procedure (ground → 2–3 options → prototype each → recommend → report and stop), the phase 2 procedure (implementer conventions, Bootstrap-first, tokens over hex, lint + typecheck, optional screenshots), fixed report formats per phase, and escalation triggers.
- **CLAUDE.md** — UI Developer row in the Model Delegation table plus a "Delegate to `ui-developer` when" section, including the boundary with `implementer` (decided look → implementer; undecided look → ui-developer).

## Operational notes

- Write the brief before delegating: target page/component, the problem the design solves, hard constraints (data available, selectors, performance), and whether prototypes should be kept. A vague brief produces vague options.
- Cyan `#01BCF3` on white does not meet WCAG AA for body text; the agent is told to use it for accents and large bold text only. Expect it to flag briefs that ask for cyan body copy.
- Prototypes reference CDN assets and are not part of the Next.js build; they are review material only and never shipped to `out/`.
