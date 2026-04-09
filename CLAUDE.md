@AGENTS.md

# CLAUDE.md

This file provides guidance for AI assistants (Claude and others) working in this repository.

## Repository Overview

**TriStateApp** is a full-stack web dashboard hosted at `bjsnyder7/TriStateApp` on GitHub, built with Next.js 16, React 19, TypeScript, and Tailwind CSS v4.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 (strict mode) |
| Styling | Tailwind CSS v4 |
| Runtime | React 19 |
| Package manager | npm |

## Directory Structure

```
TriStateApp/
├── src/
│   ├── app/
│   │   ├── globals.css                  # Tailwind v4 entry + global resets
│   │   ├── layout.tsx                   # Root layout (html/body, Geist font, metadata)
│   │   ├── page.tsx                     # Redirects "/" → "/dashboard"
│   │   └── dashboard/
│   │       ├── DashboardShell.tsx       # 'use client' — context + flex wrapper + mobile backdrop
│   │       ├── layout.tsx               # Dashboard chrome (Sidebar + Header + main outlet)
│   │       ├── page.tsx                 # Dashboard home: KPI cards, charts, activity table
│   │       ├── analytics/page.tsx       # Placeholder
│   │       ├── users/page.tsx           # Placeholder
│   │       └── settings/page.tsx        # Placeholder
│   └── components/
│       ├── layout/
│       │   ├── Sidebar.tsx              # 'use client' — nav links, active state, mobile slide
│       │   ├── Header.tsx               # Top bar + user avatar placeholder
│       │   └── MobileMenuButton.tsx     # 'use client' — hamburger toggle
│       └── dashboard/
│           ├── StatCard.tsx             # KPI metric card (label, value, trend)
│           ├── ChartPlaceholder.tsx     # Dashed placeholder slot for future charts
│           └── ActivityTable.tsx        # Recent activity table with status badges
├── public/                              # Static assets
├── AGENTS.md                            # Next.js 16-specific AI agent notes (auto-generated)
├── CLAUDE.md                            # This file
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

## Key Architectural Patterns

### Client / Server Component Split

- `DashboardShell.tsx` — `'use client'`: provides `DashboardContext` (sidebarOpen state) via React Context. The layout file itself stays a Server Component by passing children through the shell.
- `Sidebar.tsx` — `'use client'`: consumes `DashboardContext` for mobile open/close and `usePathname()` for active link highlighting.
- `MobileMenuButton.tsx` — `'use client'`: consumes `DashboardContext` to toggle the sidebar.
- All dashboard page and data components (`StatCard`, `ChartPlaceholder`, `ActivityTable`, all `page.tsx` files) are Server Components — keep them that way unless interactivity is required.

### Tailwind v4 (Important)

This project uses **Tailwind CSS v4**, which has significant differences from v3:
- No `tailwind.config.ts` — configuration lives in `src/app/globals.css` using `@theme` blocks
- Entry is `@import "tailwindcss"` (not `@tailwind base/components/utilities`)
- Custom design tokens: add `--color-*`, `--font-*`, etc. to the `@theme` block in `globals.css`
- All standard color utilities (slate-*, blue-*, green-*, etc.) work unchanged

### Adding a New Dashboard Section

1. Create `src/app/dashboard/<name>/page.tsx`
2. Add a nav item to the `NAV_ITEMS` array in `src/components/layout/Sidebar.tsx`
3. No layout changes needed — the dashboard shell is inherited automatically

### Replacing Placeholder Content

- **Charts**: Replace `ChartPlaceholder` with a real chart component. Install `recharts` or `chart.js`. Keep the `title` and `className` props.
- **Data**: `ActivityTable` and `StatCard` define their types inline. Replace the `PLACEHOLDER_ROWS` / `STAT_CARDS` constants with server-side `await fetch()` or ORM calls at the top of their parent Server Component (`page.tsx`).
- **Auth**: Wrap `src/app/dashboard/layout.tsx` with a session check before rendering `<DashboardShell>`.

## Development Workflow

```bash
npm run dev     # Start dev server at http://localhost:3000
npm run build   # Production build (must pass with zero errors)
npm run lint    # Run ESLint
```

Type check:
```bash
npx tsc --noEmit
```

## Git Workflow

### Branches

| Branch | Purpose |
|--------|---------|
| `main` | Production-ready code |
| `claude/<description>` | AI-generated feature/documentation branches |
| `feature/<description>` | Human feature branches |
| `fix/<description>` | Bug fix branches |

### Commit Message Style

```
<type>: <short summary>
```

Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`

### Pushing Changes

```bash
git push -u origin <branch-name>
```

Retry up to 4 times with exponential backoff (2s, 4s, 8s, 16s) on network failures.

## Code Conventions

- **No premature abstractions**: three similar lines of code is better than a speculative helper
- **No speculative features**: only implement what is asked
- **Validate at boundaries only**: trust internal code and framework guarantees
- **Security**: never commit secrets; use environment variables; sanitize all user input
- **Reading before editing**: always read a file before modifying it
- **Scope discipline**: do not add refactors, extra comments, or improvements beyond the explicit request

## Environment Variables

No environment variables are defined yet. When added, document them here.

| Variable | Required | Description |
|----------|----------|-------------|
| _(none yet)_ | — | — |

## Notes for AI Assistants

- **Never push directly to `main`.** Work on a feature branch and open a pull request only when explicitly asked.
- **Do not create a pull request unless the user explicitly asks for one.**
- **Read files before editing** — never modify code you haven't read.
- **Keep CLAUDE.md up to date** when the tech stack, structure, or conventions change significantly.
- **Tailwind v4 is in use** — do not create a `tailwind.config.ts`; use the `@theme` block in `globals.css` instead.
- **Next.js 16 may have breaking changes** — see `AGENTS.md` and `node_modules/next/dist/docs/` for version-specific guidance.
