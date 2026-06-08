# Feature Planning — Workflow & Templates

This document defines the standard process and file templates for planning new features in this project. Follow it whenever a new feature is requested, before writing any code.

---

## Workflow

### Step 1 — Evaluate the request

Before exploring anything, assess the request:

- Identify the target users (employee / admin / supervisor) and affected roles.
- Clarify scope: what is explicitly in, what is explicitly out.
- Note dependencies on existing features (payroll, scheduling, auth, etc.).
- Flag any ambiguities and resolve them with the user before proceeding.

### Step 2 — Explore the codebase

Read the relevant existing code to ground the plan in reality:

- Check `docs/ARCHITECTURE.md`, `docs/DATABASE.md`, and any related feature docs in `docs/features/`.
- Identify which existing files will be touched (types, hooks, pages, routes, components, utils, migrations).
- Note reusable patterns (e.g., lock/unlock pattern from payroll, RPC atomicity, heat colors, role guards).
- Spot risks early: schema changes, RLS implications, timezone handling, mobile layout impact.

### Step 3 — Create three planning documents in `docs/features/`

Name files using kebab-case matching the feature name (e.g. `foo-bar`). See templates below.

### Step 4 — Get approval before coding

Present a brief summary to the user:

- What each of the three files covers.
- Any open questions or risks surfaced during exploration.
- Confirm the user is happy with scope and approach before any code is written.

### Step 5 — Keep progress updated during implementation

As work proceeds, check off tasks in `foo-bar-progress.md` and add entries to the decisions log whenever a design choice deviates from the plan.

---

## Template: `docs/features/foo-bar.md` — User Story

```markdown
# User Story: <Feature Name>

## Overview

| Field            | Detail |
| ---------------- | ------ |
| **Feature**      |        |
| **Epic**         |        |
| **Priority**     |        |
| **Target users** |        |

---

## User Story

**As a** <role>,
**I want to** <action>,
**So that** <outcome>.

---

## Background & Context

<Why this is needed; current pain point; what this feature does and does not replace.>

> **Role summary for this feature:**
>
> - **Employee** — <what they can do>
> - **Admin** — <what they can do>
> - **Supervisor** — <what they can do>

---

## Acceptance Criteria

### AC1 — <Title>

- <Bullet list of testable, observable criteria>

### AC2 — <Title>

- ...

---

## Out of Scope

- <Explicit non-goals for v1>
```

---

## Template: `docs/features/foo-bar-plan.md` — Technical Implementation Plan

```markdown
# <Feature Name> — Technical Implementation Plan

> **User story:** `docs/features/foo-bar.md`
> **Progress tracker:** `docs/features/foo-bar-progress.md`

---

## Key Architectural Decisions

1. <Decision and rationale — e.g., "Atomic submit via Postgres RPC — client-side sequential mutations cannot guarantee all-or-nothing.">
2. ...

---

## Phase 1 — <Area>

**Files changed:** `src/path/to/existing-file.ts`
**Files created:** `src/path/to/new-file.ts`

<Detail: schema DDL, code structure, or pseudo-code sufficient to implement without ambiguity. Reference existing patterns by file path where applicable.>

## Phase 2 — <Area>

**Files changed:** ...
**Files created:** ...

...

---

## Risk Register

| Risk | Severity            | Mitigation |
| ---- | ------------------- | ---------- |
| ...  | High / Medium / Low | ...        |

---

## Verification Checklist

- [ ] Build passes: `pnpm run build`
- [ ] Lint passes: `pnpm run lint`
- [ ] <Manual test: role + action + expected outcome>
```

Rules:

- Every phase must **explicitly list which files will be changed and which will be created**.
- Steps must be small enough that each can be completed and verified independently.
- If a phase requires a DB migration, include the full idempotent SQL (use `CREATE TABLE IF NOT EXISTS`, `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`, `DROP POLICY IF EXISTS` before `CREATE POLICY`).
- Reference existing patterns by file path (e.g., "mirrors the lock pattern in `src/hooks/usePayrollMutations.ts`").

---

## Template: `docs/features/foo-bar-progress.md` — Progress Tracker

```markdown
# <Feature Name> — Implementation Progress

> **User story:** `docs/features/foo-bar.md`
> **Technical plan:** `docs/features/foo-bar-plan.md`

---

## Status

| Phase | Area | Status         |
| ----- | ---- | -------------- |
| 1     | ...  | ⬜ Not started |
| 2     | ...  | ⬜ Not started |

---

## Phase 1 — <Area>

**File:** `src/path/to/file.ts`

- [ ] <Specific task from the plan>
- [ ] <Specific task from the plan>

## Phase 2 — <Area>

...

---

## Acceptance Criteria Sign-off

| AC  | Description | Status |
| --- | ----------- | ------ |
| AC1 | ...         | ⬜     |
| AC2 | ...         | ⬜     |

---

## Notes / Decisions Log

| Date         | Note          |
| ------------ | ------------- |
| <YYYY-MM-DD> | Plan drafted. |
```
