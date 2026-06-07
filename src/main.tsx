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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
);
