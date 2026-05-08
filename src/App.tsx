import { lazy, Suspense } from 'react';
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

export default function App() {
  return (
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
  );
}
