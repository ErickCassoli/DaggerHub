import { Navigate, Route, Routes } from 'react-router-dom';
import { LibraryPage } from './pages/LibraryPage';
import { BuilderPage } from './pages/BuilderPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LibraryPage />} />
      <Route path="/new" element={<BuilderPage />} />
      <Route path="/edit/:id" element={<BuilderPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
