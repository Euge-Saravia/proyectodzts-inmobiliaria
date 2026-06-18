# Auto-generate Property Reference Code — Design

**Date:** 2026-05-29
**Scope:** Sanity Studio — auto-fill the property `reference` field (`DZTS-###`) on creation, with a uniqueness guard.

## Problem

The internal reference code (`reference`, format `DZTS-###`) is typed by hand on every property. It's error-prone and editors must look up the last number themselves.

## Goals

- On creating a new property, pre-fill `reference` with the next code: `DZTS-{max existing + 1}`, zero-padded to 3 digits.
- Keep the field editable (a suggestion, not a lock).
- Reject duplicates: a property can't share a `reference` with another.

## Non-goals

- No change to the code format / regex (`^DZTS-\d{3,}$`) or to the frontend display.
- No backfill of existing properties with an empty `reference` (separate migration; optional follow-up).
- No "regenerate" button or publish-time assignment (the auto-on-create + uniqueness guard covers the need).

## Design

All changes are in `apps/studio/schemaTypes/propertyType.ts`, on the `reference` field. Client calls use `context.getClient({ apiVersion: "2025-02-19" })` (matches the project's apiVersion).

### 1. Pure helper — `nextReference`

Extract the number-crunching into a small, readable pure function (e.g. `apps/studio/lib/reference.ts`):

```ts
export function nextReference(existing: (string | null)[]): string {
  const max = existing.reduce((m, r) => {
    const n = /^DZTS-(\d+)$/.exec(r ?? "")?.[1];
    return n ? Math.max(m, Number(n)) : m;
  }, 0);
  return `DZTS-${String(max + 1).padStart(3, "0")}`;
}
```

Legacy values that don't match `DZTS-<digits>` are ignored when computing the max. Padding is 3 digits; `DZTS-1000` (4 digits) is reached only after `DZTS-999` and stays valid under the existing regex.

### 2. `initialValue` (async)

```ts
initialValue: async (_, context) => {
  const client = context.getClient({ apiVersion: "2025-02-19" });
  const refs = await client.fetch<(string | null)[]>(
    `*[_type == "property" && defined(reference)].reference`,
  );
  return nextReference(refs);
},
```

Best-effort: computes the max over published properties. Collisions (two created near-simultaneously, or a draft not yet counted) are caught by the uniqueness validation below — `initialValue` suggests, validation enforces.

### 3. Uniqueness validation (chained to the existing regex)

```ts
validation: (rule) =>
  rule
    .regex(/^DZTS-\d{3,}$/, { name: "referencia", invert: false })
    .error("El formato debe ser DZTS-### (ej: DZTS-001).")
    .custom(async (value, context) => {
      if (!value) return true;
      const client = context.getClient({ apiVersion: "2025-02-19" });
      const id = (context.document?._id ?? "").replace(/^drafts\./, "");
      const dupes = await client.fetch<number>(
        `count(*[_type == "property" && reference == $value && !(_id in [$id, "drafts." + $id])])`,
        { value, id },
      );
      return dupes > 0 ? "Ese código ya está en uso por otra propiedad." : true;
    }),
```

Excludes the current document (draft and published `_id`) so editing an existing property doesn't flag itself.

### Field stays editable

No `readOnly`. The rest of the field (title, description, group) is unchanged.

## Verification

- `pnpm --filter dzts-studio exec sanity build` (or `tsc`) compiles.
- Manual in Studio: creating a property pre-fills the next `DZTS-###`; setting a `reference` that another property already uses shows the duplicate error; the format error still fires for malformed input.
- No frontend changes; `src/sanity/types.ts` unchanged (field shape stays `string`).

## Schema-change flow

Per CLAUDE.md: `typegen` → `deploy` (Studio) → commit `types.ts`. The field shape is unchanged, so `types.ts` should not move; run typegen to confirm. The Studio auto-deploys on the next push to `main` (deploy-studio.yml).
