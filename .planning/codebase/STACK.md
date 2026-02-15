# Technology Stack

**Analysis Date:** 2026-02-15

## Languages

**Primary:**
- TypeScript 5.x - Full application codebase (frontend and backend)

**Secondary:**
- JavaScript (ESM) - Configuration files (`.mjs` extensions for ES modules)

## Runtime

**Environment:**
- Node.js (version not pinned - see note below)

**Package Manager:**
- npm (v10.x implied by package-lock.json format)
- Lockfile: `package-lock.json` present

## Frameworks

**Core:**
- Next.js 16.1.5 - Full-stack React framework (API routes, Server Components, middleware)
- React 19.2.3 - UI framework
- React DOM 19.2.3 - React rendering

**UI & Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- PostCSS 4.x - CSS processing via `@tailwindcss/postcss` plugin
- shadcn/ui - Component library (via components.json configuration)
- Radix UI primitives:
  - `@radix-ui/react-dropdown-menu` 2.1.16
  - `@radix-ui/react-label` 2.1.8
  - `@radix-ui/react-select` 2.2.6
  - `@radix-ui/react-slot` 1.2.4
- Lucide React 0.563.0 - Icon library
- next-themes 0.4.6 - Dark mode support

**Forms & Validation:**
- React Hook Form 7.71.1 - Form state management
- @hookform/resolvers 5.2.2 - Zod resolver for validation
- Zod 4.3.6 - TypeScript-first schema validation

**Data Management:**
- @tanstack/react-query 5.90.20 - Server state management (TanStack Query)
- @tanstack/react-query-devtools 5.91.2 - Development tools

**Utilities:**
- clsx 2.1.1 - Conditional className utility
- tailwind-merge 3.4.0 - Merge Tailwind classes
- class-variance-authority 0.7.1 - Type-safe component variants
- sonner 2.0.7 - Toast notifications

**Environment Variables:**
- @t3-oss/env-nextjs 0.13.10 - Runtime environment validation with Zod

## Testing

**Framework:** Not detected in production dependencies

**Dev Dependencies:** None present

## Build/Dev Tools

**Linting:**
- ESLint 9.x - Code linting
- eslint-config-next 16.1.5 - Next.js-specific ESLint rules

**Code Quality:**
- No Prettier or Biome config detected (ESLint only)

**Type Checking:**
- TypeScript 5.x - Built-in via Next.js

## Key Dependencies

**Critical:**
- `@supabase/supabase-js` 2.93.1 - Supabase database client (see INTEGRATIONS.md)
- `@supabase/ssr` 0.8.0 - Supabase authentication with Server Components support

**Infrastructure:**
- `next` 16.1.5 - Full-stack framework with built-in API routes, Server Components, and middleware
- `@tanstack/react-query` 5.90.20 - Server state management with built-in caching and invalidation

## Configuration

**Environment:**
- Runtime validation via `@t3-oss/env-nextjs` in `lib/env.ts`
- Environment variables defined in `.env.example`:
  - `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL (public)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key (public)
  - `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key (server-only)

**Build:**
- `next.config.ts` - Next.js configuration (minimal - default config)
- `tsconfig.json` - TypeScript configuration with:
  - Target: ES2017
  - Module: ESNext
  - JSX: react-jsx
  - Path alias: `@/*` maps to project root
- `postcss.config.mjs` - PostCSS configuration for Tailwind CSS 4
- `eslint.config.mjs` - Flat config ESLint (v9 format) with Next.js rules
- `components.json` - shadcn/ui configuration for component aliasing

## Platform Requirements

**Development:**
- Node.js (version not explicitly specified)
- npm (implied v10.x based on lockfile format)

**Production:**
- Node.js runtime (Vercel recommended based on README)
- Environment variables required (see Configuration section)

## Development Commands

**Available scripts** (from `package.json`):
- `npm run dev` - Next.js development server with hot reload
- `npm run build` - Production build
- `npm start` - Production server
- `npm run lint` - Run ESLint

---

*Stack analysis: 2026-02-15*
