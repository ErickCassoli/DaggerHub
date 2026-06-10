import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { initTheme } from '@/lib/theme';

// Apply stored or system theme before first render to avoid flash.
initTheme();

window.addEventListener('vite:preloadError', () => {
  const key = 'daggerhub:chunk-reload';
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    location.reload();
  }
});

// Após 30s estáveis, libera o guard para que um próximo deploy mid-sessão
// também consiga recarregar automaticamente. O atraso evita loop de reload
// quando o recarregamento não resolve a falha de chunk.
window.setTimeout(() => {
  sessionStorage.removeItem('daggerhub:chunk-reload');
}, 30_000);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
