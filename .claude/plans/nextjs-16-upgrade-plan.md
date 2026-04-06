# Next.js Upgrade Plan: 15.3.1 → 16.x

## Overview

Upgrade from Next.js 15.3.1 to Next.js 16 on a dedicated branch. The project is minimal (fresh Create Next App), so the upgrade is low-risk.

## Current State

- **Next.js**: 15.3.1
- **React**: 19.0.0
- **Node.js**: Needs verification (16 requires 20.9+)
- **Custom config**: None (minimal next.config.ts)
- **Middleware**: None
- **API routes**: None

## Step 1: Create Upgrade Branch

```bash
git checkout main
git pull origin main
git checkout -b feat/nextjs-16-upgrade
```

## Step 2: Verify Node.js Version

Next.js 16 requires Node.js 20.9.0+. Verify with `node -v`.

## Step 3: Upgrade Packages

```bash
npx @next/codemod@canary upgrade latest
```

Or manually:
```bash
npm install next@latest react@latest react-dom@latest
npm install -D @types/react@latest @types/react-dom@latest
```

## Step 4: Breaking Changes to Address

### 4.1 Remove `--turbopack` flag (now default)

**File**: `package.json`

```diff
  "scripts": {
-   "dev": "next dev --turbopack",
+   "dev": "next dev",
```

### 4.2 Async Request APIs

Not applicable - project doesn't use `params`, `searchParams`, `cookies()`, or `headers()`.

### 4.3 Middleware → Proxy

Not applicable - no middleware.ts exists.

### 4.4 `next/image` changes

Review `src/app/page.tsx` - currently uses local images from `/public`. No remote images or query strings, so no config changes needed.

### 4.5 `next lint` removed

Update package.json to use ESLint directly:

```diff
  "scripts": {
-   "lint": "next lint"
+   "lint": "eslint ."
```

## Step 5: Recommended Next.js Best Practices

After the upgrade, implement these improvements:

### 5.1 Enable React Compiler (optional but recommended)

```bash
npm install -D babel-plugin-react-compiler
```

**File**: `next.config.ts`
```ts
const nextConfig: NextConfig = {
  reactCompiler: true,
};
```

### 5.2 Configure TypeScript strict paths

Run `npx next typegen` to generate type-safe route helpers.

### 5.3 Add security headers

**File**: `next.config.ts`
```ts
const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};
```

### 5.4 Configure image optimization (for future remote images)

**File**: `next.config.ts`
```ts
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Add domains when needed
    ],
  },
};
```

### 5.5 Enable experimental filesystem cache for faster dev builds

**File**: `next.config.ts`
```ts
const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForDev: true,
  },
};
```

## Step 6: Verification

1. `npm run dev` - Verify dev server starts without errors
2. `npm run build` - Verify production build succeeds
3. `npm run start` - Verify production server works
4. `npm run lint` - Verify linting works with new ESLint CLI
5. Test the home page renders correctly in browser

## Files to Modify

| File | Changes |
|------|---------|
| `package.json` | Update dependencies, fix scripts |
| `next.config.ts` | Add recommended configurations |

## Rollback Plan

If issues arise:
```bash
git checkout feat/claude  # or main
git branch -D feat/nextjs-16-upgrade
```

## Sources

- [Next.js 16 Upgrade Guide](https://nextjs.org/docs/app/guides/upgrading/version-16)
- [Next.js 16 Blog Post](https://nextjs.org/blog/next-16)
