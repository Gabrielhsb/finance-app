# Finance App

App de controle financeiro pessoal. Centralize cartões, receitas, despesas e parcelas — saiba exatamente onde você está financeiramente em menos de 30 segundos.

## Stack

- **Next.js 16** (App Router) + **React 19**
- **Prisma 7** + **SQLite** (better-sqlite3)
- **Tailwind CSS v4**
- **Recharts** — gráficos
- **Sonner** — toasts
- **next-themes** — dark/light mode

## Funcionalidades

- **Dashboard** — visão geral de receitas, despesas e orçamento do mês
- **Cartões** — gerenciamento de cartões de crédito e faturas mensais
- **Receitas** — receitas fixas e variáveis
- **Despesas** — despesas fixas e variáveis por categoria
- **Parcelas** — controle de compras parceladas
- **Categorias** — categorias com cor e ícone personalizados

## Como rodar

```bash
npm install
npm run db:migrate
npm run db:seed   # opcional: dados de exemplo
npm run dev
```

Acesse `http://localhost:3000`.

## Variáveis de ambiente

```env
DATABASE_URL="file:./prisma/dev.db"
```

## Comandos

```bash
npm run dev          # servidor de desenvolvimento
npm run build        # build de produção
npm run lint         # ESLint
npm run db:migrate   # rodar migrações Prisma
npm run db:seed      # popular banco com dados de exemplo
npm run db:studio    # abrir Prisma Studio
```
