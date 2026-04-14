# DaggerHub

Gerador de stats block para adversárias do Daggerheart em português do Brasil.
Você preenche um formulário com as regras do livro integradas (sugestões por patamar/tipo, validação e snippets de keywords) e recebe um stats block estilizado, pronto para visualizar ou exportar em **PNG**, **PDF** ou **JSON**.

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS v3
- react-hook-form + zod
- html-to-image + jsPDF (exportação)
- react-router-dom
- Persistência: `localStorage` (sem backend)

## Rodando localmente

```bash
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`.

## Scripts

- `npm run dev` — servidor de desenvolvimento
- `npm run build` — build de produção (`dist/`)
- `npm run preview` — preview do build
- `npm run typecheck` — checagem de tipos TS

## Estrutura

```
src/
  types/         tipos e enums do domínio (Adversary, Tipo, Patamar…)
  data/          tabelas de regras (TIPOS, PATAMARES, TIER_BASELINES, KEYWORDS)
  lib/           schema zod, storage, export, defaults, slug
  hooks/         useAdversaryLibrary, useAutoSuggest
  components/
    StatsBlock/  preview estilizado (export-ready)
    form/        seções do formulário (Identidade, Combate, Ataques, …)
    library/     grid e card de adversárias salvas
    ui/          Button, Input, Select, Textarea, Section, TagInput
  pages/         LibraryPage, BuilderPage
```
