# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev          # start dev server
npm run build        # production build
npm run lint         # ESLint
npm run db:migrate   # run Prisma migrations
npm run db:seed      # seed database (tsx prisma/seed.ts)
npm run db:studio    # open Prisma Studio
```

## Environment

`DATABASE_URL` — SQLite file path (e.g. `file:./prisma/dev.db`). Defaults to `file:./dev.db` if unset.

## Architecture

**Stack:** Next.js 16 App Router · React 19 · Prisma 7 + better-sqlite3 · Tailwind CSS v4 · Recharts · Sonner (toasts) · next-themes

**Route groups:** `src/app/(app)/` holds all app pages (dashboard, cartoes, categorias, despesas, receitas). Root `src/app/page.tsx` redirects to `/dashboard`.

**API routes:** `src/app/api/` — each resource follows REST with `route.ts` (collection) and `[id]/route.ts` (single). Resources: `cartoes`, `categorias`, `despesas/fixas`, `despesas/variaveis`, `receitas/fixas`, `receitas/variaveis`, `faturas`, `dashboard`.

**Prisma client:** generated to `src/generated/prisma/`. Import via `@/generated/prisma/client`. Singleton in `src/lib/prisma.ts` — always import `prisma` from `@/lib/prisma`.

**Domain models (all in Portuguese):**
- `Cartao` — credit cards
- `Categoria` — expense categories (with color + icon)
- `ReceitaFixa` / `ReceitaVariavel` — fixed/variable income
- `DespesaFixa` / `DespesaVariavel` — fixed/variable expenses (linked to Categoria, optionally Cartao)
- `FaturaCartao` — monthly card invoices (unique per cartaoId + mes + ano)

**Components:**
- `src/components/ui/` — primitive components (Button, Card, Input, Modal, Select, Badge, SeletorMes)
- `src/components/layout/` — Sidebar, Header, ThemeToggle
- `src/components/charts/` — GraficoBarra, GraficoRosca (Recharts wrappers)
- `src/components/dashboard/` — BarraOrcamento
- `src/components/providers/` — ThemeProvider (next-themes)
