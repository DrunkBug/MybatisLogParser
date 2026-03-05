# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MyBatis Log Parser — a single-page React app that parses MyBatis SQL logs (extracts `Preparing:` statements and `Parameters:` values) and produces formatted, executable SQL with syntax highlighting.

## Commands

```bash
pnpm start          # Dev server at http://localhost:3000
pnpm build          # Production build to build/
pnpm test           # Tests in watch mode (Jest + React Testing Library)
pnpm test -- --testNamePattern="pattern"  # Run specific test
```

Package manager: **pnpm** (v10.28.0, declared in `packageManager` field).

## Architecture

This is a Create React App (react-scripts 5.0.1) project with TypeScript components but JS entry point.

### Entry flow

`src/index.js` → renders `<MybatisLogParser />` directly (the default `App.js` is unused).

### Core component

`src/components/mybatis-log-parser.tsx` — single component containing all business logic:
- `parseSQL()` — extracts SQL from `Preparing:` line, substitutes `?` placeholders with values from `Parameters:` line, quoting strings/timestamps/dates
- `formatSQL()` — wraps `sql-formatter` with MySQL dialect and uppercase keywords
- Clipboard integration: auto-paste from clipboard, parse, and copy result back

### UI layer

shadcn/ui pattern (configured in `components.json`):
- `src/components/ui/` — Button, Card, Alert, Textarea (Radix Slot + CVA + Tailwind)
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)
- Tailwind CSS v3 with CSS variables for theming (dark mode, HSL color tokens in `src/index.css`)
- Icons: lucide-react

### Deployment

- Multi-stage Dockerfile: node:20-alpine build → nginx:1.27-alpine serve
- Nginx config in `docker/nginx.conf`
- GitHub Actions: `.github/workflows/docker-image.yml` builds and pushes to GHCR on main/master push or version tags

## Conventions

- Functional components with hooks, TypeScript for `.tsx` components
- camelCase functions/variables, PascalCase components
- Handler naming: `handleX` (e.g., `handleParse`, `handleCopy`)
- Tailwind utility classes for all styling; no CSS modules
