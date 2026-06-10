# CLAUDE.md

Guidance for AI assistants (Claude Code, etc.) working in this repository.

## Project overview

**DaggerHub** is a static, client-only web app for generating Daggerheart RPG
adversary stat blocks, battle encounters, and environments (*ambientes*) in
**Brazilian Portuguese**. It ships baseline stats per *patamar* × *tipo* from
the Livro Básico, validates input, exports stat blocks to PNG/PDF/JSON, and
persists everything to `localStorage`. There is **no backend**.

UI strings, type/enum values, comments, schema messages, and validator labels
are all in **pt-BR** — keep new content in pt-BR unless asked otherwise.

Deploy target: GitHub Pages (`https://erickcassoli.github.io/DaggerHub/`).

## Stack

- Vite 5 + React 18 + TypeScript (strict, `noUnusedLocals`, `noUnusedParameters`)
- Tailwind CSS v3 (custom palette: `parchment`, `ink`, `gold`; fonts: Cinzel + Cormorant Garamond)
- `react-hook-form` + `zod` (with `@hookform/resolvers`)
- `react-router-dom` v6 with **`HashRouter`** (Pages-friendly; URLs use `#/...`)
- `html-to-image` + `jsPDF` (PNG/PDF export of the rendered stat block)
- `nanoid` for IDs, `clsx` for class composition
- Persistence: `localStorage` (no remote DB)

Path alias `@/*` → `src/*` (configured in `tsconfig.app.json` and `vite.config.ts`).

## Scripts

```bash
npm run dev         # Vite dev server at http://localhost:5173
npm run build       # tsc -b && vite build → dist/
npm run preview     # serve the production build locally
npm run typecheck   # tsc -b --noEmit (no test runner is configured)
```

There is **no linter, formatter, or test framework** configured. After making
changes, run `npm run typecheck` (and `npm run build` for non-trivial work) to
catch regressions.

## Repository layout

```
src/
  types/          domain types/enums (Adversary, Encounter, Ambiente, Patamar,
                  Tipo, AbilityKind, AmbienteTipo, AmbienteFeatureKind)
  data/           rule tables: TIPOS, PATAMARES, TIER_BASELINES, KEYWORDS,
                  encounterRules (Battle Points), bestiario (official monsters),
                  ambienteTipos, ambienteBaselines
  lib/            schema (zod), storage, defaults, export, slug,
                  encounter math, encounterStorage, adversarySources,
                  ambienteSchema, ambienteStorage, ambienteDefaults,
                  ambienteExport
  hooks/          useAdversaryLibrary, useEncounterLibrary, useAutoSuggest,
                  useAmbienteLibrary, useAmbienteAutoSuggest
  components/
    StatsBlock/   export-ready preview (StatsBlock, AbilityItem, renderKeywords)
    AmbienteBlock/  export-ready ambiente preview (AmbienteBlock, FeatureItem)
    form/         AdversaryForm + sections/ (Identidade, Combate, Ataques,
                  Experiencias, Habilidades), KeywordChips, FieldError
    ambiente/     AmbienteForm + sections/ (Identidade, Detalhes, Adversarios,
                  Features), AmbienteCard, AmbienteImportButton
    library/      AdversaryCard, LibraryGrid, ImportButton
    bestiario/    BestiarioCard
    encounter/    PartyConfig, BudgetBar, EntryRow, AddAdversaryModal
    nav/          AppHeader (top nav between Biblioteca / Bestiário / Encontros / Ambientes)
    ui/           Button, Input, Select, Textarea, Section, TagInput
  pages/          LibraryPage, BuilderPage, BestiarioPage,
                  EncountersPage, EncounterBuilderPage,
                  AmbientesPage, AmbienteBuilderPage
  App.tsx         Routes
  main.tsx        ReactDOM root + HashRouter
  index.css       Tailwind layers + Google Fonts import + .field-label

docs/
  parse_bestiary.py   one-shot parser that produced src/data/bestiario.ts from
                      the Livro Básico PDF (raw inputs are .gitignored)

.github/workflows/deploy.yml   Pages deploy (master/main → build with VITE_BASE=/DaggerHub/)
```

## Routes

`HashRouter` is mandatory (no `404.html` shim). Routes (`src/App.tsx`):

- `/` — `LibraryPage` (user library)
- `/new`, `/edit/:id` — `BuilderPage`
- `/bestiario` — `BestiarioPage` (read-only official monsters; copy → user library)
- `/encounters`, `/encounters/new`, `/encounters/edit/:id` — encounter builder
- `/ambientes`, `/ambientes/new`, `/ambientes/edit/:id` — ambiente (environment) builder
- `/transformacoes`, `/transformacoes/new`, `/transformacoes/edit/:id` —
  transformação builder (`src/types/transformacao.ts`, `transformacaoSchema`,
  `useTransformacaoLibrary`, key `daggerhub:transformacoes:v1`) — mirrors the
  other builders (RHF + zod, off-screen `TransformacaoBlock` export)

Anything else redirects to `/`. Use `<Link to="/...">` and `useNavigate()` from
`react-router-dom`; never hard-code base paths.

## Domain model

### Adversary (`src/types/adversary.ts`)

- `Patamar`: literal `1 | 2 | 3 | 4` (book tier).
- `Tipo`: union of 10 official roles —
  `'brutamonte' | 'horda' | 'lider' | 'lacaio' | 'atirador' | 'oportunista' | 'manipulador' | 'solo' | 'comum' | 'assistente'`.
  Use `TIPO_VALUES` (the `as const` source of truth).
- `AbilityKind`: `'acao' | 'reacao' | 'passiva'` (note: unaccented internal values).
- `Adversary` fields: `id, nome, tipo, patamar, descricao, motivacoes,
  dificuldade, limiarMaior, limiarGrave, pv, pf, atq, hordaRatio?, ataques,
  experiencias, habilidades, criadoEm, atualizadoEm`.
- `limiarMaior`/`limiarGrave` may be `null` (lacaios; some manipuladores).
- `hordaRatio` only applies when `tipo === 'horda'` and follows `^\d+\/PV$`.
- Damage strings follow `^(\d+(d\d+)?([+-]\d+)?)\s+(fís|mág)$` (e.g. `1d8+2 fís`,
  `7 fís`, `2d6 mág`). Validation lives in `src/lib/schema.ts:danoRegex`.

### Encounter (`src/types/encounter.ts`)

- `Encounter` has `party` (`numPC`, `nivelPC`), `ajustes` (toggle keys),
  `entries` (refs into the user library or bestiary), and free `notas`.
- `EncounterEntry.origem` is `'biblioteca' | 'bestiario'` — resolve refs via
  `resolveAdversary` in `src/lib/adversarySources.ts`.

### Ambiente (`src/types/ambiente.ts`)

- `Ambiente` represents a scene/environment with its own dificuldade, impulsos,
  habilidades, and características — Livro Básico p.240.
- `AmbienteTipo`: `'travessia' | 'exploracao' | 'evento' | 'social' | 'batalha'`
  (use `AMBIENTE_TIPO_VALUES`).
- `AmbienteFeatureKind`: `'acao' | 'reacao' | 'passiva' | 'medo'` — used by both
  `habilidades` (active triggers) and `caracteristicas` (the form restricts the
  latter to `'passiva'`).
- `adversariosSugeridos` are `{ id, adversaryRef, origem }` refs into the user
  library or bestiary, resolved with `resolveAdversary`.
- `potencialMedo` is optional — leave blank for ambientes that don't track Medo.

### Rule data (treat as canonical, edit deliberately)

- `src/data/baselines.ts` — `TIER_BASELINES[patamar][tipo]` powers auto-suggest
  and the “Aplicar padrões do patamar” override. Anchored to specific book pages
  (see the comment block); update the comment when re-anchoring.
- `src/data/tipos.ts`, `src/data/patamares.ts` — labels and lookup maps.
- `src/data/keywords.ts` — system keywords rendered as `<strong>` in the preview
  and inserted as `**Keyword**` by `KeywordChips`. New keywords must be added
  here (the renderer escapes regex specials and matches longest-first).
- `src/data/encounterRules.ts` — `BASE_POINTS_PER_PC = 3`, `BASE_POINTS_FLAT = 2`,
  `BATTLE_POINT_COST` per tipo, and `ADJUSTMENTS` (Livro Básico p.197). Lacaios
  have a special cost rule (`ceil(qtd / nPC)`) handled in `src/lib/encounter.ts`.
- `src/data/bestiario.ts` — large generated JSON-as-TS array. **Do not hand-edit**
  unless you are also updating the generator (`docs/parse_bestiary.py`); IDs are
  prefixed `oficial:` to avoid collisions with the user library.
- `src/data/ambienteTipos.ts` — five official ambiente roles (`AMBIENTE_TIPOS`,
  `AMBIENTE_TIPO_LABEL`).
- `src/data/ambienteBaselines.ts` — `AMBIENTE_TIER_BASELINES[patamar]` powers
  `useAmbienteAutoSuggest` (writes `dificuldade`, `potencialMedo`).

## Validation (`src/lib/schema.ts`)

`adversarySchema` is the single source of truth for incoming data (form submits
**and** JSON imports). Notes:

- `limiarSchema` accepts `number | null | ''` (empty string coerces to `null`).
- `dificuldade` 1–30; `pv` 0–30; `pf` 0–20; `atq` -5..15.
- A `.refine` enforces `limiarGrave > limiarMaior` when both are set.
- Use `adversarySchema.safeParse(...)` for imports; surface the first issue.

When adding fields: update the type, the schema, the `blankAdversary()` default,
the relevant form section, and the `StatsBlock` render — in that order.

## Persistence (`src/lib/storage.ts`, `src/lib/encounterStorage.ts`, `src/lib/ambienteStorage.ts`)

- Keys: `daggerhub:adversaries:v1`, `daggerhub:encounters:v1`, and
  `daggerhub:ambientes:v1`.
- Store shape: `{ version: 1, items: [...] }`. Bump the version + write a
  migration if you change the schema in a breaking way.
- `loadStore` migrates legacy `tipo` values via `LEGACY_TIPO_MAP`
  (`brutamontes → brutamonte`, `distancia → atirador`,
  `furtivo → oportunista`, `padrao → comum`, `suporte → assistente`).
  Keep this map; do not remove old keys.
- The hooks (`useAdversaryLibrary`, `useEncounterLibrary`, `useAmbienteLibrary`)
  wrap all CRUD — prefer them over calling storage directly. They auto-save on
  every state change and stamp `criadoEm`/`atualizadoEm` ISO timestamps.

## Builder UX

- `BuilderPage` instantiates `react-hook-form` with `zodResolver(adversarySchema)`,
  `mode: 'onBlur'`, and `defaultValues: blankAdversary()` (or the loaded record).
- `useAutoSuggest(form)` watches `tipo`/`patamar` and writes baseline values
  to `dificuldade`, `limiarMaior`, `limiarGrave`, `pv`, `pf`, `atq`, plus the
  first attack’s damage — **only for fields the user hasn’t dirtied**. Respect
  this: don’t aggressively reset user input.
- `applyBaselineOverride` is the explicit "reset to baseline" action behind the
  Combate "Aplicar padrões do patamar" button — it sets `shouldDirty: true`.
- The export node is rendered twice: visible preview + an off-screen copy at
  fixed width (`StatsBlock` is `w-[450px]`) used for `html-to-image` consistency.
  When tweaking `StatsBlock`, keep both renders in sync.

## Stat block render conventions (`src/components/StatsBlock/`)

- Width is fixed at 450px; styles use literal Tailwind arbitrary values
  (`text-[0.9rem]`, hex colors) so the export is deterministic regardless of
  global theme drift. Don’t replace these with theme tokens unless you also
  audit exports.
- Negative numbers use the en-dash (`–`) to match the book.
- `renderKeywords` does the bolding: it matches `**explicit**` plus the
  `KEYWORDS` table (case-insensitive, longest-first). Add new system terms to
  `KEYWORDS` rather than special-casing the renderer.

## Ambiente builder

- `AmbienteBuilderPage` mirrors `BuilderPage`: `react-hook-form` +
  `zodResolver(ambienteSchema)`, `mode: 'onBlur'`, `blankAmbiente()` defaults,
  off-screen `AmbienteBlock` for export.
- `useAmbienteAutoSuggest(form)` writes `dificuldade` and `potencialMedo` from
  `AMBIENTE_TIER_BASELINES[patamar]` for fields the user hasn't dirtied;
  `applyAmbienteBaselineOverride` is the explicit reset.
- The "Adversários sugeridos" section reuses `AddAdversaryModal` from the
  encounter feature — refs are stored as `{ id, adversaryRef, origem }` and
  resolved with `resolveAdversary` for both the preview and `AmbienteCard`.

## Encounter builder

- `calculateBudget(party, ajustes)` = `3·numPC + 2 + Σ(adjustment deltas)`.
- `entryCost(adv, qty, numPC)`: lacaios cost `ceil(qty / max(1, numPC))`;
  every other tipo costs `BATTLE_POINT_COST[tipo] · qty`.
- `balanceVerdict(budget, total)` returns `'abaixo' | 'equilibrado' | 'acima'`
  using `BALANCE_TOLERANCE = 0`.
- The encounter builder reads from both the user library and the static
  bestiary; entries store `{ adversaryRef, origem }` so the resolver can route.

## Export (`src/lib/export.ts`)

- `exportPng` / `exportPdf` rasterize the chosen DOM node with
  `html-to-image` at `pixelRatio: 2`. PDF page size is the node’s pixel
  dimensions; orientation is auto-picked.
- `exportJson(adversary)` writes pretty JSON; filenames use `slugify(nome)`.
- `parseJsonImport(file)` validates with `adversarySchema` and returns the
  first zod issue. The library import flow re-IDs on collision.

## Conventions & house style

- **Language:** comments, error messages, UI labels, and route segments are
  pt-BR. Internal identifiers/types stay English-conforming where natural
  (e.g. `Adversary`, `Encounter`) but enum **values** are pt-BR keywords
  (`'brutamonte'`, `'lider'`, `'lacaio'`). Don’t rename enum values without
  also adding them to `LEGACY_TIPO_MAP`.
- **Imports:** prefer the `@/...` alias over deep relative paths.
- **IDs:** generate with `nanoid(10)` for top-level entities, `nanoid(8)` for
  nested rows (attacks, abilities, experiences, encounter entries).
- **Components:** functional, named exports (`export function Foo()`); prefer
  `forwardRef` when a parent needs the DOM node (see `Button`, `StatsBlock`).
- **Styling:** Tailwind utility classes; use `clsx` for conditional classes.
  Custom colors `parchment`, `ink`, `gold` and fonts `font-display` (Cinzel) /
  default serif (Cormorant Garamond) come from `tailwind.config.js`.
- **Keep diffs scoped.** Don’t reshuffle unrelated files when fixing a bug.
- **No new top-level dependencies** without a clear reason; this is a tiny
  static app. Prefer composing what’s already installed.

## Deployment

`.github/workflows/deploy.yml` runs on pushes to `master`, `main`, or the
`claude/stats-block-generator-JAHMr` branch (and on manual `workflow_dispatch`).
It builds with `VITE_BASE=/DaggerHub/`, drops a `dist/.nojekyll`, then publishes
via `actions/deploy-pages@v4`.

For a custom-domain deploy, rebuild with `VITE_BASE=/`. The base is read in
`vite.config.ts` (defaults to `/DaggerHub/`).

## Working in this repo (Claude-specific)

- The active development branch (per harness instructions) is
  `claude/add-claude-documentation-pcQVs`. Develop, commit, and push there.
  Open PRs as **draft** by default.
- The GitHub MCP scope is restricted to `erickcassoli/daggerhub`. Do not call
  GitHub APIs against any other repo.
- `docs/*.pdf`, `docs/*_raw.txt`, `docs/extracted_*.txt`, and
  `docs/bestiario_parsed.json` are gitignored (copyrighted source material) —
  never commit them. The parser in `docs/parse_bestiary.py` is the only
  artifact retained from that pipeline; treat it as a one-shot reference.
- After UI changes, prefer running `npm run typecheck` and (for non-trivial
  changes) `npm run build`. There is no test suite to run.
- When you can’t actually exercise the UI, say so explicitly rather than
  claiming a feature works.
