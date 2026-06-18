import { Component, Fragment, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { Navigate, Route, Routes, useParams } from 'react-router-dom';

const LibraryPage = lazy(() =>
  import('./pages/LibraryPage').then((m) => ({ default: m.LibraryPage })),
);
const BuilderPage = lazy(() =>
  import('./pages/BuilderPage').then((m) => ({ default: m.BuilderPage })),
);
const BestiarioPage = lazy(() =>
  import('./pages/BestiarioPage').then((m) => ({ default: m.BestiarioPage })),
);
const EncountersPage = lazy(() =>
  import('./pages/EncountersPage').then((m) => ({ default: m.EncountersPage })),
);
const EncounterBuilderPage = lazy(() =>
  import('./pages/EncounterBuilderPage').then((m) => ({ default: m.EncounterBuilderPage })),
);
const AmbientesPage = lazy(() =>
  import('./pages/AmbientesPage').then((m) => ({ default: m.AmbientesPage })),
);
const AmbienteBuilderPage = lazy(() =>
  import('./pages/AmbienteBuilderPage').then((m) => ({ default: m.AmbienteBuilderPage })),
);
const TransformacoesPage = lazy(() =>
  import('./pages/TransformacoesPage').then((m) => ({ default: m.TransformacoesPage })),
);
const TransformacaoBuilderPage = lazy(() =>
  import('./pages/TransformacaoBuilderPage').then((m) => ({
    default: m.TransformacaoBuilderPage,
  })),
);
const SharePage = lazy(() =>
  import('./pages/SharePage').then((m) => ({ default: m.SharePage })),
);

/**
 * Remonta a página quando o `:id` da rota muda (ou entre `/new` e `/edit/:id`).
 * Os builders inicializam o form apenas na montagem; sem isso, navegar de
 * `/edit/:id` para `/new` manteria o registro carregado no form.
 */
function Keyed({ children }: { children: ReactNode }) {
  const { id } = useParams();
  return <Fragment key={id ?? 'new'}>{children}</Fragment>;
}

function PageLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-ink/50">Carregando…</p>
    </div>
  );
}

class ChunkErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo) {
    const isChunkError =
      error.message.includes('dynamically imported module') ||
      error.message.includes('Loading chunk') ||
      error.message.includes('Failed to fetch');

    if (isChunkError) {
      const key = 'daggerhub:chunk-reload';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
          <p className="font-display text-lg text-ink">
            Nova versão disponível
          </p>
          <p className="text-sm text-ink/70">
            O aplicativo foi atualizado. Recarregue a página para continuar.
          </p>
          <button
            onClick={() => {
              sessionStorage.removeItem('daggerhub:chunk-reload');
              location.reload();
            }}
            className="rounded bg-ink px-4 py-2 text-sm font-semibold uppercase tracking-wide text-parchment"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ChunkErrorBoundary>
      <Suspense fallback={<PageLoading />}>
        <Routes>
          <Route path="/" element={<LibraryPage />} />
          <Route path="/new" element={<Keyed><BuilderPage /></Keyed>} />
          <Route path="/edit/:id" element={<Keyed><BuilderPage /></Keyed>} />
          <Route path="/bestiario" element={<BestiarioPage />} />
          <Route path="/encounters" element={<EncountersPage />} />
          <Route path="/encounters/new" element={<Keyed><EncounterBuilderPage /></Keyed>} />
          <Route path="/encounters/edit/:id" element={<Keyed><EncounterBuilderPage /></Keyed>} />
          <Route path="/ambientes" element={<AmbientesPage />} />
          <Route path="/ambientes/new" element={<Keyed><AmbienteBuilderPage /></Keyed>} />
          <Route path="/ambientes/edit/:id" element={<Keyed><AmbienteBuilderPage /></Keyed>} />
          <Route path="/transformacoes" element={<TransformacoesPage />} />
          <Route path="/transformacoes/new" element={<Keyed><TransformacaoBuilderPage /></Keyed>} />
          <Route path="/transformacoes/edit/:id" element={<Keyed><TransformacaoBuilderPage /></Keyed>} />
          <Route path="/share" element={<SharePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
}
