import { useCallback, useEffect, useState } from 'react';

function loadFavorites(storageKey: string): Set<string> {
  if (typeof localStorage === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return new Set();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed as string[]);
  } catch {
    return new Set();
  }
}

function saveFavorites(storageKey: string, favorites: Set<string>): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(storageKey, JSON.stringify([...favorites]));
  } catch {
    // quota cheia / modo privado — favoritos seguem só em memória
  }
}

/** Conjunto de IDs favoritados persistido em localStorage sob `storageKey`. */
export function useFavorites(storageKey: string) {
  const [favorites, setFavorites] = useState<Set<string>>(() => loadFavorites(storageKey));

  const toggle = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else {
          next.add(id);
        }
        return next;
      });
    },
    [],
  );

  // Persistir fora do updater: ele pode rodar duas vezes em StrictMode.
  useEffect(() => {
    saveFavorites(storageKey, favorites);
  }, [storageKey, favorites]);

  return { favorites, toggle };
}
