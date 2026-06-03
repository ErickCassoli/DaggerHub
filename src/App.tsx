import { Component, lazy, Suspense, type ErrorInfo, type ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

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
          <Route path="/new" element={<BuilderPage />} />
          <Route path="/edit/:id" element={<BuilderPage />} />
          <Route path="/bestiario" element={<BestiarioPage />} />
          <Route path="/encounters" element={<EncountersPage />} />
          <Route path="/encounters/new" element={<EncounterBuilderPage />} />
          <Route path="/encounters/edit/:id" element={<EncounterBuilderPage />} />
          <Route path="/ambientes" element={<AmbientesPage />} />
          <Route path="/ambientes/new" element={<AmbienteBuilderPage />} />
          <Route path="/ambientes/edit/:id" element={<AmbienteBuilderPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ChunkErrorBoundary>
  );
}
