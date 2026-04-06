# Future Plan - Property Page Static Generation

Plan created on 2026-02-04.

## Goal

Pre-render all property detail pages at build time and keep them fresh on publish/unpublish without full rebuilds.

## Assumptions

- Expected property count: ~150
- Deployment options: Vercel or Fly.io
- Sanity webhook revalidation already exists at `src/app/api/revalidate/route.ts`

## Implementation Steps

### 1) Add `generateStaticParams()` for property detail pages (Done)
**File:** `apps/frontend/src/app/propiedades/[slug]/page.tsx`

- Query all published property slugs from Sanity
- Return `[{ slug: "..." }]` for each
- Ensure only published documents are included

### 2) Keep on-demand revalidation
**File:** `apps/frontend/src/app/api/revalidate/route.ts`

- Continue using `revalidateTag("property", "max")`
- Verify payload contains `_type: "property"`

### 3) Sanity webhook configuration

- Trigger on publish and unpublish for `property`
- URL: `https://<site>/api/revalidate`
- Secret: `SANITY_REVALIDATE_SECRET`

## Deployment Notes

### Vercel

- Fully supports on-demand revalidation for App Router
- Webhook refreshes cached pages without full rebuild

### Fly.io

- Works with on-demand revalidation, but confirm cache consistency across instances
- Consider a shared cache handler if running multiple app instances

## Optional Full Rebuild Strategy

- Create a deploy hook and trigger builds from Sanity publish/unpublish
- Simple model, but slower and more expensive than tag revalidation
