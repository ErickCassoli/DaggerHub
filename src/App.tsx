import { Navigate, Route, Routes } from 'react-router-dom';
import { LibraryPage } from './pages/LibraryPage';
import { BuilderPage } from './pages/BuilderPage';
import { BestiarioPage } from './pages/BestiarioPage';
import { EncountersPage } from './pages/EncountersPage';
import { EncounterBuilderPage } from './pages/EncounterBuilderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
      <Route path="/new" element={<BuilderPage />} />
      <Route path="/edit/:id" element={<BuilderPage />} />
      <Route path="/bestiario" element={<BestiarioPage />} />
      <Route path="/encounters" element={<EncountersPage />} />
      <Route path="/encounters/new" element={<EncounterBuilderPage />} />
      <Route path="/encounters/edit/:id" element={<EncounterBuilderPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
