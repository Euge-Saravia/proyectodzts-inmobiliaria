# Deployment Guide (Vercel)

This repo is a monorepo on the `dev` branch with two deployable apps:

- `apps/frontend` (Next.js site)
- `apps/studio` (Sanity Studio)

Deploy each app as a separate Vercel project so they can scale and roll back independently.

## Prerequisites

- A Vercel account
- Environment variables for each app (see the app-specific `.env.example` files on `dev`)

## Option A: Vercel UI (recommended)

1. In Vercel, create a new project from this repo.
2. For the first project, set the Root Directory to `apps/frontend`.
3. Configure the environment variables for `apps/frontend`.
4. Deploy.
5. Create a second Vercel project from the same repo.
6. Set the Root Directory to `apps/studio`.
7. Configure the environment variables for `apps/studio`.
8. Deploy.

Notes:
- You will end up with two independent Vercel projects and URLs.
- Use separate environment variables per project.

## Option B: Scripted deploy (no auth)

This repository includes a deployment script available in this environment. It packages
and deploys a specific directory to Vercel and returns Preview + Claim URLs.

1. Deploy the frontend:

```bash
bash /mnt/skills/user/vercel-deploy/scripts/deploy.sh /path/to/repo/apps/frontend
```

2. Deploy the studio:

```bash
bash /mnt/skills/user/vercel-deploy/scripts/deploy.sh /path/to/repo/apps/studio
```

3. Use the Preview URL to validate the deployment.
4. Use the Claim URL to transfer each deployment to your Vercel account.

## Environment variables

Configure env vars separately for each app. Use these files as the source of truth:

- `apps/frontend/.env.example`
- `apps/studio/.env.example`

Do not copy secrets into the repo. Set them directly in Vercel.

### Frontend (`apps/frontend`)

- `NEXT_PUBLIC_SANITY_PROJECT_ID`
- Description: Sanity project ID used by the frontend.
- `NEXT_PUBLIC_SANITY_DATASET`
- Description: Sanity dataset name (e.g. `development`, `production`).
- `NEXT_PUBLIC_WEB3FORMS_KEY`
- Description: Web3Forms access key for contact form submissions.
- `SANITY_REVALIDATE_SECRET`
- Description: Secret for on-demand cache revalidation (shared with Sanity webhook).
- `NEXT_PUBLIC_SITE_URL`
- Description: Canonical site URL used for `sitemap.xml` and `robots.txt`.

### Studio (`apps/studio`)

- `SANITY_STUDIO_PROJECT_ID`
- Description: Sanity project ID used by Studio (must match frontend).
- `SANITY_STUDIO_DATASET`
- Description: Sanity dataset name (must match frontend).

## Vercel UI checklist

Use this checklist for each Vercel project:

- Import the repo
- Set Root Directory (`apps/frontend` or `apps/studio`)
- Framework: auto-detect (Next.js for frontend, Vite for Studio)
- Add environment variables for the selected app
- Deploy

## Recommended branch mapping

- `main` -> Production
- `dev` -> Preview

This keeps production stable while allowing daily work and QA in preview deployments.

## Sanity webhook (revalidation)

If you use on-demand revalidation, configure a webhook in Sanity to call the
frontend endpoint and include the `SANITY_REVALIDATE_SECRET` value.

- Endpoint: `https://<your-domain>/api/revalidate`
- Method: `POST`

## Tips

- Keep `apps/frontend` and `apps/studio` in separate Vercel projects.
- If you deploy from Git, Vercel will auto-build on new commits to `dev`.
- For production, lock the `main` branch to production and use `dev` for previews.
